import { RunbookDocument, RAGChunk } from './types';

// Pre-seeded high-quality Cloud Engineering & DevOps Runbooks
export const initialRunbooks: RunbookDocument[] = [
  {
    id: 'rb-cpu-troubleshoot',
    title: 'High CPU Utilization & Compute Saturation Incident Runbook',
    category: 'troubleshooting',
    tags: ['ec2', 'cpu', 'linux', 'incident-response', 'scaling'],
    author: 'DevOps Platform Team',
    lastUpdated: '2026-09-20',
    chunksCount: 4,
    content: `# High CPU Utilization & Compute Saturation Incident Runbook

## 1. Overview & Triage Criteria
When an EC2 instance or compute node sustains CPU utilization above 85% for more than 15 minutes, immediate triage is required to prevent latency spikes and cascading HTTP 504 gateway timeouts.

## 2. Step-by-Step Diagnostic Workflow
1. **Identify High-Load Processes**:
   - Connect via AWS Systems Manager (SSM) Session Manager.
   - Run \`top -b -n 1 | head -n 20\` or \`htop\` to identify top CPU consumers.
   - Run \`pidstat -u 2 5\` to determine if CPU time is user space (%usr), kernel (%system), or I/O wait (%iowait).

2. **Differentiate CPU Load vs I/O Wait**:
   - If \`%iowait\` is high (>25%), the bottleneck is disk IOPS or EBS burst balance exhaustion.
   - If \`%usr\` is high (>80%), application thread contention or high request volume is occurring.

3. **Check Connection & Thread Pools**:
   - Verify Node.js/Python thread pool saturation using application APM metrics.
   - Check if incoming network request rate has doubled.

## 3. Recommended Remediation Actions
- **Immediate Horizontal Scale**: Add additional instances to the target Auto Scaling Group (ASG).
- **Vertical Resize (Scale Instance)**:
  - If on a burstable instance (\`t3.medium\`, \`t3.large\`) and CPU credit balance is depleted, upgrade to compute-optimized instance family (\`c5.xlarge\` or \`c6g.xlarge\`).
- **Worker Process Restart**: If a single thread is stuck in an infinite regex loop, trigger a graceful worker restart via \`systemctl reload app-service\`.

## 4. Post-Incident Review
- Create a CloudWatch CPU metric alarm at 75% warning and 85% critical.
- Enable automatic predictive scaling on the target Auto Scaling Group.`,
  },
  {
    id: 'rb-k8s-oom-triage',
    title: 'Kubernetes Pod OOMKilled & Memory Saturation SOP',
    category: 'incident_response',
    tags: ['k8s', 'memory', 'oomkilled', 'containers', 'eks'],
    author: 'Site Reliability Engineering',
    lastUpdated: '2026-09-18',
    chunksCount: 3,
    content: `# Kubernetes Pod OOMKilled & Memory Saturation SOP

## 1. Diagnostic Indicators
- Pod status changes to \`CrashLoopBackOff\` or \`OOMKilled\` (Exit Code 137).
- Container memory working set exceeds 80% of defined \`resources.limits.memory\`.

## 2. Investigation Commands
\`\`\`bash
# Check pod termination reason and exit code
kubectl describe pod <pod-name> -n <namespace> | grep -E "Exit Code|Reason|Last State"

# Inspect real-time memory consumption of running containers
kubectl top pods -n <namespace> --sort-by=memory

# View node kernel messages for OOM invoker logs
kubectl logs <pod-name> --previous -n <namespace>
\`\`\`

## 3. Immediate Remediation
1. **Increase Container Limits**:
   - Update Deployment manifest to increase \`memory: 1Gi\` -> \`memory: 2Gi\`.
   - Ensure \`requests.memory\` is set to at least 70% of \`limits.memory\` to guarantee scheduling.
2. **Enable Node Autoscaler**:
   - Verify Karpenter or Cluster Autoscaler can provision larger memory nodes (\`r6i.large\`).
3. **Capture Heap Profile**:
   - If memory increases linearly without plateauing, trigger a V8/JVM heap dump before pod restart to debug memory leaks.`,
  },
  {
    id: 'rb-finops-waste-cleanup',
    title: 'FinOps Cloud Waste Reduction & Orphaned Resource Policy',
    category: 'cost_optimization',
    tags: ['finops', 'aws', 'cost', 'ebs', 's3', 'rightsizing'],
    author: 'FinOps Working Group',
    lastUpdated: '2026-09-22',
    chunksCount: 3,
    content: `# FinOps Cloud Waste Reduction & Orphaned Resource Policy

## 1. Unattached EBS Volumes
- **Policy**: EBS volumes unattached from any EC2 instance for more than 7 consecutive days are flagged as orphaned waste.
- **Action**: Take a final EBS snapshot for compliance retention, then delete the unattached volume.
- **Estimated Savings**: A 500 GB gp3 volume costs ~$40.00/month. Deleting 10 orphaned volumes recovers $400/month.

## 2. Idle & Underutilized EC2 Instances
- **Criteria**: Instances with maximum 95th-percentile CPU < 5% and network throughput < 1 MB/s over a 14-day window.
- **Action**: Stop or terminate staging/dev instances. Apply scheduled start/stop scripts (08:00 to 18:00 weekdays only).
- **Rightsizing**: Overprovisioned instances (e.g., m5.2xlarge operating at 10% CPU) should be downsized to m5.large.

## 3. S3 Lifecycle Transition Rules
- Move non-frequently accessed bucket objects (>30 days old) to S3 Standard-Infrequent Access (S3 Standard-IA).
- Move archival objects (>90 days old) to S3 Glacier Instant Retrieval or S3 Glacier Flexible Archive to save up to 68% in storage costs.`,
  },
  {
    id: 'rb-rds-deadlock-triage',
    title: 'PostgreSQL RDS Connection Exhaustion & Deadlock Resolution',
    category: 'troubleshooting',
    tags: ['rds', 'postgres', 'database', 'iops', 'deadlocks'],
    author: 'Database Engineering',
    lastUpdated: '2026-09-15',
    chunksCount: 3,
    content: `# PostgreSQL RDS Connection Exhaustion & Deadlock Resolution

## 1. Symptoms & CloudWatch Alerts
- \`DatabaseConnections\` metric reaches 85%+ of \`max_connections\` limit.
- API latency surges with errors: \`FATAL: remaining connection slots are reserved for non-replication superuser connections\`.

## 2. Live Query Analysis
\`\`\`sql
-- Find blocking queries and lock holders
SELECT blocked_locks.pid AS blocked_pid,
       blocking_locks.pid AS blocking_pid,
       blocked_activity.query AS blocked_statement,
       blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
\`\`\`

## 3. Mitigation Steps
1. **Terminate Long-Running Idle Transactions**:
   \`\`\`sql
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND state_change < current_timestamp - INTERVAL '5 minutes';
   \`\`\`
2. **Deploy AWS RDS Proxy**:
   - Enable RDS Proxy to pool connection requests and prevent app instances from spawning unmanaged connections.
3. **Scale Compute Capacity**:
   - If CPU is pegged due to query execution plans, scale to \`db.r6g.2xlarge\` or provision read replicas for heavy analytical queries.`,
  },
  {
    id: 'rb-bluegreen-rollback',
    title: 'Zero-Downtime Blue/Green Deployment Rollback SOP',
    category: 'deployment',
    tags: ['deployment', 'rollback', 'alb', 'dns', 'canary'],
    author: 'DevOps Platform Team',
    lastUpdated: '2026-08-30',
    chunksCount: 2,
    content: `# Zero-Downtime Blue/Green Deployment Rollback SOP

## 1. Rollback Trigger Criteria
- HTTP 5xx error rate increases above 1.0% in the first 10 minutes of release.
- P99 latency exceeds 350ms on target target-group.
- Critical synthetic test failure detected on core checkout API.

## 2. Emergency Rollback Execution
1. **Route 53 / ALB Traffic Shift**:
   - Immediately set Target Group weight of the Green environment to 0%.
   - Restore 100% traffic weight to Blue (known good) Target Group.
2. **Verify Blue Health**:
   - Check CloudWatch TargetGroup 2xx response rate returns to >99.9%.
3. **Isolate Green Environment for Forensics**:
   - Keep Green target group active in isolation for 60 minutes to extract core dumps and application error logs.`,
  },
];

// Chunking and Vector Similarity Engine
export class RAGEngine {
  private runbooks: RunbookDocument[] = [];
  private chunks: RAGChunk[] = [];

  constructor() {
    this.runbooks = [...initialRunbooks];
    this.reindexChunks();
  }

  public getRunbooks(): RunbookDocument[] {
    return this.runbooks;
  }

  public addRunbook(doc: Omit<RunbookDocument, 'id' | 'chunksCount' | 'lastUpdated'>): RunbookDocument {
    const newDoc: RunbookDocument = {
      ...doc,
      id: `rb-${Date.now().toString(36)}`,
      chunksCount: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    this.runbooks.unshift(newDoc);
    this.reindexChunks();
    return newDoc;
  }

  public deleteRunbook(id: string): boolean {
    const prevLen = this.runbooks.length;
    this.runbooks = this.runbooks.filter((rb) => rb.id !== id);
    if (this.runbooks.length !== prevLen) {
      this.reindexChunks();
      return true;
    }
    return false;
  }

  private reindexChunks(): void {
    this.chunks = [];

    for (const doc of this.runbooks) {
      const sections = doc.content.split(/\n(?=## )/g);
      
      sections.forEach((sec, idx) => {
        const text = sec.trim();
        if (!text) return;

        // Extract keywords
        const words = text
          .toLowerCase()
          .replace(/[^a-z0-9\s_-]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 3);

        const uniqueKeywords = Array.from(new Set(words));
        const embedding = this.generateEmbedding(text);

        this.chunks.push({
          id: `${doc.id}-chunk-${idx}`,
          documentId: doc.id,
          documentTitle: doc.title,
          content: text,
          keywords: uniqueKeywords,
          embeddingVector: embedding,
        });
      });

      // update doc chunksCount
      doc.chunksCount = sections.length;
    }
  }

  // Generate deterministic TF-IDF / character n-gram pseudo-embedding vector for cosine similarity
  private generateEmbedding(text: string, dimensions = 32): number[] {
    const vector = new Array(dimensions).fill(0);
    const normalized = text.toLowerCase();
    
    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      const dim = (charCode * (i + 1)) % dimensions;
      vector[dim] += 1;
    }

    // L2 Normalize
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map((v) => v / norm);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const mag = Math.sqrt(normA) * Math.sqrt(normB);
    return mag === 0 ? 0 : dot / mag;
  }

  // Query Knowledge Base using hybrid semantic vector similarity + keyword boosting
  public search(query: string, topK = 3): { chunk: RAGChunk; score: number; excerpt: string }[] {
    if (!query.trim()) return [];

    const queryVec = this.generateEmbedding(query);
    const queryTokens = query
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const scored = this.chunks.map((chunk) => {
      // 1. Vector cosine similarity (0 to 1)
      let vectorScore = 0;
      if (chunk.embeddingVector) {
        vectorScore = this.cosineSimilarity(queryVec, chunk.embeddingVector);
      }

      // 2. Keyword lexical overlap score
      let keywordHits = 0;
      for (const token of queryTokens) {
        if (chunk.content.toLowerCase().includes(token)) {
          keywordHits += 1;
        }
      }
      const lexicalScore = queryTokens.length > 0 ? keywordHits / queryTokens.length : 0;

      // Hybrid combination
      const combinedScore = Math.min(1.0, vectorScore * 0.4 + lexicalScore * 0.6);

      // Create readable excerpt
      let excerpt = chunk.content.slice(0, 220);
      if (chunk.content.length > 220) excerpt += '...';

      return {
        chunk,
        score: Math.round(combinedScore * 1000) / 1000,
        excerpt,
      };
    });

    // Sort descending by relevance score
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

// Global Singleton for in-memory RAG
export const globalRAGEngine = new RAGEngine();
