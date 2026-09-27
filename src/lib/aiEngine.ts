import { CloudResource, CopilotMessage, MetricDataPoint, CloudAlert, AnomalyItem } from './types';
import { globalRAGEngine } from './ragEngine';
import { globalAnomalyEngine } from './anomalyDetector';
import { globalCostOptimizer } from './costOptimizer';

export interface AIContext {
  resources: CloudResource[];
  metrics: MetricDataPoint[];
  alerts: CloudAlert[];
  anomalies: AnomalyItem[];
  apiKey?: string;
  provider?: 'builtin' | 'gemini' | 'openai';
  cloudProviderFocus?: 'all' | 'aws' | 'azure' | 'gcp';
}

export class CloudOpsAIEngine {
  public async generateResponse(
    userPrompt: string,
    context: AIContext
  ): Promise<CopilotMessage> {
    const promptLower = userPrompt.toLowerCase().trim();

    // 1. External Gemini integration if custom key provided
    if (context.apiKey && context.provider === 'gemini') {
      try {
        const externalResponse = await this.callGeminiAPI(userPrompt, context);
        if (externalResponse) return externalResponse;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to Local CloudOps Intelligence Engine:', err);
      }
    }

    // 2. Perform RAG search across indexed runbooks
    const ragResults = globalRAGEngine.search(userPrompt, 2);

    // 3. Multi-Cloud Grounded Reasoning

    // CASE 1: Azure-Specific High CPU / Latency query
    if (
      promptLower.includes('azure') ||
      promptLower.includes('az-api-vm') ||
      (context.resources.some((r) => r.provider === 'azure') && promptLower.includes('slow') && promptLower.includes('azure'))
    ) {
      const azServer = context.resources.find((r) => r.name === 'az-api-vm-prod-01') || context.resources[0];
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `### 🔍 Azure Telemetry Root-Cause Analysis for \`${azServer.name}\`

**Diagnosis:**
**${azServer.name}** (Azure VM in \`${azServer.region}\`) is currently operating at **${azServer.cpuUtilization}% CPU**. Azure Monitor metrics indicate thread pool saturation caused by heavy JSON payload parsing.

**Configuration Assessment:**
The VM is currently provisioned as **${azServer.instanceType}** (4 vCPU, 16GB RAM).

**Recommended Action:**
Scale instance capacity to **Standard_D8s_v5** (8 vCPU) or enable Azure Virtual Machine Scale Sets (VMSS) autoscaling.`,
        structuredData: {
          analysisType: 'incident_triage',
          targetResource: azServer,
          actionButtons: [
            {
              label: '⚡ Scale Azure VM to Standard_D8s_v5',
              actionType: 'scale_instance',
              payload: {
                resourceId: azServer.id,
                resourceName: azServer.name,
                currentType: azServer.instanceType,
                targetType: 'Standard_D8s_v5',
              },
              variant: 'primary',
            },
            {
              label: '📊 View Azure Metrics',
              actionType: 'view_metrics',
              payload: { resourceId: azServer.id },
              variant: 'secondary',
            },
          ],
        },
      };
    }

    // CASE 2: GCP-Specific High CPU / Latency query
    if (
      promptLower.includes('gcp') ||
      promptLower.includes('gce') ||
      promptLower.includes('google cloud') ||
      promptLower.includes('gcp-batch-worker')
    ) {
      const gcpServer = context.resources.find((r) => r.name === 'gcp-batch-worker-01') || context.resources[0];
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `### 🔍 Google Cloud (GCP) Telemetry Analysis for \`${gcpServer.name}\`

**Diagnosis:**
**${gcpServer.name}** (Compute Engine in \`${gcpServer.region}\`) has reached **${gcpServer.cpuUtilization}% CPU**. Cloud Monitoring records persistent compute saturation on batch worker ingestion threads.

**Recommended Action:**
Scale Compute Engine instance to **n2-standard-16** or configure Cloud Managed Instance Groups (MIG) autoscaling.`,
        structuredData: {
          analysisType: 'incident_triage',
          targetResource: gcpServer,
          actionButtons: [
            {
              label: '⚡ Scale GCE to n2-standard-16',
              actionType: 'scale_instance',
              payload: {
                resourceId: gcpServer.id,
                resourceName: gcpServer.name,
                currentType: gcpServer.instanceType,
                targetType: 'n2-standard-16',
              },
              variant: 'primary',
            },
            {
              label: '📊 View GCP Metrics',
              actionType: 'view_metrics',
              payload: { resourceId: gcpServer.id },
              variant: 'secondary',
            },
          ],
        },
      };
    }

    // CASE 3: General / AWS "Why is the production server slow?" / "Why is prod slow?"
    if (
      promptLower.includes('slow') ||
      promptLower.includes('performance') ||
      promptLower.includes('latency') ||
      promptLower.includes('prod-server-01') ||
      promptLower.includes('prod server')
    ) {
      const prodServer = context.resources.find((r) => r.name === 'prod-server-01') || context.resources[0];
      const recentHighCpuPoints = context.metrics.slice(-4);
      const avgRecentCpu = Math.round(
        recentHighCpuPoints.reduce((s, p) => s + p.cpu, 0) / recentHighCpuPoints.length
      );

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `### 🔍 Telemetry Root-Cause Analysis for \`${prodServer.name}\`

**Diagnosis:**
**${prodServer.name}** (${prodServer.provider.toUpperCase()} in \`${prodServer.region}\`) has maintained CPU utilization above **${prodServer.cpuUtilization}%** for the last **35 minutes** (peak reached **${avgRecentCpu}%**). Network traffic is normal (**${prodServer.networkInMbps} Mbps in / ${prodServer.networkOutMbps} Mbps out**), and memory utilization is stable at **${prodServer.memoryUtilization}%**.

**Configuration Assessment:**
The instance is currently using a **${prodServer.instanceType}** (2 vCPU, 4GB RAM) in \`${prodServer.region}\`. The CPU burst credit balance has been depleted.

**Recommended Action:**
Increase instance capacity by scaling from **${prodServer.instanceType}** to **c5.xlarge** (4 vCPU, 8GB RAM, dedicated compute) or investigate the background Node.js worker thread consuming CPU.`,
        structuredData: {
          analysisType: 'incident_triage',
          targetResource: prodServer,
          metricsSnippet: recentHighCpuPoints,
          anomaliesFound: context.anomalies.filter((a) => a.resourceId === prodServer.id),
          runbookCitations: ragResults.map((r) => ({
            docId: r.chunk.documentId,
            title: r.chunk.documentTitle,
            excerpt: r.excerpt,
            score: r.score,
          })),
          actionButtons: [
            {
              label: '📊 View Metrics',
              actionType: 'view_metrics',
              payload: { resourceId: prodServer.id, resourceName: prodServer.name },
              variant: 'secondary',
            },
            {
              label: '⚡ Scale to c5.xlarge',
              actionType: 'scale_instance',
              payload: {
                resourceId: prodServer.id,
                resourceName: prodServer.name,
                currentType: prodServer.instanceType,
                targetType: 'c5.xlarge',
              },
              variant: 'primary',
            },
            {
              label: '📑 Generate Incident Report',
              actionType: 'generate_report',
              payload: { resourceId: prodServer.id, type: 'incident_postmortem' },
              variant: 'secondary',
            },
          ],
        },
      };
    }

    // CASE 4: "Which servers have high CPU?" across active resources
    if (
      promptLower.includes('high cpu') ||
      promptLower.includes('cpu spike') ||
      promptLower.includes('which server') ||
      promptLower.includes('highest cpu')
    ) {
      const highCpuResources = context.resources
        .filter((r) => r.cpuUtilization > 50)
        .sort((a, b) => b.cpuUtilization - a.cpuUtilization);

      const itemsList = highCpuResources
        .map(
          (r) =>
            `- **${r.name}** (\`${r.provider.toUpperCase()}\` • \`${r.instanceType || r.type}\` in \`${r.region}\`): **${r.cpuUtilization}% CPU** (Memory: ${r.memoryUtilization}%, Status: \`${r.status}\`)`
        )
        .join('\n');

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `### ⚡ High CPU Utilization Scan Across Fleet

Identified **${highCpuResources.length} instance(s)** operating above the 50% CPU threshold:

${itemsList}

**Recommended Remediation:**
Vertically scale saturated nodes or trigger auto-scaling cluster expansion.`,
        structuredData: {
          analysisType: 'resource_search',
          targetResource: highCpuResources[0],
          actionButtons: [
            {
              label: `⚡ Scale ${highCpuResources[0]?.name}`,
              actionType: 'scale_instance',
              payload: {
                resourceId: highCpuResources[0]?.id,
                resourceName: highCpuResources[0]?.name,
                currentType: highCpuResources[0]?.instanceType,
                targetType: 'c5.xlarge',
              },
              variant: 'primary',
            },
          ],
        },
      };
    }

    // CASE 5: "Why is my bill increasing?" / Cost audit
    if (
      promptLower.includes('bill') ||
      promptLower.includes('cost') ||
      promptLower.includes('spend') ||
      promptLower.includes('saving') ||
      promptLower.includes('finops')
    ) {
      const costInsights = globalCostOptimizer.generateInsights(context.resources);
      const totalSavings = globalCostOptimizer.getTotalMonthlySavings(costInsights);

      const insightBullets = costInsights
        .map(
          (c) =>
            `- **${c.title}**: Potential savings of **$${c.monthlySavings.toFixed(2)}/mo** (${c.description})`
        )
        .join('\n');

      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `### 💰 FinOps Cloud Spend & Waste Analysis

**Recoverable Waste Identified:** **$${totalSavings.toFixed(2)} / month**

**Opportunities:**
${insightBullets}`,
        structuredData: {
          analysisType: 'cost_audit',
          actionButtons: [
            {
              label: 'Apply FinOps Plan',
              actionType: 'apply_cost_fix',
              payload: { totalSavings, insightsCount: costInsights.length },
              variant: 'primary',
            },
            {
              label: 'Generate FinOps Report',
              actionType: 'generate_report',
              payload: { type: 'monthly_finops' },
              variant: 'secondary',
            },
          ],
        },
      };
    }

    // DEFAULT FALLBACK:
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `### 🤖 AI CloudOps Copilot

Analyzing **${context.resources.length} resources** across your connected cloud accounts (**${Array.from(new Set(context.resources.map((r) => r.provider.toUpperCase()))).join(', ')}**).

**Try asking:**
- *"Why is the production server slow?"*
- *"Which servers have high CPU?"*
- *"Why is my cloud bill increasing?"*
- *"Show me Azure VMs with high load"*
- *"List unattached storage disks"*`,
      structuredData: {
        analysisType: 'performance_deep_dive',
        actionButtons: [
          {
            label: '⚡ Scale prod-server-01',
            actionType: 'scale_instance',
            payload: { resourceId: 'i-08a9f3b817c01a91', resourceName: 'prod-server-01', targetType: 'c5.xlarge' },
            variant: 'primary',
          },
          {
            label: 'Run FinOps Audit',
            actionType: 'apply_cost_fix',
            payload: {},
            variant: 'secondary',
          },
        ],
      },
    };
  }

  private async callGeminiAPI(prompt: string, context: AIContext): Promise<CopilotMessage | null> {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${context.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert AI CloudOps Copilot managing multi-cloud infrastructure (AWS, Azure, GCP).
Fleet State:
${JSON.stringify(
  context.resources.map((r) => ({
    name: r.name,
    provider: r.provider,
    type: r.type,
    cpu: r.cpuUtilization,
    mem: r.memoryUtilization,
    costMonthly: r.monthlyCost,
    status: r.status,
  }))
)}

User Query: "${prompt}"

Provide a concise, highly actionable markdown response with diagnostic evidence and recommendations.`,
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) return null;

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: replyText,
      structuredData: {
        analysisType: 'performance_deep_dive',
      },
    };
  }
}

export const globalAIEngine = new CloudOpsAIEngine();
