import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser, getClientIp } from '@/lib/server/auth';
import { ensureSeeded } from '@/lib/server/seed';
import { recordAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  await ensureSeeded(db);

  const col = db.collection('gateways');
  const gateways = await col.find().toArray();
  const anyUnlocked = gateways.some(g => !g.locked);

  if (anyUnlocked) {
    await col.updateMany({}, { $set: { locked: true, status: 'OFFLINE', lastChecked: Date.now() } });
    await recordAudit(db, {
      action: 'LOCK_GATEWAYS',
      actor: user.email,
      target: 'ALL_GATEWAYS',
      severity: 'CRITICAL',
      details: `Emergency lockdown: ${gateways.length} network gateways forced offline`,
      ipAddress: getClientIp(req),
    });
    return NextResponse.json({ locked: true, count: gateways.length });
  }

  await col.updateMany({}, { $set: { locked: false, status: 'ONLINE', lastChecked: Date.now() } });
  await recordAudit(db, {
    action: 'UNLOCK_GATEWAYS',
    actor: user.email,
    target: 'ALL_GATEWAYS',
    severity: 'HIGH',
    details: `Lockdown lifted: ${gateways.length} network gateways restored online`,
    ipAddress: getClientIp(req),
  });
  return NextResponse.json({ locked: false, count: gateways.length });
}
