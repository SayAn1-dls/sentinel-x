import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser, getClientIp } from '@/lib/server/auth';
import { recordAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const result = await db.collection('transactions').findOneAndUpdate(
    { id },
    { $set: { status: 'BLOCKED' } },
    { returnDocument: 'after', projection: { _id: 0 } }
  );
  if (!result) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  await recordAudit(db, {
    action: 'BLOCK_TRANSACTION',
    actor: user.email,
    target: id,
    severity: 'HIGH',
    details: `Transaction manually blocked by ${user.role}`,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: result });
}
