import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { Binary } from 'mongodb';
import { getDb } from '@/lib/server/mongo';
import { getRpInfo, createSession, getClientIp, SESSION_COOKIE } from '@/lib/server/auth';
import { recordAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

function toUint8(pk: unknown): Uint8Array {
  if (pk instanceof Binary) return new Uint8Array(pk.buffer);
  if (pk instanceof Uint8Array) return new Uint8Array(pk);
  return new Uint8Array(pk as ArrayBuffer);
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const { flowId, credential } = await req.json().catch(() => ({}));
  if (!flowId || !credential?.id) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const ch = await db.collection('webauthn_challenges').findOneAndDelete({
    flowId,
    type: 'authentication',
    expiresAt: { $gt: new Date() },
  });
  if (!ch) return NextResponse.json({ error: 'Invalid or expired challenge' }, { status: 400 });

  const stored = await db.collection('passkeys').findOne({ id: credential.id });
  if (!stored) return NextResponse.json({ error: 'No passkey registered on this device. Sign in with Google first, then enable biometrics.' }, { status: 404 });

  const { rpID, origin } = getRpInfo(req);
  try {
    const v = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: ch.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: stored.id,
        publicKey: toUint8(stored.publicKey),
        counter: stored.counter,
        transports: stored.transports,
      },
      requireUserVerification: true,
    });
    if (!v.verified) throw new Error('Not verified');

    await db.collection('passkeys').updateOne(
      { id: stored.id },
      { $set: { counter: v.authenticationInfo.newCounter, lastUsedAt: new Date() } }
    );

    const user = await db.collection('users').findOne({ user_id: stored.userId }, { projection: { _id: 0 } });
    if (!user) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    await db.collection('users').updateOne({ user_id: user.user_id }, { $set: { last_login: new Date() } });
    const { sessionToken } = await createSession(db, user.user_id);
    await recordAudit(db, {
      action: 'PASSKEY_LOGIN',
      actor: user.email,
      target: user.user_id,
      severity: 'LOW',
      details: 'Biometric passkey authentication successful',
      ipAddress: getClientIp(req),
      sessionId: sessionToken.slice(0, 12),
    });

    const res = NextResponse.json({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
    });
    res.cookies.set('session_token', sessionToken, SESSION_COOKIE);
    return res;
  } catch {
    return NextResponse.json({ error: 'Biometric authentication failed' }, { status: 401 });
  }
}
