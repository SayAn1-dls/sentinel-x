import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser, getClientIp } from '@/lib/server/auth';
import { recordAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'sayanbhatt2005@gmail.com';

function isAdmin(user: { role: string; email: string }) {
  return user.role === 'ADMIN' || user.email === ADMIN_EMAIL;
}

/**
 * GET /api/admin/users/[id]
 * Fetch a single user's full profile, passkeys, and recent audit logs.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  const target = await db.collection('users').findOne({ user_id: id }, { projection: { _id: 0 } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Fetch passkeys
  const passkeys = await db.collection('passkeys')
    .find({ userId: id }, { projection: { _id: 0 } })
    .toArray();

  const formattedPasskeys = passkeys.map((pk, idx) => ({
    id: pk.credentialID || pk.id || `pk-${idx}`,
    label: pk.label || pk.deviceType || `Passkey ${idx + 1}`,
    createdAt: pk.createdAt || pk.created_at,
    lastUsedAt: pk.lastUsedAt || pk.last_used_at,
    deviceType: pk.deviceType || 'Unknown',
  }));

  // Fetch recent audit logs for this user
  const auditLogs = await db.collection('audit_logs')
    .find(
      { $or: [{ actor: target.email }, { target: target.email }, { target: target.user_id }] },
      { projection: { _id: 0 } },
    )
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({
    user: {
      ...target,
      status: target.status || 'active',
      passkeys: formattedPasskeys,
    },
    auditLogs,
  });
}

/**
 * PATCH /api/admin/users/[id]
 * Update a user's status, role, or revoke a passkey.
 * Body: { status?, role?, revokePasskey? }
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  if (id === user.user_id) {
    return NextResponse.json({ error: 'Cannot modify your own account from admin panel' }, { status: 400 });
  }

  const target = await db.collection('users').findOne({ user_id: id }, { projection: { _id: 0 } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  // Handle passkey revocation
  if (body.revokePasskey) {
    const passkeyId = body.revokePasskey;
    const deleteResult = await db.collection('passkeys').deleteOne({
      userId: id,
      $or: [{ credentialID: passkeyId }, { id: passkeyId }],
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: 'Passkey not found' }, { status: 404 });
    }

    await recordAudit(db, {
      action: 'PASSKEY_REVOKED',
      actor: user.email,
      target: target.email,
      severity: 'HIGH',
      details: `Passkey ${passkeyId.slice(0, 12)}... revoked for ${target.email} by admin`,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ ok: true, message: 'Passkey revoked' });
  }

  // Handle status change
  const updates: Record<string, unknown> = { updated_at: new Date() };
  const auditActions: string[] = [];

  if (body.status && (body.status === 'active' || body.status === 'suspended')) {
    updates.status = body.status;
    auditActions.push(body.status === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED');

    // Invalidate sessions on suspension
    if (body.status === 'suspended') {
      await db.collection('user_sessions').deleteMany({ user_id: id });
    }
  }

  if (body.role && (body.role === 'ADMIN' || body.role === 'ANALYST')) {
    updates.role = body.role;
    auditActions.push('ROLE_CHANGED');
  }

  if (Object.keys(updates).length <= 1) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const result = await db.collection('users').findOneAndUpdate(
    { user_id: id },
    { $set: updates },
    { returnDocument: 'after', projection: { _id: 0 } },
  );

  for (const action of auditActions) {
    await recordAudit(db, {
      action,
      actor: user.email,
      target: target.email,
      severity: 'HIGH',
      details: `${action.replace(/_/g, ' ').toLowerCase()} for ${target.email} by ${user.email}`,
      ipAddress: getClientIp(req),
    });
  }

  return NextResponse.json({ ok: true, user: result });
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user and all associated data.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  if (id === user.user_id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const target = await db.collection('users').findOne({ user_id: id }, { projection: { _id: 0 } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await Promise.all([
    db.collection('users').deleteOne({ user_id: id }),
    db.collection('user_sessions').deleteMany({ user_id: id }),
    db.collection('passkeys').deleteMany({ userId: id }),
    db.collection('passkey_challenges').deleteMany({ userId: id }),
  ]);

  await recordAudit(db, {
    action: 'USER_DELETED',
    actor: user.email,
    target: target.email,
    severity: 'CRITICAL',
    details: `User "${target.name}" (${target.email}) permanently deleted by ${user.email}`,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
