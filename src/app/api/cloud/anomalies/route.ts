import { NextResponse } from 'next/server';
import { globalAnomalyEngine } from '@/lib/anomalyDetector';

export async function GET() {
  const anomalies = globalAnomalyEngine.getAnomalies();
  return NextResponse.json({ anomalies });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { faultType } = body;
    const newAnomaly = globalAnomalyEngine.injectAnomaly(faultType || 'cpu_spike');
    return NextResponse.json({ success: true, anomaly: newAnomaly });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action } = body;
    if (action === 'mitigate') {
      globalAnomalyEngine.resolveAnomaly(id);
    } else {
      globalAnomalyEngine.acknowledgeAnomaly(id);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
