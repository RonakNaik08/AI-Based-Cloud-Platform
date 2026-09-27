'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Sidebar, ModuleTab } from '@/components/Sidebar';
import { DashboardModule } from '@/components/DashboardModule';
import { ResourceManagementModule } from '@/components/ResourceManagementModule';
import { AICopilotDrawer } from '@/components/AICopilotDrawer';
import { AnomalyDetectionModule } from '@/components/AnomalyDetectionModule';
import { CostOptimizationModule } from '@/components/CostOptimizationModule';
import { AutomatedActionsModule } from '@/components/AutomatedActionsModule';
import { AlertsModule } from '@/components/AlertsModule';
import { ReportsModule } from '@/components/ReportsModule';
import { RAGKnowledgeBaseModule } from '@/components/RAGKnowledgeBaseModule';
import { AuditLogsModule } from '@/components/AuditLogsModule';
import { ActionConfirmModal } from '@/components/ActionConfirmModal';
import { ResourceDetailDrawer } from '@/components/ResourceDetailDrawer';
import { AnomalySimulatorModal } from '@/components/AnomalySimulatorModal';
import { SettingsModal } from '@/components/SettingsModal';
import { CloudConnectivityHub } from '@/components/CloudConnectivityHub';
import { ImportExportModal } from '@/components/ImportExportModal';
import { LoginPage } from '@/components/LoginPage';
import { TopologyMapModule } from '@/components/TopologyMapModule';
import { KubernetesModule } from '@/components/KubernetesModule';
import { SecurityScannerModule } from '@/components/SecurityScannerModule';
import { SelfHealingRulesModule } from '@/components/SelfHealingRulesModule';
import { DeploymentsCorrelatorModule } from '@/components/DeploymentsCorrelatorModule';
import { IaCGeneratorModule } from '@/components/IaCGeneratorModule';
import { DisasterRecoveryModule } from '@/components/DisasterRecoveryModule';
import { IntegrationsModule } from '@/components/IntegrationsModule';

import {
  starterSampleResources,
  initialConnectedAccounts,
  generate24HourMetrics,
  initialAlerts,
  initialAuditLogs,
  initialReports,
} from '@/lib/cloudData';
import { globalAnomalyEngine } from '@/lib/anomalyDetector';
import { globalCostOptimizer } from '@/lib/costOptimizer';
import { globalRAGEngine } from '@/lib/ragEngine';
import { globalAuditLogger } from '@/lib/auditLogger';
import { globalLiveCloudFetcher } from '@/lib/liveCloudFetcher';
import {
  CloudResource,
  MetricDataPoint,
  AnomalyItem,
  CostInsight,
  AutomatedAction,
  CloudAlert,
  InfrastructureReport,
  RunbookDocument,
  AuditLogEntry,
  CloudRegion,
  CloudProvider,
  ActiveCloudFilter,
  ResourceStatus,
  CloudAccountConnection,
  UserProfile,
  UserRole,
  DataSourceMode,
} from '@/lib/types';

const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'usr-alex-admin',
  name: 'Alex Vance',
  email: 'alex.vance@cloudops.ai',
  role: 'admin',
  avatar: 'AV',
  authProvider: 'password',
};

export default function Home() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Multi-Cloud & Navigation State
  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [activeRegion, setActiveRegion] = useState<CloudRegion>('us-east-1');
  const [activeProviderFilter, setActiveProviderFilter] = useState<ActiveCloudFilter>('all');
  const [connectedAccounts, setConnectedAccounts] = useState<CloudAccountConnection[]>(initialConnectedAccounts);

  // Live Data & Telemetry Mode
  const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>('live');
  const [refreshIntervalMs, setRefreshIntervalMs] = useState<number>(3000);

  // Resources state initialized from localStorage or starter sample
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [metrics, setMetrics] = useState<MetricDataPoint[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [alerts, setAlerts] = useState<CloudAlert[]>(initialAlerts);
  const [insights, setInsights] = useState<CostInsight[]>([]);
  const [actions, setActions] = useState<AutomatedAction[]>([]);
  const [reports, setReports] = useState<InfrastructureReport[]>(initialReports);
  const [runbooks, setRunbooks] = useState<RunbookDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Modals & Drawers State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState<string>('');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCloudLoginOpen, setIsCloudLoginOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [selectedResourceForDetail, setSelectedResourceForDetail] = useState<CloudResource | null>(null);

  // Action Confirmation Modal State
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    actionType: string;
    resource: CloudResource | null;
    params: any;
    onExecuteSuccess?: () => void;
  }>({
    isOpen: false,
    actionType: '',
    resource: null,
    params: null,
  });

  // Settings State
  const [apiKey, setApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState<'builtin' | 'gemini' | 'openai'>('builtin');

  // Initialize Auth & User Data on Load
  useEffect(() => {
    let initialRes = starterSampleResources;
    try {
      const savedUser = localStorage.getItem('cloudops_user');
      const savedMode = localStorage.getItem('cloudops_data_mode') as DataSourceMode;
      const savedResources = localStorage.getItem('cloudops_user_resources');

      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        setCurrentUser(DEFAULT_ADMIN_USER);
      }
      if (savedMode) {
        setDataSourceMode(savedMode);
      }
      if (savedResources) {
        initialRes = JSON.parse(savedResources);
      }
    } catch (e) {
      setCurrentUser(DEFAULT_ADMIN_USER);
    } finally {
      setIsAuthChecking(false);
    }

    setResources(initialRes);
    setMetrics(generate24HourMetrics(initialRes));
    setAnomalies(globalAnomalyEngine.scanResources(initialRes));
    setInsights(globalCostOptimizer.generateInsights(initialRes));
    setRunbooks(globalRAGEngine.getRunbooks());
    setAuditLogs(globalAuditLogger.getLogs());

    fetch('/api/cloud/actions')
      .then((res) => res.json())
      .then((data) => {
        if (data.actions) setActions(data.actions);
      })
      .catch((err) => console.warn('Failed to load actions:', err));
  }, []);

  // Save resources to localStorage whenever resources change & re-evaluate anomalies & insights
  useEffect(() => {
    try {
      localStorage.setItem('cloudops_user_resources', JSON.stringify(resources));
    } catch (e) {}

    setAnomalies(globalAnomalyEngine.scanResources(resources));
    setInsights(globalCostOptimizer.generateInsights(resources));
  }, [resources]);

  // Live Telemetry Engine Tick (when in 'live' mode)
  useEffect(() => {
    if (dataSourceMode !== 'live' || resources.length === 0) return;

    const interval = setInterval(() => {
      const { summary, point } = globalLiveCloudFetcher.fetchCurrentTelemetry(resources);

      // Append new live data point
      setMetrics((prev) => {
        if (prev.length === 0) return [point];
        return [...prev.slice(1), point];
      });

      // Fluctuate resource CPU & memory to match real-time live cloud heartbeat
      setResources((prev) => globalLiveCloudFetcher.applyLiveTelemetryToResources(prev));
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [dataSourceMode, refreshIntervalMs, resources]);

  // Handle Manual Force Live Poll
  const handleForceLivePoll = useCallback(() => {
    const { summary, point } = globalLiveCloudFetcher.fetchCurrentTelemetry(resources);
    setMetrics((prev) => {
      if (prev.length === 0) return [point];
      return [...prev.slice(1), point];
    });
    setResources((prev) => globalLiveCloudFetcher.applyLiveTelemetryToResources(prev));

    globalAuditLogger.logAction(
      currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Operator',
      'user',
      'LIVE_POLL_TRIGGERED',
      'Multi-Cloud Telemetry Gateway',
      'stream-live',
      `Manual live telemetry poll completed (Latency: ${point.latencyMs}ms)`
    );
    setAuditLogs([...globalAuditLogger.getLogs()]);
  }, [currentUser, resources]);

  // Handle Authentication
  const handleLogin = (user: UserProfile, mode: DataSourceMode) => {
    setCurrentUser(user);
    setDataSourceMode(mode);
    try {
      localStorage.setItem('cloudops_user', JSON.stringify(user));
      localStorage.setItem('cloudops_data_mode', mode);
    } catch (e) {}

    globalAuditLogger.logAction(
      `${user.name} (${user.role})`,
      'user',
      'USER_SIGN_IN',
      'CloudOps Console',
      user.id,
      `User signed in via ${user.authProvider || 'credentials'} in ${mode.toUpperCase()} data mode`
    );
    setAuditLogs([...globalAuditLogger.getLogs()]);
  };

  const handleSignOut = () => {
    if (currentUser) {
      globalAuditLogger.logAction(
        `${currentUser.name} (${currentUser.role})`,
        'user',
        'USER_SIGN_OUT',
        'CloudOps Console',
        currentUser.id,
        `User logged out of active session`
      );
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem('cloudops_user');
    } catch (e) {}
  };

  const handleSwitchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    const updated: UserProfile = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    try {
      localStorage.setItem('cloudops_user', JSON.stringify(updated));
    } catch (e) {}

    globalAuditLogger.logAction(
      `${currentUser.name}`,
      'user',
      'ROLE_SWITCHED',
      'RBAC Authority',
      currentUser.id,
      `User switched active role to ${newRole.toUpperCase()}`
    );
    setAuditLogs([...globalAuditLogger.getLogs()]);
  };

  const handleToggleDataSourceMode = (mode: DataSourceMode) => {
    setDataSourceMode(mode);
    try {
      localStorage.setItem('cloudops_data_mode', mode);
    } catch (e) {}

    globalAuditLogger.logAction(
      currentUser ? `${currentUser.name} (${currentUser.role})` : 'System',
      'user',
      'DATA_SOURCE_MODE_CHANGED',
      'Telemetry Engine',
      mode,
      `Switched telemetry pipeline to ${mode.toUpperCase()} mode`
    );
    setAuditLogs([...globalAuditLogger.getLogs()]);
  };

  // CRUD Operations on User-Entered Resources
  const handleAddCustomResource = (newRes: CloudResource) => {
    setResources((prev) => [newRes, ...prev]);

    globalAuditLogger.logAction(
      currentUser ? `${currentUser.name} (${currentUser.role})` : 'Admin',
      'user',
      'LIVE_RESOURCE_REGISTERED',
      newRes.name,
      newRes.id,
      `Registered user resource: ${newRes.provider.toUpperCase()} ${newRes.type} in ${newRes.region}`
    );
    setAuditLogs([...globalAuditLogger.getLogs()]);
  };

  const handleUpdateResource = (id: string, updates: Partial<CloudResource>) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );

    globalAuditLogger.logAction(
      currentUser ? `${currentUser.name} (${currentUser.role})` : 'Admin',
      'user',
      'RESOURCE_UPDATED',
      id,
      id,
      `Updated properties for resource ${id}`
    );
    setAuditLogs([...globalAuditLogger.getLogs()]);
  };

  const handleDeleteResource = (id: string) => {
    const target = resources.find((r) => r.id === id);
    setResources((prev) => prev.filter((r) => r.id !== id));

    globalAuditLogger.logAction(
      currentUser ? `${currentUser.name} (${currentUser.role})` : 'Admin',
      'user',
      'RESOURCE_DELETED',
      target?.name || id,
      id,
      `Removed resource ${target?.name || id} from fleet inventory`
    );
    setAuditLogs([...globalAuditLogger.getLogs()]);
  };

  const handleImportResources = (imported: CloudResource[]) => {
    setResources((prev) => [...imported, ...prev]);
    setMetrics(generate24HourMetrics([...imported, ...resources]));

    globalAuditLogger.logAction(
      currentUser ? `${currentUser.name} (${currentUser.role})` : 'Admin',
      'user',
      'INVENTORY_IMPORTED',
      'Fleet Inventory',
      `batch-${imported.length}`,
      `Imported ${imported.length} user resources into cloud inventory`
    );
    setAuditLogs([...globalAuditLogger.getLogs()]);
  };

  const handleClearAllResources = () => {
    setResources([]);
    setMetrics(generate24HourMetrics([]));
    setAnomalies([]);
    setInsights([]);

    globalAuditLogger.logAction(
      currentUser ? `${currentUser.name} (${currentUser.role})` : 'Admin',
      'user',
      'INVENTORY_CLEARED',
      'Fleet Inventory',
      'all',
      `Cleared all cloud resources to begin on a clean blank slate`
    );
    setAuditLogs([...globalAuditLogger.getLogs()]);
  };

  const handleLoadSampleFleet = () => {
    setResources(starterSampleResources);
    setMetrics(generate24HourMetrics(starterSampleResources));

    globalAuditLogger.logAction(
      currentUser ? `${currentUser.name} (${currentUser.role})` : 'Admin',
      'user',
      'SAMPLE_FLEET_LOADED',
      'Fleet Inventory',
      'sample-preset',
      `Loaded demo starter sample fleet across AWS, Azure, and GCP`
    );
    setAuditLogs([...globalAuditLogger.getLogs()]);
  };

  // Filter Data dynamically based on the Active Cloud Provider Selection
  const displayedResources = resources.filter((r) =>
    activeProviderFilter === 'all' ? true : r.provider === activeProviderFilter
  );

  const displayedAlerts = alerts.filter((a) =>
    activeProviderFilter === 'all' ? true : (a.provider || 'aws') === activeProviderFilter
  );

  const displayedAnomalies = anomalies.filter((a) =>
    activeProviderFilter === 'all' ? true : (a.provider || 'aws') === activeProviderFilter
  );

  const displayedInsights = insights.filter((i) =>
    activeProviderFilter === 'all' ? true : (i.provider || 'aws') === activeProviderFilter
  );

  const totalMonthlySavings = globalCostOptimizer.getTotalMonthlySavings(displayedInsights);
  const activeAnomaliesCount = displayedAnomalies.filter((a) => a.status === 'active').length;
  const activeAlertsCount = displayedAlerts.filter((a) => a.status === 'active').length;
  const pendingActionsCount = actions.filter((a) => a.status === 'pending_approval').length;

  // Handlers for Copilot Launches
  const handleOpenCopilotWithPrompt = (prompt: string) => {
    setCopilotPrompt(prompt);
    setIsCopilotOpen(true);
  };

  // Handlers for Account Updates
  const handleUpdateAccount = (updated: CloudAccountConnection) => {
    setConnectedAccounts((prev) => {
      const exists = prev.some((a) => a.provider === updated.provider);
      if (exists) {
        return prev.map((a) => (a.provider === updated.provider ? updated : a));
      }
      return [...prev, updated];
    });

    globalAuditLogger.logAction(
      currentUser ? `${currentUser.name} (${currentUser.role})` : 'Admin',
      'user',
      'CLOUD_ACCOUNT_CONNECTED',
      updated.accountName,
      updated.accountId,
      `Connected credentials for ${updated.provider.toUpperCase()}`
    );
    setAuditLogs([...globalAuditLogger.getLogs()]);
  };

  // Handlers for Actions Triggered from Copilot or Tables
  const handleTriggerActionFromCopilot = (actionType: string, payload: any) => {
    if (actionType === 'view_metrics') {
      setActiveTab('dashboard');
      setIsCopilotOpen(false);
    } else if (actionType === 'generate_report') {
      handleGenerateReport(payload?.type || 'daily_digest');
      setActiveTab('reports');
      setIsCopilotOpen(false);
    } else if (actionType === 'investigate_alert') {
      setActiveTab('alerts');
      setIsCopilotOpen(false);
    } else if (actionType === 'scale_instance') {
      const targetRes =
        resources.find((r) => r.id === payload?.resourceId || r.name === payload?.resourceName) ||
        resources[0];
      if (!targetRes) return;

      setConfirmModalState({
        isOpen: true,
        actionType: 'scale_instance',
        resource: targetRes,
        params: { targetType: payload?.targetType || 'c5.xlarge' },
        onExecuteSuccess: () => {
          setResources((prev) =>
            prev.map((r) =>
              r.id === targetRes.id
                ? {
                    ...r,
                    instanceType: payload?.targetType || 'c5.xlarge',
                    cpuUtilization: 38.4,
                    costPerHour: 0.17,
                    monthlyCost: 122.40,
                    details: { ...r.details, stateReason: 'Scaled. Compute load nominal.' },
                  }
                : r
            )
          );
          const targetAnom = anomalies.find((a) => a.resourceId === targetRes.id);
          if (targetAnom) {
            globalAnomalyEngine.resolveAnomaly(targetAnom.id);
            setAnomalies([...globalAnomalyEngine.getAnomalies()]);
          }
          globalAuditLogger.logAction(
            currentUser ? `${currentUser.name} (${currentUser.role})` : 'Alex (Admin)',
            'user',
            'SCALE_INSTANCE_SUCCESS',
            targetRes.name,
            targetRes.id,
            `Successfully scaled instance from ${targetRes.instanceType} to ${payload?.targetType || 'c5.xlarge'}`
          );
          setAuditLogs([...globalAuditLogger.getLogs()]);
        },
      });
    } else if (actionType === 'apply_cost_fix') {
      setConfirmModalState({
        isOpen: true,
        actionType: 'apply_cost_fix',
        resource: null,
        params: payload,
        onExecuteSuccess: () => {
          setResources((prev) =>
            prev.map((r): CloudResource => {
              if (r.cpuUtilization < 5 && r.status === 'running') {
                return { ...r, status: 'stopped' as ResourceStatus, monthlyCost: 0, costPerHour: 0 };
              }
              return r;
            }).filter((r) => !(r.type === 'ebs' && r.status === 'stopped'))
          );
          globalAuditLogger.logAction(
            currentUser ? `${currentUser.name} (${currentUser.role})` : 'Alex (Admin)',
            'user',
            'FINOPS_OPTIMIZATION_EXECUTED',
            'Fleet Cloud Assets',
            'fleet-cost',
            `Applied FinOps waste elimination on user fleet`
          );
          setAuditLogs([...globalAuditLogger.getLogs()]);
        },
      });
    }
  };

  // Handlers for Anomaly Injection
  const handleInjectFault = (faultType: 'cpu_spike' | 'memory_leak' | 'cost_surge' | 'rds_connections') => {
    const target = resources[0];
    const newAnom = globalAnomalyEngine.injectAnomaly(faultType, target);
    setAnomalies([...globalAnomalyEngine.getAnomalies()]);

    if (target) {
      setResources((prev) =>
        prev.map((r) => {
          if (r.id === target.id) {
            if (faultType === 'cpu_spike') {
              return { ...r, cpuUtilization: 95.8, status: 'running' };
            }
            if (faultType === 'memory_leak') {
              return { ...r, memoryUtilization: 93.6 };
            }
          }
          return r;
        })
      );
    }

    const newAlert: CloudAlert = {
      id: `alt-${Date.now().toString(36)}`,
      provider: newAnom.provider || 'aws',
      title: newAnom.summary,
      description: newAnom.aiExplanation,
      severity: newAnom.severity,
      status: 'active',
      resourceId: newAnom.resourceId,
      resourceName: newAnom.resourceName,
      resourceType: newAnom.resourceType,
      triggeredMetric: newAnom.metricType.toUpperCase(),
      currentValue: `${newAnom.currentValue} ${newAnom.unit}`,
      threshold: `Baseline: ${newAnom.baselineValue}`,
      triggeredAt: new Date().toISOString(),
      aiRootCause: newAnom.aiExplanation,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    globalAuditLogger.logAction(
      'System Fault Injector',
      'system',
      'FAULT_INJECTION_SIMULATED',
      newAnom.resourceName,
      newAnom.resourceId,
      `Simulated fault event: ${newAnom.summary}`
    );
    setAuditLogs([...globalAuditLogger.getLogs()]);
  };

  // Handlers for Anomaly Mitigation
  const handleMitigateAnomaly = (id: string, anomaly: AnomalyItem) => {
    setConfirmModalState({
      isOpen: true,
      actionType: anomaly.recommendedAction.actionType,
      resource: resources.find((r) => r.id === anomaly.resourceId) || null,
      params: anomaly.recommendedAction.params,
      onExecuteSuccess: () => {
        globalAnomalyEngine.resolveAnomaly(id);
        setAnomalies([...globalAnomalyEngine.getAnomalies()]);

        setResources((prev) =>
          prev.map((r) =>
            r.id === anomaly.resourceId
              ? {
                  ...r,
                  cpuUtilization: 35.0,
                  memoryUtilization: 45.0,
                  details: { ...r.details, stateReason: 'Mitigated by AI Orchestrator' },
                }
              : r
          )
        );

        globalAuditLogger.logAction(
          currentUser ? `${currentUser.name} (${currentUser.role})` : 'Alex (Admin)',
          'user',
          'ANOMALY_MITIGATED',
          anomaly.resourceName,
          anomaly.resourceId,
          `Applied AI fix for anomaly on ${anomaly.resourceName}`
        );
        setAuditLogs([...globalAuditLogger.getLogs()]);
      },
    });
  };

  // Handlers for Action Queue
  const handleApproveAction = (actionId: string) => {
    fetch('/api/cloud/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, executionDecision: 'approve' }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.action) {
          setActions((prev) => prev.map((a) => (a.id === actionId ? data.action : a)));
          setAuditLogs([...globalAuditLogger.getLogs()]);
        }
      });
  };

  const handleRejectAction = (actionId: string) => {
    fetch('/api/cloud/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, executionDecision: 'reject' }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.action) {
          setActions((prev) => prev.map((a) => (a.id === actionId ? data.action : a)));
          setAuditLogs([...globalAuditLogger.getLogs()]);
        }
      });
  };

  // Handlers for Report Generation
  const handleGenerateReport = async (type: string) => {
    const res = await fetch('/api/cloud/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportType: type }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.report) {
        setReports((prev) => [data.report, ...prev]);
        globalAuditLogger.logAction(
          'AI Reporter Engine',
          'ai_copilot',
          'REPORT_GENERATED',
          'Executive Dashboard',
          'rep-auto',
          `Generated ${data.report.title}`
        );
        setAuditLogs([...globalAuditLogger.getLogs()]);
      }
    }
  };

  // Handlers for RAG Runbooks
  const handleAddRunbook = async (doc: any) => {
    const res = await fetch('/api/cloud/rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.runbook) {
        setRunbooks((prev) => [data.runbook, ...prev]);
        globalAuditLogger.logAction(
          currentUser ? `${currentUser.name} (${currentUser.role})` : 'Alex (Admin)',
          'user',
          'RUNBOOK_INDEXED',
          data.runbook.title,
          data.runbook.id,
          `Indexed SOP: ${data.runbook.title}`
        );
        setAuditLogs([...globalAuditLogger.getLogs()]);
      }
    }
  };

  // If user is not logged in, show Login Page
  if (!currentUser && !isAuthChecking) {
    return <LoginPage onLogin={handleLogin} defaultMode={dataSourceMode} />;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0b0f19] text-gray-100">
      {/* Top Header Bar */}
      <Header
        activeRegion={activeRegion}
        setActiveRegion={setActiveRegion}
        activeProviderFilter={activeProviderFilter}
        setActiveProviderFilter={setActiveProviderFilter}
        accounts={connectedAccounts}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onSwitchRole={handleSwitchRole}
        dataSourceMode={dataSourceMode}
        onToggleDataSourceMode={handleToggleDataSourceMode}
        refreshIntervalMs={refreshIntervalMs}
        onChangeRefreshInterval={setRefreshIntervalMs}
        onForceLivePoll={handleForceLivePoll}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCloudLogin={() => setIsCloudLoginOpen(true)}
        activeAnomaliesCount={activeAnomaliesCount}
      />

      {/* Main App Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeAnomaliesCount={activeAnomaliesCount}
          activeAlertsCount={activeAlertsCount}
          pendingActionsCount={pendingActionsCount}
          totalMonthlySavings={totalMonthlySavings}
          resourceCount={displayedResources.length}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {activeTab === 'dashboard' && (
              <DashboardModule
                resources={displayedResources}
                metrics={metrics}
                anomalies={displayedAnomalies}
                alerts={displayedAlerts}
                totalMonthlySavings={totalMonthlySavings}
                dataSourceMode={dataSourceMode}
                onForceLivePoll={handleForceLivePoll}
                onNavigateTab={setActiveTab}
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
                onOpenSimulator={() => setIsSimulatorOpen(true)}
                onSelectResource={setSelectedResourceForDetail}
                onOpenCloudLogin={() => setIsCloudLoginOpen(true)}
                onOpenImportExport={() => setIsImportExportOpen(true)}
                onLoadSampleFleet={handleLoadSampleFleet}
              />
            )}

            {activeTab === 'resources' && (
              <ResourceManagementModule
                resources={displayedResources}
                dataSourceMode={dataSourceMode}
                onSelectResource={setSelectedResourceForDetail}
                onRequestAction={(actionType, res, params) => {
                  handleTriggerActionFromCopilot(actionType, { resourceId: res.id, ...params });
                }}
                onAddCustomResource={handleAddCustomResource}
                onUpdateResource={handleUpdateResource}
                onDeleteResource={handleDeleteResource}
                onOpenImportExport={() => setIsImportExportOpen(true)}
                onOpenCloudLogin={() => setIsCloudLoginOpen(true)}
                onLoadSampleFleet={handleLoadSampleFleet}
              />
            )}

            {activeTab === 'copilot' && (
              <div className="rounded-xl border border-gray-800 bg-[#111827] p-8 text-center space-y-3">
                <h3 className="text-base font-bold text-white">AI CloudOps Copilot</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Ask questions about your {activeProviderFilter === 'all' ? 'Multi-Cloud' : activeProviderFilter.toUpperCase()} infrastructure ({displayedResources.length} resources).
                </p>
                <button
                  onClick={() => setIsCopilotOpen(true)}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  Open Copilot Drawer
                </button>
              </div>
            )}

            {activeTab === 'anomalies' && (
              <AnomalyDetectionModule
                anomalies={displayedAnomalies}
                resources={displayedResources}
                onOpenSimulator={() => setIsSimulatorOpen(true)}
                onMitigateAnomaly={handleMitigateAnomaly}
                onAcknowledgeAnomaly={(id) => {
                  globalAnomalyEngine.acknowledgeAnomaly(id);
                  setAnomalies([...globalAnomalyEngine.getAnomalies()]);
                }}
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}

            {activeTab === 'costs' && (
              <CostOptimizationModule
                insights={displayedInsights}
                resources={displayedResources}
                totalMonthlySavings={totalMonthlySavings}
                onApplyOptimization={(insight) => {
                  handleTriggerActionFromCopilot('apply_cost_fix', insight);
                }}
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}

            {activeTab === 'actions' && (
              <AutomatedActionsModule
                actions={actions}
                onApproveAction={handleApproveAction}
                onRejectAction={handleRejectAction}
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsModule
                alerts={displayedAlerts}
                onAcknowledgeAlert={(id) => {
                  setAlerts((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, status: 'acknowledged' } : a))
                  );
                }}
                onResolveAlert={(id) => {
                  setAlerts((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() } : a))
                  );
                }}
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsModule
                reports={reports}
                onGenerateReport={handleGenerateReport}
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}

            {activeTab === 'topology' && (
              <TopologyMapModule
                resources={displayedResources}
                onSelectResource={setSelectedResourceForDetail}
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}

            {activeTab === 'security' && (
              <SecurityScannerModule
                resources={displayedResources}
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}

            {activeTab === 'self_healing' && (
              <SelfHealingRulesModule
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}

            {activeTab === 'k8s' && (
              <KubernetesModule
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}

            {activeTab === 'deployments' && (
              <DeploymentsCorrelatorModule
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}

            {activeTab === 'iac' && (
              <IaCGeneratorModule
                resources={displayedResources}
              />
            )}

            {activeTab === 'disaster_recovery' && (
              <DisasterRecoveryModule />
            )}

            {activeTab === 'integrations' && (
              <IntegrationsModule />
            )}

            {activeTab === 'rag' && (
              <RAGKnowledgeBaseModule
                runbooks={runbooks}
                onAddRunbook={handleAddRunbook}
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}

            {activeTab === 'audit' && <AuditLogsModule logs={auditLogs} />}
          </div>
        </main>
      </div>

      {/* Persistent AI Copilot Side Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        resources={displayedResources}
        metrics={metrics}
        initialPrompt={copilotPrompt}
        onTriggerAction={handleTriggerActionFromCopilot}
        onNavigateTab={setActiveTab}
      />

      {/* Multi-Cloud Connectivity & Integrations Hub */}
      <CloudConnectivityHub
        isOpen={isCloudLoginOpen}
        onClose={() => setIsCloudLoginOpen(false)}
        accounts={connectedAccounts}
        onUpdateAccount={handleUpdateAccount}
        onSyncFleet={async () => {
          setMetrics(generate24HourMetrics(resources));
          setConnectedAccounts((prev) =>
            prev.map((a) => ({
              ...a,
              lastSyncedAt: 'Just now',
              latencyMs: a.provider === 'aws' ? 22 + Math.floor(Math.random() * 6 - 3) : a.provider === 'azure' ? 34 + Math.floor(Math.random() * 6 - 3) : 28 + Math.floor(Math.random() * 6 - 3),
            }))
          );
        }}
        onSelectProviderFilter={(prov) => setActiveProviderFilter(prov)}
        activeProviderFilter={activeProviderFilter}
      />

      {/* Import / Export & Dataset Manager Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        resources={resources}
        onImportResources={handleImportResources}
        onClearAllResources={handleClearAllResources}
        onLoadSampleFleet={handleLoadSampleFleet}
      />

      {/* Human-in-the-Loop Action Confirmation Modal */}
      <ActionConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
        actionType={confirmModalState.actionType}
        resource={confirmModalState.resource}
        params={confirmModalState.params}
        onConfirm={async () => {
          if (confirmModalState.onExecuteSuccess) {
            confirmModalState.onExecuteSuccess();
          }
        }}
      />

      {/* Resource Detail Deep Inspector Drawer */}
      <ResourceDetailDrawer
        resource={selectedResourceForDetail}
        onClose={() => setSelectedResourceForDetail(null)}
        onRequestAction={(actionType, res, params) => {
          handleTriggerActionFromCopilot(actionType, { resourceId: res.id, ...params });
        }}
        onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
      />

      {/* Live Anomaly & Fault Injector Modal */}
      <AnomalySimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onInjectFault={handleInjectFault}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        provider={aiProvider}
        setProvider={setAiProvider}
      />
    </div>
  );
}
