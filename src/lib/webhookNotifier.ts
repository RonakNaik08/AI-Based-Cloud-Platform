import { WebhookIntegration } from './types';

export const initialIntegrations: WebhookIntegration[] = [
  {
    id: 'int-slack-ops',
    name: 'DevOps & SRE Alert Channel',
    channel: 'slack',
    endpointUrl: 'https://api.example.com/webhooks/slack/sre-alerts',
    events: ['anomaly_detected', 'action_executed', 'security_finding'],
    enabled: true,
    lastFiredAt: '12 minutes ago',
  },
  {
    id: 'int-pagerduty-p1',
    name: 'PagerDuty Critical Incidents P1',
    channel: 'pagerduty',
    endpointUrl: 'https://events.pagerduty.com/v2/enqueue',
    events: ['anomaly_detected'],
    enabled: true,
    lastFiredAt: '35 minutes ago',
  },
  {
    id: 'int-discord-finops',
    name: 'FinOps Savings Discord Bot',
    channel: 'discord',
    endpointUrl: 'https://api.example.com/webhooks/discord/finops-bot',
    events: ['action_executed', 'daily_report'],
    enabled: false,
  },
  {
    id: 'int-teams-executive',
    name: 'Executive Daily SLA Digest',
    channel: 'teams',
    endpointUrl: 'https://api.example.com/webhooks/teams/executive-digest',
    events: ['daily_report'],
    enabled: true,
    lastFiredAt: 'Yesterday',
  },
];

export class WebhookNotifier {
  private integrations: WebhookIntegration[] = [...initialIntegrations];

  public getIntegrations(): WebhookIntegration[] {
    return this.integrations;
  }

  public toggleIntegration(id: string): WebhookIntegration | null {
    const item = this.integrations.find((i) => i.id === id);
    if (item) {
      item.enabled = !item.enabled;
      return item;
    }
    return null;
  }

  public addIntegration(item: Omit<WebhookIntegration, 'id'>): WebhookIntegration {
    const created: WebhookIntegration = {
      ...item,
      id: `int-${Date.now().toString(36)}`,
    };
    this.integrations.push(created);
    return created;
  }

  public testWebhook(id: string): { success: boolean; message: string; samplePayload: any } {
    const item = this.integrations.find((i) => i.id === id);
    if (!item) return { success: false, message: 'Integration not found', samplePayload: null };

    item.lastFiredAt = 'Just now';

    const samplePayload = {
      channel: item.channel,
      timestamp: new Date().toISOString(),
      eventType: 'anomaly_detected',
      title: '🚨 [CRITICAL] High CPU Saturation on prod-server-01 (92.4%)',
      details: 'AI CloudOps detected Z-Score +3.82σ anomaly. Immediate scaling to c5.xlarge recommended.',
      interactiveActionButtons: [
        { label: '⚡ Scale Instance to c5.xlarge', url: 'https://cloudops.ai/actions/scale' },
        { label: '📊 View Telemetry', url: 'https://cloudops.ai/metrics' },
      ],
    };

    return {
      success: true,
      message: `Test alert dispatched to ${item.name} (${item.channel.toUpperCase()}) successfully!`,
      samplePayload,
    };
  }
}

export const globalWebhookNotifier = new WebhookNotifier();
