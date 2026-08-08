import { NextRequest } from 'next/server';
import { Db } from 'mongodb';
import crypto from 'crypto';

export interface SessionUser {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'ADMIN' | 'ANALYST';
}

export const SESSION_COOKIE = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
  maxAge: 7 * 24 * 3600,
};

export function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get('session_token')?.value;
  if (cookie) return cookie;
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function getSessionUser(db: Db, req: NextRequest): Promise<SessionUser | null> {
  const token = getToken(req);
  if (!token) return null;
  const session = await db.collection('user_sessions').findOne({ session_token: token }, { projection: { _id: 0 } });
  if (!session) return null;
  let expiresAt = session.expires_at;
  if (typeof expiresAt === 'string') expiresAt = new Date(expiresAt);
  if (!expiresAt || new Date(expiresAt).getTime() < Date.now()) return null;
  const user = await db.collection('users').findOne({ user_id: session.user_id }, { projection: { _id: 0 } });
  return (user as unknown as SessionUser) ?? null;
}

export async function createSession(db: Db, userId: string, token?: string) {
  const sessionToken = token ?? `st_${crypto.randomBytes(32).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  await db.collection('user_sessions').insertOne({
    user_id: userId,
    session_token: sessionToken,
    expires_at: expiresAt,
    created_at: new Date(),
  });
  return { sessionToken, expiresAt };
}

export function getRpInfo(req: NextRequest) {
  const hostHdr = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost:3000';
  const hostname = hostHdr.split(':')[0];
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const proto = isLocal ? 'http' : 'https';
  return { rpID: hostname, origin: `${proto}://${hostHdr}`, rpName: 'SENTINEL-X' };
}

export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}
