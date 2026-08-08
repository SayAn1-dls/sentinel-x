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

  const col = db.collection('gateways');
  const gateways = await col.find({}, { projection: { _id: 0 } }).toArray();

  const updated = gateways.map(gw => {
    const latency = Math.max(5, Math.min(250, gw.latency + Math.floor((Math.random() - 0.5) * 14)));
    let status = gw.status;
    if (Math.random() < 0.04) status = status === 'ONLINE' ? 'DEGRADED' : 'ONLINE';
    return { ...gw, latency, status, lastChecked: Date.now() };
  });
  if (!updated.some(g => g.status === 'ONLINE')) updated[0].status = 'ONLINE';

  await Promise.all(updated.map(gw =>
    col.updateOne({ id: gw.id }, { $set: { latency: gw.latency, status: gw.status, lastChecked: gw.lastChecked } })
  ));

  const online = updated.filter(g => g.status === 'ONLINE');
  const healthScore = Math.round((online.length / updated.length) * 100);
  const avgLatency = online.length ? Math.round(online.reduce((s, g) => s + g.latency, 0) / online.length) : 0;

  return NextResponse.json({
    gateways: updated,
    stats: {
      total: updated.length,
      online: online.length,
      offline: updated.filter(g => g.status === 'OFFLINE').length,
      degraded: updated.filter(g => g.status === 'DEGRADED').length,
      healthScore,
      avgLatency,
    },
    timestamp: Date.now(),
  });
}
