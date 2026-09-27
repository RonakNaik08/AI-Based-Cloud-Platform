import { NextResponse } from 'next/server';
import { globalAIEngine } from '@/lib/aiEngine';
import { initialResources, generate24HourMetrics, initialAlerts } from '@/lib/cloudData';
import { globalAnomalyEngine } from '@/lib/anomalyDetector';
import { globalAuditLogger } from '@/lib/auditLogger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, resources, apiKey, provider } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const context = {
      resources: resources || initialResources,
      metrics: generate24HourMetrics(),
      alerts: initialAlerts,
      anomalies: globalAnomalyEngine.getAnomalies(),
      apiKey,
      provider,
    };

    const response = await globalAIEngine.generateResponse(prompt, context);

    // Record audit event for AI query
    globalAuditLogger.logAction(
      'User (Web Console)',
      'user',
      'AI_COPILOT_QUERY',
      'Cloud Infrastructure Fleet',
      'fleet-all',
      `Prompt: "${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}"`
    );

    return NextResponse.json({ response });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
