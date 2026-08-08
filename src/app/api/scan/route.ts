import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser, getClientIp } from '@/lib/server/auth';
import { ensureSeeded } from '@/lib/server/seed';
import { recordAudit } from '@/lib/server/audit';
import { aiScanner } from '@/lib/ai-scanner';
import { Transaction } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  await ensureSeeded(db);

  const body = await req.json().catch(() => ({}));
  const target = body.target ? String(body.target).toUpperCase() : null;
  if (!target) return NextResponse.json({ error: 'Target entity required' }, { status: 400 });

  const matched = await db.collection('transactions')
    .find({ $or: [{ sender: { $regex: target, $options: 'i' } }, { receiver: { $regex: target, $options: 'i' } }] }, { projection: { _id: 0 } })
    .sort({ timestamp: -1 }).limit(500).toArray();

  const scope = matched.length > 0
    ? matched
    : await db.collection('transactions').find({}, { projection: { _id: 0 } }).sort({ timestamp: -1 }).limit(500).toArray();

  const result = await aiScanner.scan(target, scope as unknown as Transaction[]);
  await db.collection('scans').insertOne({ ...result, scopeSize: scope.length, targetMatches: matched.length, initiatedBy: user.email });

  await recordAudit(db, {
    action: 'SCAN_INIT',
    actor: user.email,
    target,
    severity: result.threatLevel,
    details: `AI forensic scan: ${result.findings.length} findings, ${result.confidence}% confidence across ${scope.length} transactions`,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: result, model: aiScanner.version, timestamp: Date.now() });
}

export async function GET(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const recentScans = await db.collection('scans').find({}, { projection: { _id: 0 } }).sort({ timestamp: -1 }).limit(8).toArray();
  return NextResponse.json({
    status: 'OPERATIONAL',
    model: aiScanner.version,
    modules: ['SMURFING_DETECTOR', 'LAYERING_ANALYZER', 'ROUND_TRIP_TRACER', 'VELOCITY_ENGINE'],
    recentScans,
    timestamp: Date.now(),
  });
}
