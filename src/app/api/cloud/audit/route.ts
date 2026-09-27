import { NextResponse } from 'next/server';
import { globalAuditLogger } from '@/lib/auditLogger';

export async function GET() {
  const logs = globalAuditLogger.getLogs();
  return NextResponse.json({ logs });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { actor, actorType, action, targetResource, targetId, details, status, diffPayload, region } = body;
    const log = globalAuditLogger.logAction(
      actor || 'DevOps User',
      actorType || 'user',
      action || 'CUSTOM_ACTION',
      targetResource || 'Fleet Resource',
      targetId || 'res-custom',
      details || 'Manual action recorded in console',
      status || 'success',
      diffPayload,
      region
    );
    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
