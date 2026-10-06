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

  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get('active') === 'true';
  const level = searchParams.get('level');

  const query: Record<string, unknown> = {};
  if (activeOnly) query.resolved = false;
  if (level) query.level = level.toUpperCase();

  const data = await db.collection('alerts').find(query, { projection: { _id: 0 } }).sort({ timestamp: -1 }).limit(100).toArray();
  const [total, active, critical, high] = await Promise.all([
    db.collection('alerts').countDocuments(),
    db.collection('alerts').countDocuments({ resolved: false }),
    db.collection('alerts').countDocuments({ resolved: false, level: 'CRITICAL' }),
    db.collection('alerts').countDocuments({ resolved: false, level: 'HIGH' }),
  ]);

  return NextResponse.json({ data, summary: { total, active, critical, high }, timestamp: Date.now() });
}
