import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser, getClientIp } from '@/lib/server/auth';
import { ensureSeeded } from '@/lib/server/seed';
import { recordAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  await ensureSeeded(db);

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
  const severity = searchParams.get('severity');
  const actor = searchParams.get('actor');
  const from = searchParams.get('from') ? parseInt(searchParams.get('from')!) : 0;
  const to = searchParams.get('to') ? parseInt(searchParams.get('to')!) : Date.now();

  const query: Record<string, unknown> = { timestamp: { $gte: from, $lte: to } };
  if (severity) query.severity = severity.toUpperCase();
  if (actor) query.actor = { $regex: actor, $options: 'i' };

  const [data, total] = await Promise.all([
    db.collection('audit_logs').find(query, { projection: { _id: 0 } }).sort({ timestamp: -1 }).limit(limit).toArray(),
    db.collection('audit_logs').countDocuments(query),
  ]);

  return NextResponse.json({ data, total, timestamp: Date.now() });
}

const ALLOWED_CLIENT_ACTIONS = ['EXPORT_REPORT'];

export async function POST(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!ALLOWED_CLIENT_ACTIONS.includes(body.action)) {
    return NextResponse.json({ error: 'Action not permitted' }, { status: 400 });
  }

  await recordAudit(db, {
    action: body.action,
    actor: user.email,
    target: 'FORENSIC_REPORT',
    severity: 'LOW',
    details: typeof body.details === 'string' ? body.details.slice(0, 300) : 'Forensic report exported',
    ipAddress: getClientIp(req),
  });
  return NextResponse.json({ ok: true });
}
