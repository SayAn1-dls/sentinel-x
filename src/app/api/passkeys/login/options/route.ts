import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { getDb } from '@/lib/server/mongo';
import { getRpInfo } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = await getDb();
  const { rpID } = getRpInfo(req);

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'required',
    allowCredentials: [],
  });

  const flowId = crypto.randomUUID();
  await db.collection('webauthn_challenges').insertOne({
    flowId,
    type: 'authentication',
    challenge: options.challenge,
    expiresAt: new Date(Date.now() + 5 * 60_000),
  });

  return NextResponse.json({ options, flowId }, { headers: { 'Cache-Control': 'no-store' } });
}
