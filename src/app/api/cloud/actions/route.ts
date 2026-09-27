import { NextResponse } from 'next/server';
import { AutomatedAction } from '@/lib/types';
import { globalAuditLogger } from '@/lib/auditLogger';

let actionsQueue: AutomatedAction[] = [
  {
    id: 'act-001',
    title: 'Scale EC2 Instance prod-server-01 to c5.xlarge',
    description: 'Upgrade compute instance from t3.medium to c5.xlarge to resolve 92% sustained CPU saturation.',
    actionType: 'scale_instance',
    targetResourceId: 'i-08a9f3b817c01a91',
    targetResourceName: 'prod-server-01',
    proposedBy: 'AI Copilot',
    riskLevel: 'medium',
    status: 'pending_approval',
    requiresConfirmation: true,
    dryRunPassed: true,
    rollbackPlan: 'Revert instance type back to t3.medium if health checks fail after 180 seconds.',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    params: { currentType: 't3.medium', newType: 'c5.xlarge' },
  },
  {
    id: 'act-002',
    title: 'Purge Orphaned EBS Volume vol-09a823e41bc019a',
    description: 'Delete 480 GB unattached EBS volume unattached-analytics-ebs-01 to save $38.40/month.',
    actionType: 'delete_unattached_ebs',
    targetResourceId: 'vol-09a823e41bc019a',
    targetResourceName: 'unattached-analytics-ebs-01',
    proposedBy: 'FinOps Optimizer',
    riskLevel: 'low',
    status: 'pending_approval',
    requiresConfirmation: true,
    dryRunPassed: true,
    rollbackPlan: 'Automated EBS snapshot snap-0988172 created prior to volume release.',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    params: { volumeId: 'vol-09a823e41bc019a' },
  },
  {
    id: 'act-003',
    title: 'Decommission Idle dev-test-instance-04',
    description: 'Stop staging instance with <2% CPU utilization to eliminate $59.90/mo recurring spend.',
    actionType: 'stop_instance',
    targetResourceId: 'i-012ab990ef345678',
    targetResourceName: 'dev-test-instance-04',
    proposedBy: 'FinOps Optimizer',
    riskLevel: 'low',
    status: 'pending_approval',
    requiresConfirmation: true,
    dryRunPassed: true,
    rollbackPlan: 'Instance can be powered on immediately with 1 click.',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    params: { instanceId: 'i-012ab990ef345678' },
  },
];

export async function GET() {
  return NextResponse.json({ actions: actionsQueue });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { actionId, executionDecision, actor = 'Alex (DevOps Admin)' } = body;

    const action = actionsQueue.find((a) => a.id === actionId);
    if (!action) return NextResponse.json({ error: 'Action not found' }, { status: 404 });

    if (executionDecision === 'approve') {
      action.status = 'completed';
      action.executedAt = new Date().toISOString();
      action.executedBy = actor;
      action.executionLogs = [
        '1. Validated IAM policy and instance state: OK',
        '2. Initiated automated pre-flight snapshot: SUCCESS',
        '3. Applied target state modification: SUCCESS',
        '4. Post-execution health check verification (HTTP 200 / CPU Nominal): PASS',
      ];

      // Audit log
      globalAuditLogger.logAction(
        actor,
        'user',
        `EXECUTED_${action.actionType.toUpperCase()}`,
        action.targetResourceName,
        action.targetResourceId,
        `Approved and executed: ${action.title}`,
        'success',
        action.params
      );
    } else if (executionDecision === 'reject') {
      action.status = 'rejected';
      globalAuditLogger.logAction(
        actor,
        'user',
        `REJECTED_${action.actionType.toUpperCase()}`,
        action.targetResourceName,
        action.targetResourceId,
        `Rejected execution: ${action.title}`,
        'rejected'
      );
    }

    return NextResponse.json({ success: true, action });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
