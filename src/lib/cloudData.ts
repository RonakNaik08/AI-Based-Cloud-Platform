import { CloudResource, MetricDataPoint, CloudAlert, AuditLogEntry, InfrastructureReport, CloudAccountConnection } from './types';

// Default Connected Accounts (can be customized or cleared by user)
export const initialConnectedAccounts: CloudAccountConnection[] = [
  {
    id: 'aws-primary-1',
    provider: 'aws',
    accountName: 'AWS Production (Primary)',
    accountId: '8920-1948-2910',
    status: 'connected',
    connectionMethod: 'iam_role_arn',
    environment: 'production',
    region: 'us-east-1',
    latencyMs: 22,
    syncIntervalSec: 30,
    credentials: {
      awsAccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      awsSecretAccessKey: '••••••••••••••••••••••••••••••••',
      awsRegion: 'us-east-1',
      awsRoleArn: 'arn:aws:iam::892019482910:role/CloudOpsOpsRole',
    },
    connectedAt: '2026-09-01T00:00:00Z',
    lastSyncedAt: 'Just now',
    resourcesCount: 7,
  },
  {
    id: 'azure-enterprise-2',
    provider: 'azure',
    accountName: 'Azure Enterprise Cloud',
    accountId: 'sub-49f0a82b-91c2-48df',
    status: 'connected',
    connectionMethod: 'azure_service_principal',
    environment: 'production',
    region: 'eastus',
    latencyMs: 34,
    syncIntervalSec: 30,
    credentials: {
      azureSubscriptionId: '49f0a82b-91c2-48df-992a-e889102c349a',
      azureTenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
      azureClientId: 'c8129038-e991-491a-b349-11209384910a',
    },
    connectedAt: '2026-09-05T08:30:00Z',
    lastSyncedAt: 'Just now',
    resourcesCount: 5,
  },
  {
    id: 'gcp-prod-3',
    provider: 'gcp',
    accountName: 'GCP Core Production',
    accountId: 'gcp-cloudops-prod-982',
    status: 'connected',
    connectionMethod: 'gcp_service_account',
    environment: 'production',
    region: 'us-central1',
    latencyMs: 28,
    syncIntervalSec: 30,
    credentials: {
      gcpProjectId: 'gcp-cloudops-prod-982',
      gcpServiceAccountEmail: 'cloudops-sa@gcp-cloudops-prod-982.iam.gserviceaccount.com',
    },
    connectedAt: '2026-09-10T12:00:00Z',
    lastSyncedAt: 'Just now',
    resourcesCount: 5,
  },
];

// Sample Starter Fleet (for 1-click loading)
export const starterSampleResources: CloudResource[] = [
  // --- AWS RESOURCES ---
  {
    id: 'i-08a9f3b817c01a91',
    name: 'prod-server-01',
    type: 'ec2',
    provider: 'aws',
    region: 'us-east-1',
    status: 'running',
    instanceType: 't3.medium',
    ipAddress: '54.210.142.88',
    cpuUtilization: 92.4, // High CPU
    memoryUtilization: 78.5,
    diskUtilization: 64.2,
    networkInMbps: 45.2,
    networkOutMbps: 182.4,
    costPerHour: 0.0416,
    monthlyCost: 29.95,
    launchTime: '2026-08-10T14:32:00Z',
    tags: { Environment: 'production', Tier: 'web-api', Team: 'platform-core', Provider: 'AWS' },
    details: {
      storageGb: 80,
      iops: 3000,
      stateReason: 'Sustained high compute load: Node.js worker loop bottleneck on t3.medium',
    },
  },
  {
    id: 'i-0419e7a82b99c012',
    name: 'prod-server-02',
    type: 'ec2',
    provider: 'aws',
    region: 'us-east-1',
    status: 'running',
    instanceType: 't3.medium',
    ipAddress: '54.210.142.89',
    cpuUtilization: 42.1,
    memoryUtilization: 55.3,
    diskUtilization: 48.0,
    networkInMbps: 38.0,
    networkOutMbps: 140.2,
    costPerHour: 0.0416,
    monthlyCost: 29.95,
    launchTime: '2026-08-10T14:35:00Z',
    tags: { Environment: 'production', Tier: 'web-api', Provider: 'AWS' },
    details: {
      storageGb: 80,
      iops: 3000,
    },
  },
  {
    id: 'i-0988cc21a00ef123',
    name: 'analytics-worker-03',
    type: 'ec2',
    provider: 'aws',
    region: 'us-east-1',
    status: 'running',
    instanceType: 'm5.2xlarge',
    ipAddress: '10.0.12.44',
    cpuUtilization: 11.2,
    memoryUtilization: 24.0,
    diskUtilization: 35.0,
    networkInMbps: 12.0,
    networkOutMbps: 8.5,
    costPerHour: 0.384,
    monthlyCost: 276.48,
    launchTime: '2026-07-01T09:15:00Z',
    tags: { Environment: 'production', Tier: 'data-processing', Provider: 'AWS' },
    details: {
      storageGb: 500,
      iops: 6000,
      stateReason: 'Overprovisioned compute relative to average load (Rightsizing candidate)',
    },
  },
  {
    id: 'i-012ab990ef345678',
    name: 'dev-test-instance-04',
    type: 'ec2',
    provider: 'aws',
    region: 'us-west-2',
    status: 'running',
    instanceType: 't3.large',
    ipAddress: '34.219.88.19',
    cpuUtilization: 1.8,
    memoryUtilization: 14.2,
    diskUtilization: 22.0,
    networkInMbps: 0.2,
    networkOutMbps: 0.1,
    costPerHour: 0.0832,
    monthlyCost: 59.90,
    launchTime: '2026-08-28T11:00:00Z',
    tags: { Environment: 'staging', Tier: 'qa-test', Provider: 'AWS' },
    details: {
      storageGb: 100,
      iops: 3000,
      stateReason: 'Idle compute for >14 days with zero active incoming traffic',
    },
  },
  {
    id: 'rds-pg-cluster-primary',
    name: 'prod-postgres-main',
    type: 'rds',
    provider: 'aws',
    region: 'us-east-1',
    status: 'running',
    instanceType: 'db.r6g.xlarge',
    ipAddress: 'postgres-prod.c39x.us-east-1.rds.amazonaws.com',
    cpuUtilization: 54.0,
    memoryUtilization: 72.8,
    diskUtilization: 68.4,
    networkInMbps: 95.0,
    networkOutMbps: 180.0,
    costPerHour: 0.52,
    monthlyCost: 374.40,
    launchTime: '2026-05-14T08:00:00Z',
    tags: { Environment: 'production', Database: 'core-postgres', Provider: 'AWS' },
    details: {
      engine: 'PostgreSQL 16.2',
      storageGb: 1200,
      iops: 12000,
      invocationsPerMin: 4200,
    },
  },
  {
    id: 's3-media-assets-prod',
    name: 'prod-media-assets-cdn',
    type: 's3',
    provider: 'aws',
    region: 'us-east-1',
    status: 'running',
    cpuUtilization: 0,
    memoryUtilization: 0,
    costPerHour: 0.68,
    monthlyCost: 489.60,
    launchTime: '2026-03-01T00:00:00Z',
    tags: { Environment: 'production', DataTier: 'static-assets', Provider: 'AWS' },
    details: {
      storageGb: 21400,
      objectCount: 4820000,
      stateReason: '65% unaccessed objects eligible for S3 Intelligent-Tiering',
    },
  },
  {
    id: 'vol-09a823e41bc019a',
    name: 'unattached-analytics-ebs-01',
    type: 'ebs',
    provider: 'aws',
    region: 'us-east-1',
    status: 'stopped',
    costPerHour: 0.053,
    monthlyCost: 38.40,
    launchTime: '2026-07-15T12:00:00Z',
    cpuUtilization: 0,
    memoryUtilization: 0,
    tags: { Environment: 'orphan', State: 'available', Provider: 'AWS' },
    details: {
      storageGb: 480,
      iops: 3000,
      attachedTo: 'None (Unattached for 26 days)',
    },
  },

  // --- AZURE RESOURCES ---
  {
    id: 'az-vm-api-eastus-01',
    name: 'az-api-vm-prod-01',
    type: 'azure_vm',
    provider: 'azure',
    region: 'eastus',
    status: 'running',
    instanceType: 'Standard_D4s_v5',
    ipAddress: '20.120.48.112',
    cpuUtilization: 91.5, // High CPU on Azure
    memoryUtilization: 82.0,
    diskUtilization: 55.0,
    networkInMbps: 62.0,
    networkOutMbps: 210.0,
    costPerHour: 0.192,
    monthlyCost: 138.24,
    launchTime: '2026-06-12T04:00:00Z',
    tags: { Environment: 'production', ResourceGroup: 'rg-core-services', Provider: 'Azure' },
    details: {
      storageGb: 128,
      iops: 3200,
      stateReason: 'Azure VM CPU saturated: High incoming REST API payload deserialization',
    },
  },
  {
    id: 'az-vm-worker-eastus-02',
    name: 'az-worker-vm-batch-02',
    type: 'azure_vm',
    provider: 'azure',
    region: 'eastus',
    status: 'running',
    instanceType: 'Standard_E8s_v5',
    ipAddress: '10.2.0.15',
    cpuUtilization: 14.2,
    memoryUtilization: 28.0,
    diskUtilization: 40.0,
    networkInMbps: 18.0,
    networkOutMbps: 22.0,
    costPerHour: 0.528,
    monthlyCost: 380.16,
    launchTime: '2026-05-18T10:00:00Z',
    tags: { Environment: 'production', ResourceGroup: 'rg-analytics', Provider: 'Azure' },
    details: {
      storageGb: 256,
      iops: 5000,
    },
  },
  {
    id: 'az-sql-prod-db-01',
    name: 'az-sql-primary-db',
    type: 'azure_sql',
    provider: 'azure',
    region: 'eastus',
    status: 'running',
    instanceType: 'GP_Gen5_4',
    ipAddress: 'sql-prod.database.windows.net',
    cpuUtilization: 48.0,
    memoryUtilization: 65.0,
    diskUtilization: 60.0,
    networkInMbps: 40.0,
    networkOutMbps: 85.0,
    costPerHour: 0.44,
    monthlyCost: 316.80,
    launchTime: '2026-04-01T00:00:00Z',
    tags: { Environment: 'production', ResourceGroup: 'rg-database', Provider: 'Azure' },
    details: {
      engine: 'Azure SQL v12',
      storageGb: 500,
      iops: 6000,
    },
  },
  {
    id: 'az-blob-media-prod',
    name: 'azblobmediastorageprod',
    type: 'azure_blob',
    provider: 'azure',
    region: 'westeurope',
    status: 'running',
    cpuUtilization: 0,
    memoryUtilization: 0,
    costPerHour: 0.35,
    monthlyCost: 252.00,
    launchTime: '2026-03-10T00:00:00Z',
    tags: { Environment: 'production', Tier: 'Hot', Provider: 'Azure' },
    details: {
      storageGb: 12600,
      objectCount: 2900000,
    },
  },
  {
    id: 'az-disk-orphaned-vol-01',
    name: 'az-managed-disk-temp-01',
    type: 'ebs',
    provider: 'azure',
    region: 'eastus',
    status: 'stopped',
    costPerHour: 0.045,
    monthlyCost: 32.40,
    launchTime: '2026-07-20T00:00:00Z',
    cpuUtilization: 0,
    memoryUtilization: 0,
    tags: { Environment: 'orphan', ResourceGroup: 'rg-temp', Provider: 'Azure' },
    details: {
      storageGb: 512,
      attachedTo: 'None (Unattached Managed Disk for 30 days)',
    },
  },

  // --- GCP RESOURCES ---
  {
    id: 'gcp-gce-batch-us-central1',
    name: 'gcp-batch-worker-01',
    type: 'gcp_vm',
    provider: 'gcp',
    region: 'us-central1',
    status: 'running',
    instanceType: 'n2-standard-8',
    ipAddress: '34.122.90.14',
    cpuUtilization: 94.2, // High CPU on GCP
    memoryUtilization: 76.0,
    diskUtilization: 52.0,
    networkInMbps: 75.0,
    networkOutMbps: 160.0,
    costPerHour: 0.388,
    monthlyCost: 279.36,
    launchTime: '2026-07-10T00:00:00Z',
    tags: { env: 'production', app: 'batch-pipeline', provider: 'GCP' },
    details: {
      storageGb: 200,
      stateReason: 'High CPU on Compute Engine: Data ingestion worker thread saturation',
    },
  },
  {
    id: 'gcp-gce-frontend-02',
    name: 'gcp-frontend-instance-02',
    type: 'gcp_vm',
    provider: 'gcp',
    region: 'us-central1',
    status: 'running',
    instanceType: 'e2-medium',
    ipAddress: '34.122.90.15',
    cpuUtilization: 38.0,
    memoryUtilization: 52.0,
    diskUtilization: 30.0,
    networkInMbps: 25.0,
    networkOutMbps: 60.0,
    costPerHour: 0.034,
    monthlyCost: 24.48,
    launchTime: '2026-08-01T00:00:00Z',
    tags: { env: 'production', app: 'frontend-web', provider: 'GCP' },
    details: {
      storageGb: 50,
    },
  },
  {
    id: 'gcp-cloudsql-postgres-prod',
    name: 'gcp-sql-postgres-main',
    type: 'gcp_sql',
    provider: 'gcp',
    region: 'us-central1',
    status: 'running',
    instanceType: 'db-custom-4-16384',
    ipAddress: '10.128.0.4',
    cpuUtilization: 44.0,
    memoryUtilization: 68.0,
    diskUtilization: 58.0,
    networkInMbps: 50.0,
    networkOutMbps: 110.0,
    costPerHour: 0.36,
    monthlyCost: 259.20,
    launchTime: '2026-05-01T00:00:00Z',
    tags: { env: 'production', service: 'cloud-sql', provider: 'GCP' },
    details: {
      engine: 'PostgreSQL 15',
      storageGb: 400,
      iops: 4000,
    },
  },
  {
    id: 'gcp-gcs-app-static-bucket',
    name: 'gcp-static-assets-global',
    type: 'gcp_storage',
    provider: 'gcp',
    region: 'us-central1',
    status: 'running',
    cpuUtilization: 0,
    memoryUtilization: 0,
    costPerHour: 0.28,
    monthlyCost: 201.60,
    launchTime: '2026-04-15T00:00:00Z',
    tags: { env: 'production', bucket: 'static-cdn', provider: 'GCP' },
    details: {
      storageGb: 9800,
      objectCount: 1800000,
    },
  },
  {
    id: 'gcp-pd-unused-disk-03',
    name: 'gcp-pd-ssd-orphaned-03',
    type: 'ebs',
    provider: 'gcp',
    region: 'us-central1',
    status: 'stopped',
    costPerHour: 0.038,
    monthlyCost: 27.36,
    launchTime: '2026-07-28T00:00:00Z',
    cpuUtilization: 0,
    memoryUtilization: 0,
    tags: { env: 'orphan', provider: 'GCP' },
    details: {
      storageGb: 300,
      attachedTo: 'None (Unattached Persistent Disk for 24 days)',
    },
  },
];

export const initialResources: CloudResource[] = starterSampleResources;

// Generate 24-hour Telemetry Metric Data Points based strictly on user's active resources
export function generate24HourMetrics(resources: CloudResource[] = []): MetricDataPoint[] {
  const points: MetricDataPoint[] = [];
  const now = new Date();

  // If user has no resources yet, return clean baseline
  if (resources.length === 0) {
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      points.push({
        timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpu: 0,
        memory: 0,
        networkIn: 0,
        networkOut: 0,
        diskIo: 0,
        cost: 0,
        requestsPerSec: 0,
        latencyMs: 0,
        errorRate: 0,
      });
    }
    return points;
  }

  const runningResources = resources.filter((r) => r.status === 'running');
  const baseAvgCpu = runningResources.length > 0
    ? runningResources.reduce((s, r) => s + r.cpuUtilization, 0) / runningResources.length
    : 20;

  const baseAvgMem = runningResources.length > 0
    ? runningResources.reduce((s, r) => s + r.memoryUtilization, 0) / runningResources.length
    : 30;

  const baseHourlyCost = resources.reduce((s, r) => s + r.costPerHour, 0);

  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    const trafficMultiplier = Math.sin((hour - 6) / 24 * Math.PI * 2) * 0.25 + 0.75;
    
    let cpu = baseAvgCpu * trafficMultiplier + (Math.random() * 4 - 2);
    let mem = baseAvgMem * (0.9 + trafficMultiplier * 0.1) + (Math.random() * 2 - 1);
    let netIn = (runningResources.length * 25) * trafficMultiplier + Math.random() * 15;
    let netOut = (runningResources.length * 65) * trafficMultiplier + Math.random() * 30;
    let diskIo = (runningResources.length * 120) * trafficMultiplier + Math.random() * 40;
    let cost = baseHourlyCost * trafficMultiplier;
    let requests = Math.round((runningResources.length * 80) * trafficMultiplier + Math.random() * 20);
    let latency = 20 + (cpu > 80 ? 45 : 0) + Math.random() * 6;
    let errorRate = cpu > 85 ? 1.2 : 0.02;

    points.push({
      timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cpu: Math.min(100, Math.max(0, Math.round(cpu * 10) / 10)),
      memory: Math.min(100, Math.max(0, Math.round(mem * 10) / 10)),
      networkIn: Math.round(netIn),
      networkOut: Math.round(netOut),
      diskIo: Math.round(diskIo),
      cost: Math.round(cost * 100) / 100,
      requestsPerSec: requests,
      latencyMs: Math.round(latency),
      errorRate: Math.round(errorRate * 100) / 100,
    });
  }

  return points;
}

// Initial Alert Stream
export const initialAlerts: CloudAlert[] = [];

// Initial Audit Logs
export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'aud-init-01',
    timestamp: new Date().toISOString(),
    provider: 'aws',
    actor: 'CloudOps Core Engine',
    actorType: 'system',
    action: 'SYSTEM_INITIALIZED',
    targetResource: 'User Cloud Workspace',
    targetId: 'workspace-root',
    status: 'success',
    details: 'User CloudOps workspace initialized in User-Data-Only mode',
    ipAddress: '127.0.0.1',
    region: 'us-east-1',
  },
];

// Initial Reports
export const initialReports: InfrastructureReport[] = [];
