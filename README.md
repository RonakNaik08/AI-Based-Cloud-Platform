# AI CloudOps Manager — Intelligent Cloud Infrastructure Management Platform

An autonomous, enterprise-grade AI CloudOps Platform that connects to multi-cloud infrastructure (AWS/Azure/GCP), monitors live telemetry, detects real-time statistical & machine learning anomalies, automates FinOps waste elimination, and features an interactive **RAG-Grounded AI Copilot** capable of multi-step diagnostic reasoning and safe human-in-the-loop action orchestration.

---

## 🚀 Enterprise Modules & Capabilities

| Module | Purpose & Capabilities |
|---|---|
| **1. Executive Dashboard** | Live CPU, memory, storage, network throughput, instance count, monthly burn rate, health score, and interactive Recharts telemetry time-series charts. |
| **2. Visual Cloud Topology Map** | Interactive multi-tier architecture dependency visualizer (Traffic Ingress &rarr; Compute &rarr; Database &rarr; Storage) with per-node inspector. |
| **3. Resource Management** | Multi-region, multi-cloud fleet manager for EC2, RDS PostgreSQL, S3 Buckets, EBS Volumes, Lambda Serverless, Azure VMs, GCP Compute, and Kubernetes Pods. |
| **4. AI Copilot (The Crown Jewel)** | Grounded in structured fleet telemetry + RAG engineering runbooks. Analyzes queries, returns root cause evidence, embedded charts, and clickable action triggers (`[Scale Instance] [Remediate Finding] [Rollback]`). |
| **5. AI Anomaly Detection** | Statistical Z-Score deviation (+3.82σ), Rolling IQR (2.4x), and heuristic memory drift leak models with real-time confidence scores and fault injection sandbox. |
| **6. Autonomous Self-Healing** | Event-driven automation rules builder (Trigger &rarr; Condition &rarr; Action) for auto-scaling, container crash restarts, and idle resource reclamation. |
| **7. Kubernetes (K8s) Fleet** | Cluster pod & node resource monitoring, CrashLoopBackOff/OOMKilled triaging, and real-time pod log terminal inspector. |
| **8. CI/CD & Commit Correlator** | Outage root-cause analysis correlated with Git commits and CI/CD pipelines, complete with 1-click automated GitOps rollback. |
| **9. Cloud Security & Compliance (CSPM)** | Automated CIS Benchmark 3.0 & SOC 2 fleet scans, S3 public exposure alerts, SG 0.0.0.0/0 SSH audit, and 1-click AI security remediation. |
| **10. Cost Optimization (FinOps)** | Automated detection of idle compute, unattached/orphaned EBS disks, overprovisioned rightsizing candidates, and S3 tiering transitions ($536.70/mo savings). |
| **11. Infrastructure as Code (IaC)** | 1-click code generator for Terraform (`main.tf`), AWS CloudFormation (`template.yaml`), and Pulumi (`index.ts`) reflecting current fleet state. |
| **12. Disaster Recovery & Failover** | Multi-region Route 53 DNS failover simulator with live RTO/RPO SLA checks and chaos blackout fault injection. |
| **13. Webhooks & Integrations** | Multi-channel alert dispatcher connecting real-time telemetry to Slack, PagerDuty, Microsoft Teams, and Discord. |
| **14. Automated Actions** | Human-in-the-loop approval workflow with dry-run pre-flight validation, automatic snapshot creation, and rollback safety gates. |
| **15. Incident Command & Alerts** | Real-time severity badges, AI root cause hypotheses, and custom CloudWatch alarm rule builder. |
| **16. Ops Reports** | Daily health digests, weekly reliability summaries, and FinOps audits with markdown, JSON, and clean printable HTML/PDF export. |
| **17. RAG Knowledge Base** | Vector-chunked engineering runbooks (Linux CPU saturation, K8s OOMKilled, PostgreSQL deadlocks, Blue/Green rollbacks) with similarity search playground. |
| **18. Immutable Audit Trail** | Cryptographically timestamped timeline of all human operator, AI Copilot, and autoscaling engine actions with state diff payloads. |

---

## 🛠️ Architecture & Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Recharts, Lucide Icons, Framer Motion
- **Backend & APIs**: Next.js RESTful API Routes (`/api/cloud/*`, `/api/ai/*`)
- **AI Engine & RAG**: Multi-step grounded reasoning, vector chunking & cosine similarity embedding engine, support for custom Gemini 1.5 & OpenAI models
- **DevOps & Infrastructure**: Docker, Docker Compose, Terraform (`main.tf`, `variables.tf`, `outputs.tf`), GitHub Actions CI/CD

---

## ⚡ Quickstart & Running Locally

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Run with Docker
\`\`\`bash
docker compose up --build
\`\`\`

---

## 🧪 Testing the AI Copilot & Anomaly Engine

1. **Test Prompt 1**: Click **"Ask AI Copilot"** and click *"Why is the production server slow?"*
   - AI inspects `prod-server-01` metrics (>90% CPU for 35 mins on `t3.medium`), cites the incident runbook, and generates interactive action buttons: `[View Metrics]`, `[Scale to c5.xlarge]`, `[Generate Report]`.
2. **Test Action Execution**: Click `[Scale to c5.xlarge]`.
   - The Human-in-the-Loop Safety Modal opens, validates the IAM dry-run, captures an EBS snapshot, applies vertical scaling, verifies health checks, and logs the operation to the immutable Audit Log.
3. **Test Anomaly Simulator**: Click **"Inject Fault"** in the top bar.
   - Inject a *"Compute Saturation Loop"*, *"Memory Leak"*, or *"S3 Egress Billing Surge"* and observe the real-time anomaly score and AI triage.
