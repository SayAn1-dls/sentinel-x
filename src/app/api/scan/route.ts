import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { aiScanner } from '@/lib/ai-scanner';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { target } = body;

  if (!target) {
    return NextResponse.json({ error: 'Target entity required' }, { status: 400 });
  }

  const result = await aiScanner.scan(target.toUpperCase(), MOCK_TRANSACTIONS);

  return NextResponse.json({
    data: result,
    model: aiScanner.version,
    timestamp: Date.now(),
  });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'OPERATIONAL',
    model: aiScanner.version,
    modules: ['SMURFING_DETECTOR', 'LAYERING_ANALYZER', 'ROUND_TRIP_TRACER', 'VELOCITY_ENGINE'],
    timestamp: Date.now(),
  });
}
