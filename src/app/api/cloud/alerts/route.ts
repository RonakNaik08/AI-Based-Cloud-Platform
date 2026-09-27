import { NextResponse } from 'next/server';
import { initialAlerts } from '@/lib/cloudData';
import { CloudAlert } from '@/lib/types';

let currentAlerts: CloudAlert[] = [...initialAlerts];

export async function GET() {
  return NextResponse.json({ alerts: currentAlerts });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const alert = currentAlerts.find((a) => a.id === id);
    if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });

    alert.status = status;
    if (status === 'resolved') {
      alert.resolvedAt = new Date().toISOString();
    }

    return NextResponse.json({ success: true, alert });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
