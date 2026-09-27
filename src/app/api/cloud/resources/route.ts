import { NextResponse } from 'next/server';
import { initialResources } from '@/lib/cloudData';

// In-memory resource store
let currentResources = [...initialResources];

export async function GET() {
  return NextResponse.json({ resources: currentResources });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newResource = {
      ...body,
      id: body.id || `res-${Date.now().toString(36)}`,
      launchTime: new Date().toISOString(),
    };
    currentResources.unshift(newResource);
    return NextResponse.json({ success: true, resource: newResource }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, updates } = body;
    const index = currentResources.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    currentResources[index] = { ...currentResources[index], ...updates };
    return NextResponse.json({ success: true, resource: currentResources[index] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    currentResources = currentResources.filter((r) => r.id !== id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
