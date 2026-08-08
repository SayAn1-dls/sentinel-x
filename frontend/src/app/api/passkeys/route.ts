import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser, getClientIp } from '@/lib/server/auth';
import { recordAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const passkeys = await db.collection('passkeys')
    .find({ userId: user.user_id }, { projection: { _id: 0, publicKey: 0, counter: 0 } })
    .toArray();
  return NextResponse.json({ data: passkeys });
}

export async function DELETE(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const result = await db.collection('passkeys').deleteOne({ userId: user.user_id, id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Passkey not found' }, { status: 404 });
  }
  await recordAudit(db, {
    action: 'PASSKEY_REMOVED',
    actor: user.email,
    target: id.slice(0, 16),
    severity: 'MEDIUM',
    details: 'Biometric passkey removed from account',
    ipAddress: getClientIp(req),
  });
  return NextResponse.json({ ok: true });
}
