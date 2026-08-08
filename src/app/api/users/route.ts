import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = await getDb();
  const user = await getSessionUser(db, req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const users = await db.collection('users').find({}, { projection: { _id: 0 } }).sort({ created_at: 1 }).toArray();
  const passkeys = await db.collection('passkeys').find({}, { projection: { _id: 0, userId: 1 } }).toArray();
  const counts = passkeys.reduce<Record<string, number>>((acc, p) => {
    acc[p.userId] = (acc[p.userId] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    data: users.map(u => ({ ...u, passkey_count: counts[u.user_id] || 0 })),
  });
}
