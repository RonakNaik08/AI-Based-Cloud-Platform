import { NextResponse } from 'next/server';
import { generate24HourMetrics } from '@/lib/cloudData';

export async function GET() {
  const metrics = generate24HourMetrics();
  return NextResponse.json({ metrics });
}
