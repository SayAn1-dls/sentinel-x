import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/server/mongo';
import { createSession, getClientIp, SESSION_COOKIE } from '@/lib/server/auth';
import { recordAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sessionId = body.session_id;
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 });
  }

  const authRes = await fetch('https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data', {
    headers: { 'X-Session-ID': sessionId },
  });
  if (!authRes.ok) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
  const data = await authRes.json();

  const db = await getDb();
  let user = await db.collection('users').findOne({ email: data.email }, { projection: { _id: 0 } });
  if (!user) {
    const isFirst = (await db.collection('users').countDocuments()) === 0;
    const newUser = {
      user_id: `user_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
      email: data.email,
      name: data.name,
      picture: data.picture,
      role: isFirst ? 'ADMIN' : 'ANALYST',
      created_at: new Date(),
      last_login: new Date(),
    };
    await db.collection('users').insertOne({ ...newUser });
    user = newUser as never;
  } else {
    await db.collection('users').updateOne(
      { email: data.email },
      { $set: { name: data.name, picture: data.picture, last_login: new Date() } }
    );
  }

  const { sessionToken } = await createSession(db, user!.user_id, data.session_token);
  await recordAudit(db, {
    action: 'LOGIN',
    actor: user!.email,
    target: user!.user_id,
    severity: 'LOW',
    details: 'Google OAuth login successful',
    ipAddress: getClientIp(req),
    sessionId: sessionToken.slice(0, 12),
  });

  const res = NextResponse.json({
    user_id: user!.user_id,
    email: user!.email,
    name: user!.name,
    picture: user!.picture,
    role: user!.role,
  });
  res.cookies.set('session_token', sessionToken, SESSION_COOKIE);
  return res;
}
