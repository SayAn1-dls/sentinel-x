import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/mongo';
import { getSessionUser } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const user = await getSessionUser(db, req);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const passkeyCount = await db.collection('passkeys').countDocuments({ userId: user.user_id });
    return NextResponse.json({ ...user, passkey_count: passkeyCount });
  } catch (err) {
    console.error('[api/auth/me] Error:', err);
    return NextResponse.json(
      { error: 'Database unavailable', details: err instanceof Error ? err.message : 'Connection failed', code: 'DB_UNAVAILABLE' },
      { status: 503 }
    );
  }
}
