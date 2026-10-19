/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Pin, 
  Clock, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Layers, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Tag,
  Sparkles,
  Play
} from 'lucide-react';
import { AppSettings, AuthState, PinItem, PublishLog } from '../types';
import { calculateAllowedDailyCap, isWithinPostingWindow } from '../utils/rules';

interface DashboardViewProps {
  settings: AppSettings;
  auth: AuthState;
  queue: PinItem[];
  logs: PublishLog[];
  onRunTick: () => void;
  onNavigateTab: (tab: string) => void;
  isPublishing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  auth,
  queue,
  logs,
  onRunTick,
  onNavigateTab,
  isPublishing,
}) => {
  const allowedCap = calculateAllowedDailyCap(settings.account_age_days, settings.daily_cap);

  const todayStr = new Date().toISOString().slice(0, 10);
  const publishedToday = logs.filter(
    (l) => l.status === 'published' && l.attempted_at.startsWith(todayStr)
  ).length;

  const failedToday = logs.filter(
    (l) => l.status === 'failed' && l.attempted_at.startsWith(todayStr)
  ).length;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const inWindow = isWithinPostingWindow(
    currentHour,
    currentMinute,
    settings.posting_window_start,
    settings.posting_window_end
  );

  const nextPins = queue.filter((p) => p.status === 'queued' || p.status === 'scheduled').slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-amber-700 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <Pin className="w-80 h-80 transform rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Daily Publisher · US Kitchen Niche</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            CasaFinds Automated Daily Poster
          </h1>
          <p className="mt-2 text-sm sm:text-base text-rose-100 leading-relaxed">
            Publishing owner-approved affiliate pins to Pinterest on a paced schedule with verified Amazon Associate disclosure and tracking tags.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1.5 bg-black/30 backdrop-blur-xs rounded-lg font-mono font-medium flex items-center space-x-1.5 border border-white/10">
              <Tag className="w-3.5 h-3.5 text-amber-300" />
              <span>Amazon Tag: {settings.store_id}</span>
            </span>
            <span className="px-3 py-1.5 bg-black/30 backdrop-blur-xs rounded-lg font-medium flex items-center space-x-1.5 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-rose-300" />
              <span>Posting Window: {settings.posting_window_start} – {settings.posting_window_end} ({settings.timezone.split('/')[1] || 'ET'})</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Published Today vs Ramp */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Today&apos;s Pin Cap</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-stone-900">{publishedToday}</span>
            <span className="text-sm font-medium text-stone-500">/ {allowedCap} max</span>
          </div>
          <div className="mt-2 w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (publishedToday / allowedCap) * 100)}%` }}
            ></div>
          </div>
          <p className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Ramp (Day {settings.account_age_days}): 8–10 cap</span>
            <span className="font-semibold text-stone-700">{Math.round((publishedToday / allowedCap) * 100)}%</span>
          </p>
        </div>

        {/* Metric 2: Queue Depth */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Queue Remaining</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-stone-900">{queue.filter((p) => p.status !== 'published').length}</span>
            <span className="text-xs font-medium text-stone-500">approved pins</span>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px] text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Alternating EN &amp; ES batches</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('queue')}
            className="mt-2 text-xs font-semibold text-red-700 hover:text-red-800 flex items-center space-x-1"
          >
            <span>Manage queue</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 3: Posting Window Status */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Evening Window</span>
            <div className={`p-2 rounded-xl ${inWindow ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-600'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-base font-bold ${inWindow ? 'text-emerald-700' : 'text-stone-700'}`}>
              {inWindow ? 'Window Active (8–11 PM)' : 'Outside Window'}
            </span>
          </div>
          <p className="mt-2 text-xs text-stone-500">
            US peak shopping hours (Eastern Time). Prevents account spam flags.
          </p>
          <div className="mt-2 text-[11px] font-medium text-stone-600">
            Randomized intervals: {settings.min_spacing_minutes}–{settings.max_spacing_minutes} mins
          </div>
        </div>

        {/* Metric 4: Daily Audit Health */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Daily Audit Log</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-stone-900">{logs.length}</span>
            <span className="text-xs font-medium text-stone-500">total attempts</span>
          </div>
          <div className="mt-2 text-xs text-stone-600 flex items-center space-x-2">
            <span className="text-emerald-600 font-semibold">{logs.filter((l) => l.status === 'published').length} published</span>
            <span>·</span>
            <span className="text-stone-500">{failedToday} failed today</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('logs')}
            className="mt-2 text-xs font-semibold text-red-700 hover:text-red-800 flex items-center space-x-1"
          >
            <span>Review daily log</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Ramp Pacing Rule Callout (Hard Rule #6) */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span>Pinterest Anti-Spam Ramp Pacing (Business Rule #6)</span>
            </h3>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              To protect the Pinterest Business account and Amazon Associates standing, the scheduler enforces a strict ramp: <strong>8–10 pins/day in Week 1</strong>, then safely scales toward your configured cap ({settings.daily_cap}/day) with randomized spacing.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <div className="px-3 py-1.5 bg-white rounded-lg border border-stone-200 text-xs">
              <span className="text-stone-500 block text-[10px]">Current Day</span>
              <span className="font-bold text-stone-900">Day {settings.account_age_days} of Ramp</span>
            </div>
            <div className="px-3 py-1.5 bg-red-50 rounded-lg border border-red-200 text-xs">
              <span className="text-red-700 block text-[10px]">Today&apos;s Cap</span>
              <span className="font-bold text-red-800">{allowedCap} pins / day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Up in Queue & Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Pins Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900">Up Next in Publishing Queue</h2>
              <p className="text-xs text-stone-500">Alternating English and Spanish approved pins</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('queue')}
              className="text-xs font-semibold text-red-700 hover:text-red-800"
            >
              View Full Queue ({queue.filter((p) => p.status !== 'published').length})
            </button>
          </div>

          {nextPins.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-xl">
              <Layers className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">No pins in queue</p>
              <p className="text-xs text-stone-500 mt-1">Import Batch 1 or approve a new batch to fill the schedule.</p>
              <button
                type="button"
                onClick={() => onNavigateTab('batches')}
                className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
              >
                Go to Batch Importer
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {nextPins.map((pin, idx) => (
                <div
                  key={pin.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors bg-stone-50/30"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={pin.image_url}
                      alt={pin.title}
                      className="w-12 h-18 object-cover rounded-md border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            pin.language === 'EN'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {pin.language}
                        </span>
                        <span className="text-[11px] text-stone-500 truncate">{pin.board_name}</span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 truncate mt-0.5">{pin.title}</h4>
                      <div className="mt-1 flex items-center space-x-2 text-[11px] text-stone-500">
                        <span className="font-mono bg-stone-100 px-1 rounded text-[10px]">
                          tag={settings.store_id}
                        </span>
                        <span>·</span>
                        <span>
                          {pin.scheduled_at
                            ? new Date(pin.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Pending schedule'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right pl-3">
                    <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-1 rounded-md">
                      #{idx + 1} in queue
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Operations Sidebar */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
          <h3 className="text-base font-bold text-stone-900">Owner Operations</h3>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center space-x-2 text-stone-900 font-semibold text-xs">
              <Play className="w-4 h-4 text-red-600 fill-red-600" />
              <span>Trigger Publish Tick</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Publishes the next pin in the queue through the full 5-step Pinterest API v5 upload and verification flow.
            </p>
            <button
              type="button"
              onClick={onRunTick}
              disabled={isPublishing || queue.length === 0}
              className="w-full mt-2 py-2 bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>{isPublishing ? 'Publishing Pin...' : 'Publish Next Pin Now'}</span>
            </button>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center space-x-2 text-stone-900 font-semibold text-xs">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Batch 1 (10 EN + 10 ES)</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Review and approve pre-prepared kitchen pins with pre-verified Amazon tags and mandatory disclosures.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('batches')}
              className="w-full mt-2 py-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 rounded-lg text-xs font-semibold transition-colors"
            >
              Open Batch Importer
            </button>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center space-x-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Compliance Guardrails Active</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Every pin link is verified with <code className="font-mono">{settings.store_id}</code>. Descriptions automatically enforce exact Amazon Associate disclosures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
