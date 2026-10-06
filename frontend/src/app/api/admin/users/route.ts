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
 * GET /api/admin/users
 * List all users with search, role, and status filters.
 * Returns { users, stats }.
 */
export async function GET(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';
  const status = searchParams.get('status') || '';

  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role && role !== 'all') query.role = role.toUpperCase();
  if (status && status !== 'all') query.status = status;

  const [allUsers, passkeys] = await Promise.all([
    db.collection('users').find(query, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray(),
    db.collection('passkeys').find({}, { projection: { _id: 0, userId: 1 } }).toArray(),
  ]);

  const pCounts = passkeys.reduce<Record<string, number>>((acc, p) => {
    acc[p.userId] = (acc[p.userId] || 0) + 1;
    return acc;
  }, {});

  const users = allUsers.map(u => ({
    ...u,
    status: u.status || 'active',
    passkey_count: pCounts[u.user_id] || 0,
  }));

  // Compute admin stats
  const totalUsers = await db.collection('users').countDocuments();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeToday = await db.collection('users').countDocuments({ last_login: { $gte: oneDayAgo } });
  const threatsBlocked = await db.collection('audit_logs').countDocuments({ action: { $in: ['THREAT_BLOCKED', 'TRANSACTION_BLOCKED', 'LOGIN_BLOCKED'] } });

  return NextResponse.json({
    users,
    stats: {
      totalUsers,
      activeToday,
      threatsBlocked,
      systemHealth: 'Optimal',
    },
  });
}

/**
 * PATCH /api/admin/users
 * Update a user's status (suspend / reactivate).
 * Body: { userId, status }
 */
export async function PATCH(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { userId, status: newStatus } = body;

  if (!userId || !newStatus) {
    return NextResponse.json({ error: 'userId and status are required' }, { status: 400 });
  }
  if (newStatus !== 'active' && newStatus !== 'suspended') {
    return NextResponse.json({ error: 'Invalid status. Must be "active" or "suspended"' }, { status: 400 });
  }
  if (userId === user.user_id) {
    return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 });
  }

  const result = await db.collection('users').findOneAndUpdate(
    { user_id: userId },
    { $set: { status: newStatus, updated_at: new Date() } },
    { returnDocument: 'after', projection: { _id: 0 } },
  );
  if (!result) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // If suspended, invalidate all sessions
  if (newStatus === 'suspended') {
    await db.collection('user_sessions').deleteMany({ user_id: userId });
  }

  await recordAudit(db, {
    action: newStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
    actor: user.email,
    target: result.email,
    severity: 'HIGH',
    details: `User ${newStatus === 'suspended' ? 'suspended' : 'reactivated'} by ${user.email}`,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ ok: true, user: result });
}

/**
 * DELETE /api/admin/users
 * Delete a user and all associated data.
 * Body: { userId }
 */
export async function DELETE(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { userId } = body;

  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  if (userId === user.user_id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const target = await db.collection('users').findOne({ user_id: userId }, { projection: { _id: 0 } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Remove user, sessions, passkeys, and their challenges
  await Promise.all([
    db.collection('users').deleteOne({ user_id: userId }),
    db.collection('user_sessions').deleteMany({ user_id: userId }),
    db.collection('passkeys').deleteMany({ userId }),
    db.collection('passkey_challenges').deleteMany({ userId }),
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
