import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MOCK_TRANSACTIONS, generateMockTransaction } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const threat = searchParams.get('threat');

  let transactions = [...MOCK_TRANSACTIONS];

  if (status) transactions = transactions.filter(t => t.status === status.toUpperCase());
  if (threat) transactions = transactions.filter(t => t.threatLevel === threat.toUpperCase());

  return NextResponse.json({
    data: transactions.slice(0, limit),
    total: transactions.length,
    timestamp: Date.now(),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const transaction = generateMockTransaction(body);
  return NextResponse.json({ data: transaction, created: true }, { status: 201 });
}
