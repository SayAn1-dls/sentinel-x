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
  const body = await req.json().catch(() => ({}));
  const action = body.action;

  if (action === 'resolve') {
    const result = await db.collection('alerts').updateOne({ id }, { $set: { resolved: true } });
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    await recordAudit(db, {
      action: 'RESOLVE_ALERT',
      actor: user.email,
      target: id,
      severity: 'LOW',
      details: 'Threat alert resolved by operator',
      ipAddress: getClientIp(req),
    });
    return NextResponse.json({ ok: true });
  }

  if (action === 'dismiss') {
    const result = await db.collection('alerts').deleteOne({ id });
    if (result.deletedCount === 0) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    await recordAudit(db, {
      action: 'DISMISS_ALERT',
      actor: user.email,
      target: id,
      severity: 'CLEAR',
      details: 'Threat alert dismissed by operator',
      ipAddress: getClientIp(req),
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
