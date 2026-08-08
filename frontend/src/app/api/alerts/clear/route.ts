import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser, getClientIp } from '@/lib/server/auth';
import { recordAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const result = await db.collection('alerts').updateMany(
    { resolved: false, level: { $ne: 'CRITICAL' } },
    { $set: { resolved: true } }
  );

  await recordAudit(db, {
    action: 'CLEAR_ALERTS',
    actor: user.email,
    target: 'ALERT_QUEUE',
    severity: 'LOW',
    details: `Bulk-resolved ${result.modifiedCount} non-critical alerts`,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ resolved: result.modifiedCount });
}
