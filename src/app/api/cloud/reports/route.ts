import { NextResponse } from 'next/server';
import { initialReports } from '@/lib/cloudData';
import { InfrastructureReport } from '@/lib/types';

let reportsList: InfrastructureReport[] = [...initialReports];

export async function GET() {
  return NextResponse.json({ reports: reportsList });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reportType, customTitle, resourceId } = body;

    const newReport: InfrastructureReport = {
      id: `rep-${Date.now().toString(36)}`,
      title: customTitle || (reportType === 'incident_postmortem' ? `Incident Post-Mortem: ${resourceId || 'prod-server-01'} CPU Saturation` : 'On-Demand CloudOps Executive Report'),
      type: reportType || 'daily_digest',
      generatedAt: new Date().toISOString(),
      dateRange: 'Real-time On-Demand Snapshot',
      author: 'AI CloudOps Intelligence Engine',
      executiveSummary: `Generated comprehensive health diagnostic. Compute fleet stability evaluated at 96.4%. Identified potential monthly savings of $536.70 across orphaned disks and overprovisioned compute.`,
      healthScore: 95,
      uptimePercentage: 99.98,
      totalSpend: 160.67,
      potentialSavings: 536.70,
      totalIncidents: 3,
      resolvedIncidents: 2,
      topResourceSpenders: [
        { name: 'prod-media-assets-cdn (S3)', type: 'S3 Storage', cost: 489.60 },
        { name: 'prod-postgres-main (RDS)', type: 'RDS PostgreSQL', cost: 374.40 },
        { name: 'analytics-worker-03 (EC2)', type: 'EC2 m5.2xlarge', cost: 276.48 },
      ],
      keyRecommendations: [
        'Apply c5.xlarge vertical scaling to prod-server-01',
        'Purge 2 unattached EBS volumes to recover $54.40/mo',
        'Enable S3 Lifecycle Intelligent-Tiering to reduce object storage costs by 43%',
      ],
    };

    reportsList.unshift(newReport);
    return NextResponse.json({ success: true, report: newReport }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
