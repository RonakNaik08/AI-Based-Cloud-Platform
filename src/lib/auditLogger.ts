import { AuditLogEntry } from './types';
import { initialAuditLogs } from './cloudData';

export class AuditLogger {
  private logs: AuditLogEntry[] = [];

  constructor() {
    this.logs = [...initialAuditLogs];
  }

  public getLogs(): AuditLogEntry[] {
    return this.logs;
  }

  public logAction(
    actor: string,
    actorType: 'user' | 'ai_copilot' | 'auto_scaler' | 'system',
    action: string,
    targetResource: string,
    targetId: string,
    details: string,
    status: 'success' | 'failed' | 'pending' | 'rejected' = 'success',
    diffPayload?: Record<string, any>,
    region = 'us-east-1'
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actor,
      actorType,
      action,
      targetResource,
      targetId,
      status,
      details,
      ipAddress: actorType === 'user' ? '192.168.1.42' : '10.0.0.1 (Internal Mesh)',
      region,
      diffPayload,
    };

    this.logs.unshift(entry);
    return entry;
  }
}

export const globalAuditLogger = new AuditLogger();
