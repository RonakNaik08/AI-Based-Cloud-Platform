import { DeploymentEvent } from './types';

export const initialDeployments: DeploymentEvent[] = [
  {
    id: 'dep-9821',
    commitSha: 'f8a10b2',
    commitMessage: 'feat(api): Refactor JSON payload parser & batch thread pool',
    author: 'Sarah Connor',
    service: 'api-gateway-service',
    environment: 'production',
    deployedAt: '35 minutes ago',
    status: 'success',
    impactMetric: {
      cpuDelta: +48.2, // correlated with high CPU spike
      latencyDeltaMs: +72,
      errorRateDelta: +1.4,
    },
    correlatedAnomalyId: 'anom-cpu-prod-01',
  },
  {
    id: 'dep-9820',
    commitSha: '9c44e19',
    commitMessage: 'chore(db): Update Postgres connection pool max_connections to 500',
    author: 'Alex Vance',
    service: 'db-migration-pipeline',
    environment: 'production',
    deployedAt: '3 hours ago',
    status: 'success',
    impactMetric: {
      cpuDelta: -4.0,
      latencyDeltaMs: -8,
      errorRateDelta: 0,
    },
  },
  {
    id: 'dep-9818',
    commitSha: '319d0aa',
    commitMessage: 'fix(finops): Add S3 object expiration lifecycle policy rule',
    author: 'David Miller',
    service: 'storage-lifecycle-worker',
    environment: 'production',
    deployedAt: 'Yesterday',
    status: 'success',
    impactMetric: {
      cpuDelta: 0,
      latencyDeltaMs: 0,
      errorRateDelta: 0,
    },
  },
];

export class DeploymentCorrelator {
  private deployments: DeploymentEvent[] = [...initialDeployments];

  public getDeployments(): DeploymentEvent[] {
    return this.deployments;
  }

  public correlateWithAnomalies(anomalyDetectedAt: string): DeploymentEvent | null {
    // Return most recent deployment before the incident
    return this.deployments[0] || null;
  }
}

export const globalDeploymentCorrelator = new DeploymentCorrelator();
