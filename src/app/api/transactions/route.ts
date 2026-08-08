import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser, getClientIp } from '@/lib/server/auth';
import { ensureSeeded } from '@/lib/server/seed';
import { generateTransaction } from '@/lib/server/txgen';
import { recordAudit } from '@/lib/server/audit';
import { generateId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  await ensureSeeded(db);

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
  const status = searchParams.get('status');
  const threat = searchParams.get('threat');
  const live = searchParams.get('live') === '1';

  if (live && Math.random() < 0.45) {
    const tx = generateTransaction();
    await db.collection('transactions').insertOne({ ...tx });
    if (tx.riskScore >= 85) {
      await db.collection('alerts').insertOne({
        id: generateId(),
        timestamp: tx.timestamp,
        level: tx.threatLevel,
        message: `${tx.flags[0] ?? 'RISK_SIGNAL'} detected on ${tx.sender} → ${tx.receiver}`,
        source: 'FORENSIC_ENGINE_V4',
        resolved: false,
        transactionId: tx.id,
      });
    }
  }

  const query: Record<string, unknown> = {};
  if (status) query.status = status.toUpperCase();
  if (threat) query.threatLevel = threat.toUpperCase();

  const [data, total] = await Promise.all([
    db.collection('transactions').find(query, { projection: { _id: 0 } }).sort({ timestamp: -1 }).limit(limit).toArray(),
    db.collection('transactions').countDocuments(query),
  ]);

  return NextResponse.json({ data, total, timestamp: Date.now() });
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const tx = generateTransaction({
    ...(body.amount ? { amount: Number(body.amount) } : {}),
    ...(body.sender ? { sender: String(body.sender).toUpperCase() } : {}),
    ...(body.receiver ? { receiver: String(body.receiver).toUpperCase() } : {}),
    ...(body.currency ? { currency: String(body.currency).toUpperCase() } : {}),
  });
  await db.collection('transactions').insertOne({ ...tx });
  await recordAudit(db, {
    action: 'TX_CREATED',
    actor: user.email,
    target: tx.id,
    severity: tx.threatLevel,
    details: `Manual transaction injected: ${tx.sender} → ${tx.receiver}`,
    ipAddress: getClientIp(req),
  });
  return NextResponse.json({ data: tx, created: true }, { status: 201 });
}
