import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser, getRpInfo } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { rpID, rpName } = getRpInfo(req);
  const existing = await db.collection('passkeys').find({ userId: user.user_id }).toArray();

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(user.user_id),
    userName: user.email,
    userDisplayName: user.name,
    attestationType: 'none',
    excludeCredentials: existing.map(c => ({ id: c.id, transports: c.transports })),
    authenticatorSelection: {
      residentKey: 'required',
      requireResidentKey: true,
      userVerification: 'required',
    },
  });

  await db.collection('webauthn_challenges').insertOne({
    userId: user.user_id,
    type: 'registration',
    challenge: options.challenge,
    expiresAt: new Date(Date.now() + 5 * 60_000),
  });

  return NextResponse.json({ options }, { headers: { 'Cache-Control': 'no-store' } });
}
