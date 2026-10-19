/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Tag, 
  ShieldCheck, 
  RefreshCw, 
  RotateCcw,
  Key,
  Globe
} from 'lucide-react';
import { AppSettings, AuthState } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  auth: AuthState;
  onSaveSettings: (settings: AppSettings) => void;
  onRefreshTokens: () => void;
  onResetDefaults: () => void;
  isRefreshing: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  auth,
  onSaveSettings,
  onRefreshTokens,
  onResetDefaults,
  isRefreshing,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <h2 className="text-xl font-bold text-stone-900">System Configuration &amp; Policies</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          FR-03: Settings are persisted server-side/database. The app enforces the owner&apos;s exact Store ID tag and posting window.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amazon Associates Settings */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-stone-900 border-b border-stone-100 pb-3">
            <Tag className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold">Amazon Associates Tracking ID (FR-03, FR-04)</h3>
          </div>

          <div>
            <label htmlFor="store-id-input" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Store ID / Tracking Tag
            </label>
            <input
              id="store-id-input"
              type="text"
              required
              value={formData.store_id}
              onChange={(e) => setFormData({ ...formData, store_id: e.target.value.trim() })}
              placeholder="casafinds090-20"
              className="w-full text-xs font-mono font-bold px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Confirmed Store ID: <strong className="text-stone-800">casafinds090-20</strong>. Hard Rule #3: The app will NEVER invent a tag; it strictly appends this confirmed ID to all Amazon product links, and preserves amzn.to short links as-is.
            </p>
          </div>
        </div>

        {/* Schedule & Pacing Ramp Settings */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-stone-900 border-b border-stone-100 pb-3">
            <Clock className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold">Posting Schedule &amp; Anti-Spam Ramp (FR-03, FR-05)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="daily-cap-input" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Target Daily Pin Cap (Final Scale)
              </label>
              <input
                id="daily-cap-input"
                type="number"
                min={5}
                max={50}
                value={formData.daily_cap}
                onChange={(e) => setFormData({ ...formData, daily_cap: parseInt(e.target.value, 10) || 10 })}
                className="w-full text-xs font-bold px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Ramp default: 8–10 pins/day week 1, scaling gradually up to 25–50/day.
              </p>
            </div>

            <div>
              <label htmlFor="account-age-input" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Ramp Day Progression
              </label>
              <input
                id="account-age-input"
                type="number"
                min={1}
                max={60}
                value={formData.account_age_days}
                onChange={(e) => setFormData({ ...formData, account_age_days: parseInt(e.target.value, 10) || 1 })}
                className="w-full text-xs font-bold px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Day 1–7 = 10 cap; Day 8–14 = 18 cap; Day 15–21 = 28 cap; Day 22+ = full cap.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="window-start-input" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Posting Window Start (US Eastern)
              </label>
              <input
                id="window-start-input"
                type="time"
                value={formData.posting_window_start}
                onChange={(e) => setFormData({ ...formData, posting_window_start: e.target.value })}
                className="w-full text-xs font-bold px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-stone-500 mt-1">Default: 20:00 (8:00 PM ET)</p>
            </div>

            <div>
              <label htmlFor="window-end-input" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Posting Window End (US Eastern)
              </label>
              <input
                id="window-end-input"
                type="time"
                value={formData.posting_window_end}
                onChange={(e) => setFormData({ ...formData, posting_window_end: e.target.value })}
                className="w-full text-xs font-bold px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-stone-500 mt-1">Default: 23:00 (11:00 PM ET)</p>
            </div>
          </div>

          <div>
            <label htmlFor="timezone-select" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Scheduler Timezone
            </label>
            <select
              id="timezone-select"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full text-xs font-semibold px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            >
              <option value="America/New_York">America/New_York (US Eastern — Recommended)</option>
              <option value="America/Chicago">America/Chicago (US Central)</option>
              <option value="America/Denver">America/Denver (US Mountain)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (US Pacific)</option>
            </select>
          </div>
        </div>

        {/* OAuth & Token Maintenance (FR-01, FR-09) */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-stone-900 border-b border-stone-100 pb-3">
            <Key className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold">Pinterest API v5 Credentials &amp; Token Rotation (FR-09)</h3>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Access Token Status:</span>
              <span className="font-mono text-emerald-700 font-bold">Active &amp; Valid</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Current Token Lifetime:</span>
              <span className="font-mono text-stone-800">
                Expires on {new Date(auth.token_expires_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Last Proactive Refresh:</span>
              <span className="font-mono text-stone-800">
                {new Date(auth.last_refreshed_at).toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 pt-1">
              FR-09 Rule: Pinterest access tokens last ~30 days; refresh tokens expire after 60 days without use. The auto-poster refreshes proactively every 7–14 days and rotates the refresh token.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onRefreshTokens}
              disabled={isRefreshing}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
              <span>Rotate &amp; Refresh OAuth Token Now</span>
            </button>
          </div>
        </div>

        {/* Save button & feedback */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>

            {savedMsg && (
              <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings saved successfully!</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onResetDefaults}
            className="px-3 py-1.5 text-xs text-stone-500 hover:text-red-700 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Factory Defaults</span>
          </button>
        </div>
      </form>
    </div>
  );
};
