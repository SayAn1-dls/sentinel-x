import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MOCK_ALERTS } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active') === 'true';
  const level = searchParams.get('level');

  let alerts = [...MOCK_ALERTS];

  if (activeOnly) alerts = alerts.filter(a => !a.resolved);
  if (level) alerts = alerts.filter(a => a.level === level.toUpperCase());

  const summary = {
    total: MOCK_ALERTS.length,
    active: MOCK_ALERTS.filter(a => !a.resolved).length,
    critical: MOCK_ALERTS.filter(a => a.level === 'CRITICAL' && !a.resolved).length,
    high: MOCK_ALERTS.filter(a => a.level === 'HIGH' && !a.resolved).length,
  };

  return NextResponse.json({
    data: alerts,
    summary,
    timestamp: Date.now(),
  });
}
