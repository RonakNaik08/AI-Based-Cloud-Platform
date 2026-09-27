import { CloudResource, AnomalyItem, MetricDataPoint } from './types';

export class AnomalyDetectionEngine {
  private anomalies: AnomalyItem[] = [];

  constructor() {
    this.anomalies = [];
  }

  // Dynamically scan user's actual entered resources to detect anomalies
  public scanResources(resources: CloudResource[]): AnomalyItem[] {
    const detected: AnomalyItem[] = [];

    resources.forEach((res) => {
      // 1. High CPU Anomaly (> 80%)
      if (res.status === 'running' && res.cpuUtilization > 80) {
        const zScore = Math.round(((res.cpuUtilization - 45) / 12) * 100) / 100;
        detected.push({
          id: `anom-cpu-${res.id}`,
          resourceId: res.id,
          resourceName: res.name,
          resourceType: res.type,
          provider: res.provider,
          metricType: 'cpu',
          severity: res.cpuUtilization > 90 ? 'critical' : 'high',
          score: Math.min(99, Math.round(50 + zScore * 12)),
          currentValue: res.cpuUtilization,
          baselineValue: 42.0,
          unit: '%',
          detectionMethod: 'z-score',
          detectedAt: new Date().toISOString(),
          status: 'active',
          summary: `High CPU saturation (${res.cpuUtilization}%) on ${res.name} (Z-Score: +${zScore}σ)`,
          aiExplanation: `${res.name} (${res.provider.toUpperCase()} ${res.instanceType || res.type}) is operating at ${res.cpuUtilization}% CPU load, significantly above nominal baseline. Recommended capacity scaling or thread investigation.`,
          recommendedAction: {
            title: `Scale ${res.name} Instance Spec`,
            actionType: 'scale_instance',
            targetResourceId: res.id,
            params: { targetType: res.instanceType === 't3.medium' ? 'c5.xlarge' : 'Standard_D8s_v5' },
          },
        });
      }

      // 2. High Memory / Potential Leak Anomaly (> 85%)
      if (res.status === 'running' && res.memoryUtilization > 85) {
        detected.push({
          id: `anom-mem-${res.id}`,
          resourceId: res.id,
          resourceName: res.name,
          resourceType: res.type,
          provider: res.provider,
          metricType: 'memory',
          severity: 'high',
          score: 89,
          currentValue: res.memoryUtilization,
          baselineValue: 50.0,
          unit: '%',
          detectionMethod: 'heuristic-drift',
          detectedAt: new Date().toISOString(),
          status: 'active',
          summary: `High Memory Utilization (${res.memoryUtilization}%) detected on ${res.name}`,
          aiExplanation: `Elevated memory consumption observed on ${res.name}. Risk of OOM killer crash if unmanaged allocations continue.`,
          recommendedAction: {
            title: `Restart Service / Inspect Heap on ${res.name}`,
            actionType: 'restart_service',
            targetResourceId: res.id,
          },
        });
      }

      // 3. Orphaned / Unattached Storage Anomaly
      if (res.type === 'ebs' && (res.status === 'stopped' || res.details?.attachedTo?.includes('None'))) {
        detected.push({
          id: `anom-disk-${res.id}`,
          resourceId: res.id,
          resourceName: res.name,
          resourceType: 'ebs',
          provider: res.provider,
          metricType: 'cost',
          severity: 'medium',
          score: 82,
          currentValue: res.monthlyCost,
          baselineValue: 0,
          unit: '$/mo',
          detectionMethod: 'rolling-iqr',
          detectedAt: new Date().toISOString(),
          status: 'active',
          summary: `Orphaned Storage Disk ${res.name} generating $${res.monthlyCost.toFixed(2)}/mo idle cost`,
          aiExplanation: `Storage volume ${res.id} is unattached and accumulating recurring storage charges with zero active compute bindings.`,
          recommendedAction: {
            title: `Delete or Snapshot Unattached Disk ${res.name}`,
            actionType: 'clean_orphans',
            targetResourceId: res.id,
            estimatedSavings: res.monthlyCost,
          },
        });
      }
    });

    // Merge with any dynamically injected faults that might still be active
    const activeInjected = this.anomalies.filter((a) => a.status === 'active' && a.id.startsWith('anom-sim-'));
    this.anomalies = [...detected, ...activeInjected];
    return this.anomalies;
  }

  public getAnomalies(): AnomalyItem[] {
    return this.anomalies;
  }

  public getActiveAnomalies(): AnomalyItem[] {
    return this.anomalies.filter((a) => a.status === 'active');
  }

  // Inject Simulated Anomaly for Demo & Testing
  public injectAnomaly(faultType: 'cpu_spike' | 'memory_leak' | 'cost_surge' | 'rds_connections', targetResource?: CloudResource): AnomalyItem {
    const resId = targetResource?.id || 'res-user-sim';
    const resName = targetResource?.name || 'custom-user-server';
    const resProvider = targetResource?.provider || 'aws';

    let newAnomaly: AnomalyItem;

    if (faultType === 'cpu_spike') {
      newAnomaly = {
        id: `anom-sim-cpu-${Date.now()}`,
        resourceId: resId,
        resourceName: resName,
        resourceType: targetResource?.type || 'ec2',
        provider: resProvider,
        metricType: 'cpu',
        severity: 'critical',
        score: 98.1,
        currentValue: 95.8,
        baselineValue: 42.1,
        unit: '%',
        detectionMethod: 'z-score',
        detectedAt: new Date().toISOString(),
        status: 'active',
        summary: `Compute Surge: ${resName} CPU jumped to 95.8%`,
        aiExplanation: `Spike detected in application request queue with worker threads pegging CPU cores on ${resName}.`,
        recommendedAction: {
          title: `Scale ${resName} Capacity`,
          actionType: 'scale_instance',
          targetResourceId: resId,
          params: { newInstanceType: 'c5.2xlarge' },
        },
      };
    } else if (faultType === 'memory_leak') {
      newAnomaly = {
        id: `anom-sim-mem-${Date.now()}`,
        resourceId: resId,
        resourceName: resName,
        resourceType: targetResource?.type || 'ec2',
        provider: resProvider,
        metricType: 'memory',
        severity: 'high',
        score: 91.4,
        currentValue: 93.6,
        baselineValue: 24.0,
        unit: '%',
        detectionMethod: 'heuristic-drift',
        detectedAt: new Date().toISOString(),
        status: 'active',
        summary: `Memory Saturation: ${resName} RAM reached 93.6%`,
        aiExplanation: `Unreleased cache allocations leaking memory on ${resName}. Kernel OOM risk detected.`,
        recommendedAction: {
          title: `Restart Service Worker on ${resName}`,
          actionType: 'restart_service',
          targetResourceId: resId,
        },
      };
    } else if (faultType === 'cost_surge') {
      newAnomaly = {
        id: `anom-sim-cost-${Date.now()}`,
        resourceId: resId,
        resourceName: resName,
        resourceType: targetResource?.type || 's3',
        provider: resProvider,
        metricType: 'cost',
        severity: 'high',
        score: 94.0,
        currentValue: 84.50,
        baselineValue: 5.28,
        unit: '$/day',
        detectionMethod: 'rolling-iqr',
        detectedAt: new Date().toISOString(),
        status: 'active',
        summary: `Billing Surge: ${resName} daily spend increased 16x`,
        aiExplanation: `Unusual egress or expedited retrieval activity detected on ${resName}.`,
        recommendedAction: {
          title: `Inspect Access Logs on ${resName}`,
          actionType: 'investigate',
          targetResourceId: resId,
        },
      };
    } else {
      newAnomaly = {
        id: `anom-sim-rds-${Date.now()}`,
        resourceId: resId,
        resourceName: resName,
        resourceType: targetResource?.type || 'rds',
        provider: resProvider,
        metricType: 'connections',
        severity: 'critical',
        score: 97.3,
        currentValue: 485,
        baselineValue: 65,
        unit: 'connections',
        detectionMethod: 'z-score',
        detectedAt: new Date().toISOString(),
        status: 'active',
        summary: `DB Connection Spike: 485 connections on ${resName}`,
        aiExplanation: `Application connection pool exhaustion detected on ${resName}.`,
        recommendedAction: {
          title: `Enable Proxy / Pool Tuning on ${resName}`,
          actionType: 'adjust_pool',
          targetResourceId: resId,
        },
      };
    }

    this.anomalies.unshift(newAnomaly);
    return newAnomaly;
  }

  public resolveAnomaly(id: string): boolean {
    const item = this.anomalies.find((a) => a.id === id);
    if (item) {
      item.status = 'mitigated';
      return true;
    }
    return false;
  }

  public acknowledgeAnomaly(id: string): boolean {
    const item = this.anomalies.find((a) => a.id === id);
    if (item) {
      item.status = 'acknowledged';
      return true;
    }
    return false;
  }
}

export const globalAnomalyEngine = new AnomalyDetectionEngine();
