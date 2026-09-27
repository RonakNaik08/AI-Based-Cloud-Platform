'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Cloud, 
  Sparkles, 
  Settings, 
  Zap, 
  Globe,
  Key,
  Layers,
  Radio,
  LogOut,
  User,
  Shield,
  RefreshCw,
  ChevronDown,
  Server
} from 'lucide-react';
import { CloudAccountConnection, CloudRegion, ActiveCloudFilter, UserProfile, UserRole, DataSourceMode } from '@/lib/types';

interface HeaderProps {
  activeRegion: CloudRegion;
  setActiveRegion: (region: CloudRegion) => void;
  activeProviderFilter: ActiveCloudFilter;
  setActiveProviderFilter: (provider: ActiveCloudFilter) => void;
  accounts: CloudAccountConnection[];
  currentUser: UserProfile | null;
  onSignOut: () => void;
  onSwitchRole: (role: UserRole) => void;
  dataSourceMode: DataSourceMode;
  onToggleDataSourceMode: (mode: DataSourceMode) => void;
  refreshIntervalMs?: number;
  onChangeRefreshInterval?: (ms: number) => void;
  onForceLivePoll?: () => void;
  onOpenCopilot: () => void;
  onOpenSimulator: () => void;
  onOpenSettings: () => void;
  onOpenCloudLogin: () => void;
  activeAnomaliesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeRegion,
  setActiveRegion,
  activeProviderFilter,
  setActiveProviderFilter,
  accounts,
  currentUser,
  onSignOut,
  onSwitchRole,
  dataSourceMode,
  onToggleDataSourceMode,
  refreshIntervalMs = 3000,
  onChangeRefreshInterval,
  onForceLivePoll,
  onOpenCopilot,
  onOpenSimulator,
  onOpenSettings,
  onOpenCloudLogin,
  activeAnomaliesCount,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
        setIsModeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'devops':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'finops':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-gray-800 bg-[#0e1424] px-3 sm:px-5">
      {/* Brand & Multi-Cloud Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-600/20">
            <Cloud className="h-4 w-4" />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-white hidden sm:block">
            AI CloudOps <span className="text-cyan-400">Manager</span>
          </h1>
        </div>

        {/* Cloud Provider Filter Bar */}
        <div className="hidden lg:flex items-center rounded-lg border border-gray-800 bg-gray-900/80 p-0.5 text-xs">
          {[
            { id: 'all' as const, label: 'All Clouds' },
            { id: 'aws' as const, label: 'AWS' },
            { id: 'azure' as const, label: 'Azure' },
            { id: 'gcp' as const, label: 'GCP' },
          ].map((item) => {
            const isSelected = activeProviderFilter === item.id;
            const acc = accounts.find((a) => a.provider === item.id);
            const isConnected = item.id === 'all' || acc?.status === 'connected';

            return (
              <button
                key={item.id}
                onClick={() => setActiveProviderFilter(item.id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
                  isSelected
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.id !== 'all' && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isConnected ? 'bg-emerald-400' : 'bg-gray-600'
                    }`}
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Connect Cloud Account Button */}
        <button
          onClick={onOpenCloudLogin}
          className="flex items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1 text-xs text-gray-300 hover:border-gray-700 hover:text-white transition-colors"
          title="Login / Connect Cloud Platforms"
        >
          <Key className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden md:inline">Connect Cloud</span>
        </button>
      </div>

      {/* Center / Right: Live Data Switcher + Action Controls + User Menu */}
      <div className="flex items-center gap-2">
        {/* Live Data vs Sandbox Mode Toggle */}
        <div className="relative" ref={modeMenuRef}>
          <button
            onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
              dataSourceMode === 'live'
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60 shadow-sm shadow-emerald-900/20'
                : 'border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-950/60'
            }`}
          >
            {dataSourceMode === 'live' ? (
              <>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">LIVE CLOUD STREAM</span>
                <span className="sm:hidden">LIVE</span>
                <span className="text-[10px] text-emerald-400/80 font-mono hidden md:inline">
                  {refreshIntervalMs / 1000}s
                </span>
              </>
            ) : (
              <>
                <Server className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">SANDBOX LAB</span>
                <span className="sm:hidden">SANDBOX</span>
              </>
            )}
            <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
          </button>

          {/* Mode Dropdown Menu */}
          {isModeMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-800 bg-[#111827] p-2 text-xs shadow-2xl z-50 space-y-1">
              <div className="px-2 py-1.5 border-b border-gray-800">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Cloud Telemetry Engine
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onToggleDataSourceMode('live');
                  setIsModeMenuOpen(false);
                }}
                className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors ${
                  dataSourceMode === 'live' ? 'bg-emerald-500/10 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Radio className="h-4 w-4 text-emerald-400 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-emerald-400">Live Data Only</div>
                  <div className="text-[11px] text-gray-400">
                    Real-time polling from CloudWatch & Cloud APIs with live timestamps
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleDataSourceMode('sandbox');
                  setIsModeMenuOpen(false);
                }}
                className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors ${
                  dataSourceMode === 'sandbox' ? 'bg-amber-500/10 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Server className="h-4 w-4 text-amber-400 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-amber-400">Sandbox Lab Mode</div>
                  <div className="text-[11px] text-gray-400">
                    Synthetic test bench with chaos fault injection and sandbox state
                  </div>
                </div>
              </button>

              {dataSourceMode === 'live' && onChangeRefreshInterval && (
                <div className="pt-2 border-t border-gray-800 px-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Live Refresh Rate</span>
                    <span className="font-mono text-cyan-400">{refreshIntervalMs / 1000}s</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[1000, 3000, 5000, 10000].map((ms) => (
                      <button
                        key={ms}
                        type="button"
                        onClick={() => {
                          onChangeRefreshInterval(ms);
                          setIsModeMenuOpen(false);
                        }}
                        className={`rounded py-1 text-[10px] font-bold border transition-colors ${
                          refreshIntervalMs === ms
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                            : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        {ms / 1000}s
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {onForceLivePoll && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onForceLivePoll();
                      setIsModeMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 py-1.5 text-xs text-gray-200 hover:text-white"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Poll Live Cloud Now</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Anomaly Simulator */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-gray-800 transition-colors"
          title="Inject Simulated Faults (CPU Spike, Memory Leak, FinOps surge)"
        >
          <Zap className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Inject Fault</span>
        </button>

        {/* AI Copilot Button */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-500 shadow-sm shadow-cyan-600/20 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Copilot</span>
          {activeAnomaliesCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold">
              {activeAnomaliesCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="rounded-lg border border-gray-800 bg-gray-900 p-1.5 text-gray-400 hover:text-white"
          title="API Keys & Platform Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>

        {/* User Profile Menu */}
        {currentUser && (
          <div className="relative pl-1" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/90 py-1 px-2 hover:border-gray-700 transition-colors"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-[11px] font-bold text-white">
                {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">{currentUser.name}</span>
                <span className="text-[10px] text-gray-400 uppercase font-mono">{currentUser.role}</span>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-800 bg-[#111827] p-2 text-xs shadow-2xl z-50 space-y-2">
                <div className="p-2 border-b border-gray-800">
                  <div className="font-bold text-white text-xs">{currentUser.name}</div>
                  <div className="text-[11px] text-gray-400 truncate">{currentUser.email}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${getRoleBadgeColor(currentUser.role)}`}>
                      {currentUser.role}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {currentUser.authProvider ? currentUser.authProvider.replace('_', ' ') : 'password'}
                    </span>
                  </div>
                </div>

                {/* Quick Switch Role */}
                <div className="px-2 py-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Switch Active Role
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    {(['admin', 'devops', 'finops', 'viewer'] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          onSwitchRole(role);
                          setIsUserMenuOpen(false);
                        }}
                        className={`rounded px-2 py-1 text-left text-[10px] font-semibold uppercase transition-colors ${
                          currentUser.role === role
                            ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sign Out */}
                <div className="pt-1 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSignOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
