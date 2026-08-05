import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MOCK_AUDIT_LOGS } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const severity = searchParams.get('severity');
  const actor = searchParams.get('actor');
  const from = searchParams.get('from') ? parseInt(searchParams.get('from')!) : 0;
  const to = searchParams.get('to') ? parseInt(searchParams.get('to')!) : Date.now();

  let logs = [...MOCK_AUDIT_LOGS];

  if (severity) logs = logs.filter(l => l.severity === severity.toUpperCase());
  if (actor) logs = logs.filter(l => l.actor.toLowerCase().includes(actor.toLowerCase()));
  logs = logs.filter(l => l.timestamp >= from && l.timestamp <= to);

  return NextResponse.json({
    data: logs.slice(0, limit),
    total: logs.length,
    timestamp: Date.now(),
  });
}
