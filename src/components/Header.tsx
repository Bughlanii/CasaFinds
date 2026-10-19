/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Pin, 
  ShieldCheck, 
  RefreshCw, 
  Play, 
  Settings as SettingsIcon, 
  FileText, 
  ListOrdered, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  Lock,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { AccessTier, AuthState } from '../types';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  auth: AuthState;
  accessTier: AccessTier;
  onToggleTier: () => void;
  onRefreshTokens: () => void;
  onRunTick: () => void;
  onOpenStandardGuide: () => void;
  onOpenPrivacy: () => void;
  isPublishing: boolean;
  isRefreshing: boolean;
  queueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  auth,
  accessTier,
  onToggleTier,
  onRefreshTokens,
  onRunTick,
  onOpenStandardGuide,
  onOpenPrivacy,
  isPublishing,
  isRefreshing,
  queueCount,
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const daysUntilExpiry = Math.max(
    0,
    Math.round((new Date(auth.token_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner / Brand row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm ring-2 ring-red-100">
              <Pin className="w-5 h-5 fill-white transform rotate-[-20deg]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-stone-900 tracking-tight">CasaFinds</span>
                <span className="text-xs bg-stone-100 text-stone-600 font-semibold px-2 py-0.5 rounded border border-stone-200">
                  Auto-Poster v2.0
                </span>
                <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium hidden md:inline-block">
                  Amazon Associates: casafinds090-20
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Pinterest API v5 automated publishing & schedule queue
              </p>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Standard vs Trial Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={onToggleTier}
                title="Click to toggle between Standard Access (Live) and Trial Access (Sandbox)"
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                  accessTier === 'standard'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {accessTier === 'standard' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Standard Access (Live)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Trial Mode (Sandbox)</span>
                  </>
                )}
              </button>
            </div>

            {/* Token Health Pill */}
            <button
              type="button"
              onClick={onRefreshTokens}
              disabled={isRefreshing}
              title={`Expires in ${daysUntilExpiry} days. Proactively refreshed every 7-14 days per FR-09. Click to rotate token.`}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 text-stone-500 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
              <span>Token: {daysUntilExpiry}d valid</span>
            </button>

            {/* Run Publish Tick Button */}
            <button
              type="button"
              onClick={onRunTick}
              disabled={isPublishing || queueCount === 0}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
                isPublishing
                  ? 'bg-red-400 text-white cursor-wait'
                  : queueCount === 0
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                  : 'bg-red-600 hover:bg-red-700 text-white ring-1 ring-red-700/20 active:scale-95'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isPublishing ? 'animate-pulse' : 'fill-white'}`} />
              <span>{isPublishing ? 'Publishing Pin...' : 'Publish Next Pin'}</span>
            </button>

            {/* Account Profile Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-lg border border-stone-200 hover:border-stone-300 text-stone-800 text-xs font-medium bg-stone-50/50"
              >
                <img
                  src={auth.profile_image}
                  alt={auth.username}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-stone-300"
                />
                <span className="font-semibold text-stone-800">@{auth.username}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Connected"></span>
              </button>

              {showAccountDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="font-semibold text-stone-900">Pinterest Business Account</p>
                    <p className="text-stone-500 text-[11px]">ID: {auth.account_id}</p>
                    <div className="mt-1 flex items-center space-x-1 text-emerald-600 font-medium text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>OAuth 2.0 Connected</span>
                    </div>
                  </div>
                  <div className="px-3 py-2 text-stone-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Scopes:</span>
                      <span className="font-mono text-[10px] text-stone-700">4 active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Access Token:</span>
                      <span className="font-mono text-[10px]">{auth.access_token_masked}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refresh Token:</span>
                      <span className="font-mono text-[10px]">{auth.refresh_token_masked}</span>
                    </div>
                  </div>
                  <div className="border-t border-stone-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAccountDropdown(false);
                        onOpenStandardGuide();
                      }}
                      className="w-full text-left px-3 py-1.5 text-stone-700 hover:bg-stone-50 flex items-center justify-between"
                    >
                      <span>Standard Access Checklist</span>
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAccountDropdown(false);
                        onOpenPrivacy();
                      }}
                      className="w-full text-left px-3 py-1.5 text-stone-700 hover:bg-stone-50 flex items-center justify-between"
                    >
                      <span>Privacy Policy (FR-11)</span>
                      <Lock className="w-3 h-3 text-stone-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-6 border-t border-stone-100 overflow-x-auto py-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'text-red-700 bg-red-50/70 border-b-2 border-red-600'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('batches')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              currentTab === 'batches'
                ? 'text-red-700 bg-red-50/70 border-b-2 border-red-600'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch Import & Approval</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('queue')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              currentTab === 'queue'
                ? 'text-red-700 bg-red-50/70 border-b-2 border-red-600'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Publishing Queue</span>
            {queueCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">
                {queueCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('logs')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              currentTab === 'logs'
                ? 'text-red-700 bg-red-50/70 border-b-2 border-red-600'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Daily Audit Log</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('settings')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              currentTab === 'settings'
                ? 'text-red-700 bg-red-50/70 border-b-2 border-red-600'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={onOpenStandardGuide}
            className="px-3 py-2 text-xs font-medium text-stone-500 hover:text-stone-800 rounded-md transition-colors flex items-center space-x-1 whitespace-nowrap ml-auto"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Standard Access Guide (§10)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
