import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser, getClientIp } from '@/lib/server/auth';
import { recordAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  if (id === user.user_id) return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const role = body.role;
  if (role !== 'ADMIN' && role !== 'ANALYST') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const result = await db.collection('users').findOneAndUpdate(
    { user_id: id },
    { $set: { role } },
    { returnDocument: 'after', projection: { _id: 0 } }
  );
  if (!result) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await recordAudit(db, {
    action: 'ROLE_CHANGED',
    actor: user.email,
    target: result.email,
    severity: 'HIGH',
    details: `Role changed to ${role} by ${user.email}`,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ data: result });
}
