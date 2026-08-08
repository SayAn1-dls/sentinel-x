import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser, getRpInfo, getClientIp } from '@/lib/server/auth';
import { recordAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

function deviceLabel(ua: string | null): string {
  if (!ua) return 'Unknown device';
  if (/iPhone|iPad/i.test(ua)) return 'iOS device (Face ID / Touch ID)';
  if (/Android/i.test(ua)) return 'Android device (Fingerprint)';
  if (/Macintosh/i.test(ua)) return 'Mac (Touch ID)';
  if (/Windows/i.test(ua)) return 'Windows (Hello)';
  return 'Passkey device';
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json();
  const ch = await db.collection('webauthn_challenges').findOneAndDelete({
    userId: user.user_id,
    type: 'registration',
    expiresAt: { $gt: new Date() },
  });
  if (!ch) return NextResponse.json({ error: 'Invalid or expired challenge' }, { status: 400 });

  const { rpID, origin } = getRpInfo(req);
  try {
    const v = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: ch.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
    if (!v.verified || !v.registrationInfo) throw new Error('Not verified');

    const { credential, credentialDeviceType, credentialBackedUp } = v.registrationInfo;
    await db.collection('passkeys').insertOne({
      userId: user.user_id,
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      transports: body.response?.transports ?? credential.transports ?? [],
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      label: deviceLabel(req.headers.get('user-agent')),
      createdAt: new Date(),
    });

    await recordAudit(db, {
      action: 'PASSKEY_REGISTERED',
      actor: user.email,
      target: credential.id.slice(0, 16),
      severity: 'LOW',
      details: 'Biometric passkey registered for account',
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json({ error: 'Registration verification failed' }, { status: 400 });
  }
}
