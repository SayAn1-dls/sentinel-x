import { NextResponse } from 'next/server';
import { MOCK_GATEWAYS } from '@/lib/mock-data';

export async function GET() {
  const online = MOCK_GATEWAYS.filter(g => g.status === 'ONLINE').length;
  const healthScore = Math.round((online / MOCK_GATEWAYS.length) * 100);
  const avgLatency = Math.round(MOCK_GATEWAYS.filter(g => g.status === 'ONLINE').reduce((sum, g) => sum + g.latency, 0) / online);

  return NextResponse.json({
    gateways: MOCK_GATEWAYS,
    stats: {
      total: MOCK_GATEWAYS.length,
      online,
      offline: MOCK_GATEWAYS.filter(g => g.status === 'OFFLINE').length,
      degraded: MOCK_GATEWAYS.filter(g => g.status === 'DEGRADED').length,
      healthScore,
      avgLatency,
    },
    timestamp: Date.now(),
  });
}
