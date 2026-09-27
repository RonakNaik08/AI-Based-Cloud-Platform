import { SelfHealingRule, CloudResource } from './types';

export const initialSelfHealingRules: SelfHealingRule[] = [
  {
    id: 'rule-auto-scale-cpu',
    name: 'Auto-Scale Compute on Sustained High Load',
    description: 'If instance CPU exceeds 85% for >10 consecutive minutes, automatically upgrade instance capacity.',
    triggerMetric: 'cpu',
    operator: '>',
    threshold: 85,
    durationMinutes: 10,
    actionType: 'scale_instance',
    targetFilter: { provider: 'aws' },
    autoExecute: true,
    status: 'active',
    executionCount: 6,
    lastExecutedAt: '2 hours ago',
  },
  {
    id: 'rule-stop-idle-dev',
    name: 'Auto-Stop Idle Staging & Dev Instances',
    description: 'If compute CPU is < 5% for >60 minutes on staging/dev tags, stop the instance to eliminate FinOps waste.',
    triggerMetric: 'cpu',
    operator: '<',
    threshold: 5,
    durationMinutes: 60,
    actionType: 'stop_instance',
    targetFilter: { tag: 'staging' },
    autoExecute: true,
    status: 'active',
    executionCount: 14,
    lastExecutedAt: 'Yesterday',
  },
  {
    id: 'rule-clean-unattached-ebs',
    name: 'Auto-Purge Orphaned Storage Disks',
    description: 'If an EBS or Managed Disk remains unattached for >14 days, create a snapshot and delete the volume.',
    triggerMetric: 'unattached_days',
    operator: '>',
    threshold: 14,
    durationMinutes: 1440,
    actionType: 'delete_ebs',
    targetFilter: {},
    autoExecute: false, // Requires human confirmation by default
    status: 'active',
    executionCount: 3,
    lastExecutedAt: '3 days ago',
  },
  {
    id: 'rule-restart-k8s-pod',
    name: 'Auto-Restart CrashLooping K8s Pods',
    description: 'If a Kubernetes Pod enters CrashLoopBackOff with >3 restarts, initiate automated rolling pod restart and trigger diagnostic memory dump.',
    triggerMetric: 'error_rate',
    operator: '>',
    threshold: 3,
    durationMinutes: 5,
    actionType: 'restart_pod',
    targetFilter: { provider: 'k8s' },
    autoExecute: true,
    status: 'active',
    executionCount: 8,
    lastExecutedAt: 'Just now',
  },
];

export class SelfHealingEngine {
  private rules: SelfHealingRule[] = [...initialSelfHealingRules];

  public getRules(): SelfHealingRule[] {
    return this.rules;
  }

  public toggleRule(id: string): SelfHealingRule | null {
    const rule = this.rules.find((r) => r.id === id);
    if (rule) {
      rule.status = rule.status === 'active' ? 'paused' : 'active';
      return rule;
    }
    return null;
  }

  public addRule(newRule: Omit<SelfHealingRule, 'id' | 'executionCount'>): SelfHealingRule {
    const created: SelfHealingRule = {
      ...newRule,
      id: `rule-${Date.now().toString(36)}`,
      executionCount: 0,
    };
    this.rules.unshift(created);
    return created;
  }

  public executeRule(id: string): { success: boolean; message: string } {
    const rule = this.rules.find((r) => r.id === id);
    if (!rule) return { success: false, message: 'Rule not found' };

    rule.executionCount += 1;
    rule.lastExecutedAt = 'Just now';

    return {
      success: true,
      message: `Autonomous self-healing triggered: ${rule.name}. Remediated target resources successfully.`,
    };
  }
}

export const globalSelfHealingEngine = new SelfHealingEngine();
