import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser, getToken, getClientIp, SESSION_COOKIE } from '@/lib/server/auth';
import { recordAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const user = await getSessionUser(db, req);
    const token = getToken(req);
    if (token) {
      await db.collection('user_sessions').deleteOne({ session_token: token });
    }
    if (user) {
      await recordAudit(db, {
        action: 'LOGOUT',
        actor: user.email,
        target: user.user_id,
        severity: 'CLEAR',
        details: 'Session terminated by user',
        ipAddress: getClientIp(req),
      });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set('session_token', '', { ...SESSION_COOKIE, maxAge: 0 });
    return res;
  } catch (err) {
    // Even if DB is down, still clear the cookie
    console.error('[api/auth/logout] Error:', err);
    const res = NextResponse.json({ ok: true, warning: 'Session may not have been fully cleared server-side' });
    res.cookies.set('session_token', '', { ...SESSION_COOKIE, maxAge: 0 });
    return res;
  }
}
