import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser } from '@/lib/server/auth';
import { ensureSeeded } from '@/lib/server/seed';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  await ensureSeeded(db);

  const dayAgo = Date.now() - 24 * 3600 * 1000;
  const hourAgo = Date.now() - 3600 * 1000;

  const [total, flaggedToday, blocked, activeScans, highRisk, gateways] = await Promise.all([
    db.collection('transactions').countDocuments(),
    db.collection('transactions').countDocuments({ status: 'FLAGGED', timestamp: { $gte: dayAgo } }),
    db.collection('transactions').countDocuments({ status: 'BLOCKED' }),
    db.collection('scans').countDocuments({ timestamp: { $gte: hourAgo } }),
    db.collection('transactions').countDocuments({ threatLevel: { $in: ['CRITICAL', 'HIGH'] } }),
    db.collection('gateways').find().toArray(),
  ]);

  const online = gateways.filter(g => g.status === 'ONLINE').length;
  const networkHealth = gateways.length ? Math.round((online / gateways.length) * 100) : 0;
  const threatIndex = total ? Math.round((highRisk / total) * 100) : 0;

  return NextResponse.json({
    totalTransactions: total,
    flaggedToday,
    blockedThreats: blocked,
    activeScans,
    networkHealth,
    threatIndex,
  });
}
