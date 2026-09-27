export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'k8s';
export type ActiveCloudFilter = 'all' | 'aws' | 'azure' | 'gcp' | 'k8s';
export type CloudRegion = 'us-east-1' | 'us-west-2' | 'eu-west-1' | 'ap-southeast-1' | 'eastus' | 'westeurope' | 'us-central1';
export type ResourceType = 'ec2' | 'rds' | 's3' | 'lambda' | 'ebs' | 'k8s_pod' | 'azure_vm' | 'azure_sql' | 'azure_blob' | 'azure_func' | 'gcp_vm' | 'gcp_sql' | 'gcp_storage';
export type ResourceStatus = 'running' | 'stopped' | 'degraded' | 'pending' | 'terminated';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'investigating' | 'resolved';
export type ConnectionMethod = 'iam_role_arn' | 'access_keys' | 'sso' | 'azure_service_principal' | 'azure_oidc' | 'gcp_service_account' | 'gcp_workload_identity';
export type UserRole = 'admin' | 'devops' | 'finops' | 'viewer';
export type DataSourceMode = 'live' | 'sandbox';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  authProvider?: 'password' | 'aws_sso' | 'azure_ad' | 'google_workspace';
}

export interface CloudPermissionCheck {
  service: string;
  action: string;
  status: 'granted' | 'denied' | 'checking';
  requiredFor: string;
}

export interface CloudDiagnosticResult {
  endpointReachability: { status: 'passed' | 'failed'; latencyMs: number };
  credentialAuth: { status: 'passed' | 'failed'; identityArn: string };
  resourceDiscovery: { status: 'passed' | 'failed'; resourcesFound: number };
  telemetryStream: { status: 'passed' | 'failed'; metricsFps: number };
  permissionsAudit: CloudPermissionCheck[];
  lastTestedAt: string;
}

export interface CloudAccountConnection {
  id: string;
  provider: CloudProvider;
  accountName: string;
  accountId: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  connectionMethod: ConnectionMethod;
  environment: 'production' | 'staging' | 'development';
  region: string;
  latencyMs: number;
  credentials: {
    awsAccessKeyId?: string;
    awsSecretAccessKey?: string;
    awsRoleArn?: string;
    awsExternalId?: string;
    awsRegion?: string;
    azureSubscriptionId?: string;
    azureTenantId?: string;
    azureClientId?: string;
    azureClientSecret?: string;
    gcpProjectId?: string;
    gcpServiceAccountEmail?: string;
    gcpPrivateKeyJson?: string;
  };
  connectedAt: string;
  lastSyncedAt: string;
  syncIntervalSec: number;
  resourcesCount: number;
  diagnostics?: CloudDiagnosticResult;
}

export interface CloudResource {
  id: string;
  name: string;
  type: ResourceType;
  provider: CloudProvider;
  region: CloudRegion;
  status: ResourceStatus;
  instanceType?: string;
  ipAddress?: string;
  cpuUtilization: number;
  memoryUtilization: number;
  diskUtilization?: number;
  networkInMbps?: number;
  networkOutMbps?: number;
  costPerHour: number;
  monthlyCost: number;
  launchTime: string;
  tags: Record<string, string>;
  isLiveData?: boolean;
  details: {
    storageGb?: number;
    iops?: number;
    engine?: string;
    version?: string;
    runtime?: string;
    invocationsPerMin?: number;
    objectCount?: number;
    attachedTo?: string;
    stateReason?: string;
  };
}

export interface MetricDataPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
  diskIo: number;
  cost: number;
  requestsPerSec?: number;
  latencyMs?: number;
  errorRate?: number;
}

export interface AnomalyItem {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  provider?: CloudProvider;
  metricType: 'cpu' | 'memory' | 'network' | 'cost' | 'disk' | 'connections';
  severity: AlertSeverity;
  score: number;
  currentValue: number;
  baselineValue: number;
  unit: string;
  detectionMethod: 'z-score' | 'rolling-iqr' | 'isolation-forest' | 'heuristic-drift';
  detectedAt: string;
  status: 'active' | 'mitigated' | 'acknowledged';
  summary: string;
  aiExplanation: string;
  recommendedAction: {
    title: string;
    actionType: 'scale_instance' | 'stop_resource' | 'restart_service' | 'clean_orphans' | 'adjust_pool' | 'investigate';
    targetResourceId: string;
    params?: Record<string, any>;
    estimatedSavings?: number;
  };
}

export interface CostInsight {
  id: string;
  provider?: CloudProvider;
  category: 'idle_compute' | 'unattached_storage' | 'rightsizing' | 's3_tiering' | 'reserved_instance';
  title: string;
  description: string;
  resourceId: string;
  resourceName: string;
  currentCostMonthly: number;
  projectedCostMonthly: number;
  monthlySavings: number;
  impact: 'low' | 'medium' | 'high';
  recommendedAction: {
    actionType: 'stop_instance' | 'downscale_instance' | 'delete_ebs' | 'transition_s3_tier' | 'purchase_savings_plan';
    targetResourceId: string;
    suggestedSpec?: string;
  };
}

export interface AutomatedAction {
  id: string;
  provider?: CloudProvider;
  title: string;
  description: string;
  actionType: 'scale_instance' | 'stop_instance' | 'start_instance' | 'reboot_instance' | 'delete_unattached_ebs' | 'transition_s3' | 'restart_pod';
  targetResourceId: string;
  targetResourceName: string;
  proposedBy: 'AI Copilot' | 'FinOps Optimizer' | 'Anomaly Detector' | 'DevOps Engineer';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending_approval' | 'executing' | 'completed' | 'rejected' | 'failed';
  requiresConfirmation: boolean;
  dryRunPassed: boolean;
  rollbackPlan: string;
  createdAt: string;
  executedAt?: string;
  executedBy?: string;
  executionLogs?: string[];
  params?: Record<string, any>;
}

export interface CloudAlert {
  id: string;
  provider?: CloudProvider;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  triggeredMetric: string;
  currentValue: string;
  threshold: string;
  triggeredAt: string;
  resolvedAt?: string;
  aiRootCause?: string;
  suggestedRunbookId?: string;
}

export interface RunbookDocument {
  id: string;
  title: string;
  provider?: CloudProvider | 'multi-cloud';
  category: 'troubleshooting' | 'incident_response' | 'cost_optimization' | 'architecture' | 'deployment';
  tags: string[];
  content: string;
  chunksCount: number;
  lastUpdated: string;
  author: string;
}

export interface RAGChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  embeddingVector?: number[];
  keywords: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  provider?: CloudProvider;
  actor: string;
  actorType: 'user' | 'ai_copilot' | 'auto_scaler' | 'system';
  action: string;
  targetResource: string;
  targetId: string;
  status: 'success' | 'failed' | 'pending' | 'rejected';
  details: string;
  ipAddress: string;
  region: string;
  diffPayload?: Record<string, any>;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  content: string;
  structuredData?: {
    analysisType?: 'incident_triage' | 'cost_audit' | 'resource_search' | 'performance_deep_dive' | 'rag_citation';
    targetResource?: CloudResource;
    metricsSnippet?: MetricDataPoint[];
    anomaliesFound?: AnomalyItem[];
    runbookCitations?: { docId: string; title: string; excerpt: string; score: number }[];
    actionButtons?: {
      label: string;
      actionType: 'view_metrics' | 'scale_instance' | 'generate_report' | 'stop_resource' | 'apply_cost_fix' | 'investigate_alert';
      payload: any;
      variant?: 'primary' | 'secondary' | 'danger' | 'warning';
    }[];
  };
}

export interface InfrastructureReport {
  id: string;
  title: string;
  provider?: CloudProvider | 'multi-cloud';
  type: 'daily_digest' | 'weekly_reliability' | 'monthly_finops' | 'incident_postmortem';
  generatedAt: string;
  dateRange: string;
  author: string;
  executiveSummary: string;
  healthScore: number;
  uptimePercentage: number;
  totalSpend: number;
  potentialSavings: number;
  totalIncidents: number;
  resolvedIncidents: number;
  topResourceSpenders: { name: string; type: string; cost: number }[];
  keyRecommendations: string[];
}

// -------------------------------------------------------------
// 1. CLOUD TOPOLOGY & ARCHITECTURE MAP TYPES
// -------------------------------------------------------------
export interface TopologyNode {
  id: string;
  name: string;
  type: ResourceType | 'api_gateway' | 'vpc_router';
  provider: CloudProvider;
  region: string;
  status: ResourceStatus;
  cpuUtilization: number;
  monthlyCost: number;
  tier: 'edge' | 'compute' | 'database' | 'storage';
  dependencies: string[];
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  protocol: 'HTTPS' | 'TCP' | 'PostgreSQL' | 'gRPC' | 'S3-REST';
  latencyMs: number;
  trafficRate: string;
  status: 'healthy' | 'warning' | 'congested';
}

// -------------------------------------------------------------
// 2. CLOUD SECURITY & CSPM COMPLIANCE TYPES
// -------------------------------------------------------------
export type SecurityFindingCategory = 'iam_auth' | 'network_ingress' | 'storage_exposure' | 'disk_encryption' | 'runtime_patch';

export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: SecurityFindingCategory;
  resourceId: string;
  resourceName: string;
  provider: CloudProvider;
  status: 'open' | 'remediated' | 'suppressed';
  cisBenchmark: string;
  remediationAdvice: string;
  detectedAt: string;
}

export interface SecurityPostureScore {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  cisCompliancePct: number;
  soc2CompliancePct: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  openCount: number;
}

// -------------------------------------------------------------
// 3. AUTONOMOUS SELF-HEALING ENGINE TYPES
// -------------------------------------------------------------
export interface SelfHealingRule {
  id: string;
  name: string;
  description: string;
  triggerMetric: 'cpu' | 'memory' | 'unattached_days' | 'error_rate' | 'latency';
  operator: '>' | '<' | '==';
  threshold: number;
  durationMinutes: number;
  actionType: 'scale_instance' | 'stop_instance' | 'restart_pod' | 'delete_ebs' | 'transition_s3';
  targetFilter: { provider?: CloudProvider; tag?: string };
  autoExecute: boolean;
  status: 'active' | 'paused';
  executionCount: number;
  lastExecutedAt?: string;
}

// -------------------------------------------------------------
// 4. KUBERNETES (K8S) FLEET TYPES
// -------------------------------------------------------------
export type PodStatus = 'Running' | 'Pending' | 'CrashLoopBackOff' | 'OOMKilled' | 'Completed';

export interface K8sPod {
  id: string;
  name: string;
  namespace: 'production' | 'staging' | 'monitoring' | 'kube-system';
  nodeName: string;
  status: PodStatus;
  restarts: number;
  cpuCurrentMilli: number;
  cpuLimitMilli: number;
  memoryCurrentMb: number;
  memoryLimitMb: number;
  age: string;
}

export interface K8sNode {
  id: string;
  name: string;
  role: 'control-plane' | 'worker';
  status: 'Ready' | 'NotReady';
  cpuCapacity: string;
  memoryCapacity: string;
  podsCount: number;
  instanceType: string;
}

// -------------------------------------------------------------
// 5. CI/CD & DEPLOYMENT CORRELATOR TYPES
// -------------------------------------------------------------
export interface DeploymentEvent {
  id: string;
  commitSha: string;
  commitMessage: string;
  author: string;
  service: string;
  environment: 'production' | 'staging';
  deployedAt: string;
  status: 'success' | 'failed' | 'rolled_back';
  impactMetric: {
    cpuDelta: number;
    latencyDeltaMs: number;
    errorRateDelta: number;
  };
  correlatedAnomalyId?: string;
}

// -------------------------------------------------------------
// 6. DISASTER RECOVERY & FAILOVER TYPES
// -------------------------------------------------------------
export interface DRRegionStatus {
  region: string;
  role: 'primary' | 'standby';
  health: 'healthy' | 'degraded' | 'offline';
  dnsWeight: number;
  replicationLagSec: number;
  rtoTargetSec: number;
  rpoTargetSec: number;
}

// -------------------------------------------------------------
// 7. WEBHOOKS & NOTIFICATION INTEGRATIONS TYPES
// -------------------------------------------------------------
export interface WebhookIntegration {
  id: string;
  name: string;
  channel: 'slack' | 'pagerduty' | 'teams' | 'discord' | 'email';
  endpointUrl: string;
  events: ('anomaly_detected' | 'action_executed' | 'security_finding' | 'daily_report')[];
  enabled: boolean;
  lastFiredAt?: string;
}
