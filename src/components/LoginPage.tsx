'use client';

import React, { useState } from 'react';
import {
  Cloud,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Zap,
  Radio,
  Server,
  KeyRound,
  Sparkles,
  Layers,
  Cpu,
} from 'lucide-react';
import { UserProfile, UserRole, DataSourceMode } from '@/lib/types';

interface LoginPageProps {
  onLogin: (user: UserProfile, dataSourceMode: DataSourceMode) => void;
  defaultMode?: DataSourceMode;
}

const DEMO_PROFILES: { profile: UserProfile; title: string; desc: string; badgeColor: string }[] = [
  {
    profile: {
      id: 'usr-admin-01',
      name: 'Alex Vance',
      email: 'alex.vance@cloudops.ai',
      role: 'admin',
      avatar: 'AV',
      authProvider: 'password',
    },
    title: 'Lead Cloud Architect',
    desc: 'Full Root Access, Automated Remediations, IAM & FinOps Approvals',
    badgeColor: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
  },
  {
    profile: {
      id: 'usr-devops-02',
      name: 'Sarah Connor',
      email: 'sarah.c@cloudops.ai',
      role: 'devops',
      avatar: 'SC',
      authProvider: 'aws_sso',
    },
    title: 'Principal SRE & DevOps',
    desc: 'Fleet Management, Anomaly Mitigation, Incident Triage & Alerts',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  },
  {
    profile: {
      id: 'usr-finops-03',
      name: 'David Miller',
      email: 'david.m@cloudops.ai',
      role: 'finops',
      avatar: 'DM',
      authProvider: 'azure_ad',
    },
    title: 'FinOps Optimization Lead',
    desc: 'Waste Reduction, Rightsizing, Budget Forecasting & Cost Audits',
    badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  },
  {
    profile: {
      id: 'usr-auditor-04',
      name: 'Elena Rostova',
      email: 'elena.r@cloudops.ai',
      role: 'viewer',
      avatar: 'ER',
      authProvider: 'google_workspace',
    },
    title: 'Security & Cloud Auditor',
    desc: 'Read-Only Live Telemetry, Immutable Audit Logs & SOP Runbooks',
    badgeColor: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, defaultMode = 'live' }) => {
  const [email, setEmail] = useState('alex.vance@cloudops.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [dataMode, setDataMode] = useState<DataSourceMode>(defaultMode);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'credentials' | 'sso' | 'quick'>('credentials');

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please provide a valid enterprise email address');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const namePart = email.split('@')[0].replace('.', ' ');
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const user: UserProfile = {
        id: `usr-${Date.now().toString(36)}`,
        name: formattedName || 'Cloud Administrator',
        email: email,
        role: selectedRole,
        avatar: formattedName.slice(0, 2).toUpperCase(),
        authProvider: 'password',
      };
      setIsLoading(false);
      onLogin(user, dataMode);
    }, 600);
  };

  const handleSSOLogin = (provider: 'aws_sso' | 'azure_ad' | 'google_workspace') => {
    setIsLoading(true);
    setTimeout(() => {
      const providerNames = {
        aws_sso: { name: 'Sarah Connor (AWS IAM)', email: 'sarah.connor@aws-org.internal', role: 'devops' as UserRole },
        azure_ad: { name: 'David Miller (Azure AD)', email: 'david.miller@enterprise.onmicrosoft.com', role: 'finops' as UserRole },
        google_workspace: { name: 'Elena Rostova (Google SSO)', email: 'elena.r@gcp-corp.net', role: 'admin' as UserRole },
      };
      const info = providerNames[provider];
      const user: UserProfile = {
        id: `usr-sso-${Date.now().toString(36)}`,
        name: info.name,
        email: info.email,
        role: info.role,
        avatar: info.name.slice(0, 2).toUpperCase(),
        authProvider: provider,
      };
      setIsLoading(false);
      onLogin(user, dataMode);
    }, 700);
  };

  const handleQuickDemoLogin = (profile: UserProfile) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(profile, dataMode);
    }, 300);
  };

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-x-hidden overflow-y-auto bg-[#0b0f19] p-4 text-gray-100 antialiased sm:p-6 lg:p-8">
      {/* Background Subtle Gradient Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.12),rgba(255,255,255,0))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 w-full max-w-4xl space-y-6">
        {/* Top Brand Bar */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-800 bg-[#111827]/80 px-3 py-1 text-xs text-gray-300 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI CloudOps Intelligent Multi-Cloud Platform</span>
            <span className="text-gray-500">•</span>
            <span className="text-cyan-400 font-semibold">v2.4 Enterprise</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Cloud className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              AI CloudOps <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Manager</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
            Autonomous Multi-Cloud Telemetry, Anomaly Detection, FinOps Optimization & Incident Command
          </p>
        </div>

        {/* Mode Selector Pill: Live Cloud Data vs Sandbox */}
        <div className="mx-auto max-w-md rounded-xl border border-gray-800 bg-[#111827] p-1.5 shadow-xl">
          <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDataMode('live')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 transition-all ${
                dataMode === 'live'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <Radio className={`h-3.5 w-3.5 ${dataMode === 'live' ? 'text-emerald-300 animate-pulse' : 'text-gray-400'}`} />
              <span>Live Cloud Data</span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/30">
                RECOMMENDED
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDataMode('sandbox')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 transition-all ${
                dataMode === 'sandbox'
                  ? 'bg-gray-800 text-white shadow-md border border-gray-700'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <Server className="h-3.5 w-3.5 text-amber-400" />
              <span>Sandbox Demo Lab</span>
            </button>
          </div>

          <div className="mt-2 px-2 pb-1 text-center">
            {dataMode === 'live' ? (
              <p className="text-[11px] text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Connects to live CloudWatch, Azure Monitor, & GCP real-time streaming telemetry
              </p>
            ) : (
              <p className="text-[11px] text-amber-400 flex items-center justify-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Synthetic telemetry simulator with interactive chaos injection
              </p>
            )}
          </div>
        </div>

        {/* Main Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl border border-gray-800 bg-[#111827]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
          {/* Left Column: Sign In Forms */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('credentials')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'credentials'
                    ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Password Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sso')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'sso'
                    ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Cloud SSO / Identity
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'quick'
                    ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                1-Click Quick Demo
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-400">
                {errorMsg}
              </div>
            )}

            {/* Tab 1: Password Sign In */}
            {activeTab === 'credentials' && (
              <form onSubmit={handleStandardSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">Enterprise Email</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@cloudops.ai"
                      className="w-full rounded-xl border border-gray-800 bg-[#0b0f19] pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-gray-300">Password</label>
                    <span className="text-[11px] text-cyan-400 hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-gray-800 bg-[#0b0f19] pl-9 pr-10 py-2.5 text-xs text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">Access Role & Permissions</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: 'admin', label: 'Admin', desc: 'Root' },
                        { id: 'devops', label: 'DevOps', desc: 'Ops' },
                        { id: 'finops', label: 'FinOps', desc: 'Cost' },
                        { id: 'viewer', label: 'Viewer', desc: 'Read' },
                      ] as const
                    ).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        className={`rounded-lg border p-2 text-center transition-all ${
                          selectedRole === r.id
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                            : 'border-gray-800 bg-[#0b0f19] text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        <div className="text-xs font-bold capitalize">{r.label}</div>
                        <div className="text-[10px] text-gray-500">{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-700 bg-gray-900 text-cyan-600 focus:ring-0"
                    />
                    <span>Remember this session for 30 days</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Authenticating Cloud Session...</span>
                    </div>
                  ) : (
                    <>
                      <span>Enter AI CloudOps Platform</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Tab 2: SSO Identity Providers */}
            {activeTab === 'sso' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">
                  Authenticate directly using your corporate Single Sign-On (SSO) identity provider:
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSSOLogin('aws_sso')}
                    disabled={isLoading}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-800 bg-[#0b0f19] p-3 text-left hover:border-amber-500/60 hover:bg-amber-500/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">AWS IAM Identity Center</div>
                        <div className="text-[10px] text-gray-400">Sign in with AWS SSO Organization credentials</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSSOLogin('azure_ad')}
                    disabled={isLoading}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-800 bg-[#0b0f19] p-3 text-left hover:border-blue-500/60 hover:bg-blue-500/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Microsoft Entra ID (Azure AD)</div>
                        <div className="text-[10px] text-gray-400">Sign in with Microsoft 365 / Entra tenant ID</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSSOLogin('google_workspace')}
                    disabled={isLoading}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-800 bg-[#0b0f19] p-3 text-left hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Google Cloud Identity</div>
                        <div className="text-[10px] text-gray-400">Sign in with GCP Workload Identity / Workspace</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: 1-Click Quick Demo */}
            {activeTab === 'quick' && (
              <div className="space-y-2.5">
                <p className="text-xs text-gray-400">
                  Select a pre-configured enterprise role for instantaneous 1-click access:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DEMO_PROFILES.map((item) => (
                    <button
                      key={item.profile.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(item.profile)}
                      disabled={isLoading}
                      className="group flex flex-col items-start rounded-xl border border-gray-800 bg-[#0b0f19] p-3 text-left hover:border-cyan-500/60 hover:bg-gray-900 transition-all"
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 font-bold text-[11px] text-white">
                            {item.profile.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                              {item.profile.name}
                            </div>
                            <div className="text-[10px] text-gray-400">{item.title}</div>
                          </div>
                        </div>
                        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${item.badgeColor}`}>
                          {item.profile.role}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-gray-400 line-clamp-2">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Platform Telemetry & Live Cloud Guarantee */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-gray-800 bg-[#0b0f19] p-4 sm:p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Live Cloud Telemetry Ingest
                </h3>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-gray-800/80 bg-gray-950/60 p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-semibold text-gray-200">AWS CloudWatch Live</span>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono">19ms • us-east-1</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-800/80 bg-gray-950/60 p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-gray-200">Azure Monitor Stream</span>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono">31ms • eastus</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-800/80 bg-gray-950/60 p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-gray-200">GCP Cloud Monitoring</span>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono">25ms • us-central1</span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs space-y-1.5">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span>Real-Time CloudOps Guardrails</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Every action triggered by the AI Copilot undergoes human-in-the-loop review, automated blast-radius calculation, and immutable audit logging.
                </p>
              </div>
            </div>

            {/* Compliance Footer Badges */}
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> SOC2 Type II
              </span>
              <span>256-Bit AES TLS 1.3</span>
              <span>IAM RBAC Enforced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
