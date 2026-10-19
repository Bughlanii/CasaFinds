/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TrialBanner } from './components/TrialBanner';
import { DashboardView } from './components/DashboardView';
import { BatchImportView } from './components/BatchImportView';
import { QueueView } from './components/QueueView';
import { LogsView } from './components/LogsView';
import { SettingsView } from './components/SettingsView';
import { PublishProgressModal } from './components/PublishProgressModal';
import { StandardAccessGuideModal } from './components/StandardAccessGuideModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { StorageService } from './services/storage';
import { AccessTier, AppSettings, AuthState, Batch, Board, PinItem, PublishLog, PublishProgressState } from './types';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const storage = StorageService.getInstance();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());
  const [auth, setAuth] = useState<AuthState>(() => storage.getAuth());
  const [boards, setBoards] = useState<Board[]>(() => storage.getBoards());
  const [batches, setBatches] = useState<Batch[]>(() => storage.getBatches());
  const [queue, setQueue] = useState<PinItem[]>(() => storage.getQueue());
  const [logs, setLogs] = useState<PublishLog[]>(() => storage.getLogs());

  // UI Modals & Progress
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progressState, setProgressState] = useState<PublishProgressState>({
    isPublishing: false,
    currentStep: 'idle',
    stepMessage: '',
  });
  const [latestPublishedPinUrl, setLatestPublishedPinUrl] = useState<string | undefined>();
  const [showStandardGuide, setShowStandardGuide] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Check URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('privacy') === '1' || window.location.pathname === '/privacy') {
      setShowPrivacy(true);
    }
    if (params.get('auth_success') === '1') {
      setToastMessage({ text: 'Pinterest OAuth 2.0 authorization successful! Account linked.', type: 'success' });
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch between Standard (live) and Trial (sandbox)
  const handleToggleTier = () => {
    const nextTier: AccessTier = settings.access_tier === 'standard' ? 'trial' : 'standard';
    const newSettings: AppSettings = { ...settings, access_tier: nextTier };
    const newAuth: AuthState = { ...auth, access_tier: nextTier };

    setSettings(newSettings);
    setAuth(newAuth);
    storage.saveSettings(newSettings);
    storage.saveAuth(newAuth);

    showToast(
      nextTier === 'standard'
        ? 'Switched to Standard Access: Live posting to public feed active.'
        : 'Switched to Trial Access: Sandbox mode enabled (pins visible to creator only).',
      'info'
    );
  };

  // Run publish tick on next queued pin
  const handleRunTick = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    setProgressState({
      isPublishing: true,
      currentStep: 'upload_media_init',
      stepMessage: 'Initiating publish run for next queued pin...',
    });

    try {
      const result = await storage.executePublishTick((progress) => {
        setProgressState(progress);
      });

      // Refresh local state from storage
      setQueue([...storage.getQueue()]);
      setLogs([...storage.getLogs()]);
      setLatestPublishedPinUrl(result.pin?.pin_url);

      if (result.success) {
        showToast(`Pin published successfully! HTTP 201 Verified.`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Publishing halted', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Publish a test pin in sandbox mode
  const handleTestSandboxPin = async () => {
    await handleRunTick();
  };

  // Publish a specific pin from queue
  const handlePublishSpecificPin = async (pinId: string) => {
    const q = storage.getQueue();
    const pinIdx = q.findIndex((p) => p.id === pinId);
    if (pinIdx > 0) {
      // Move this pin to front of queue
      const targetPin = q.splice(pinIdx, 1)[0];
      q.unshift(targetPin);
      storage.saveQueue(q);
      setQueue([...q]);
    }
    await handleRunTick();
  };

  // Proactive token refresh
  const handleRefreshTokens = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const newAuth = await storage.refreshToken();
      setAuth({ ...newAuth });
      setLogs([...storage.getLogs()]);
      showToast('Pinterest OAuth access token refreshed & refresh token rotated (FR-09).', 'success');
    } catch (e: any) {
      showToast('Token refresh failed: ' + e.message, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Batch Approval
  const handleApproveBatch = (batchId: string) => {
    storage.approveBatch(batchId);
    setBatches([...storage.getBatches()]);
    setQueue([...storage.getQueue()]);
    showToast('Batch approved! Alternated pins scheduled and added to queue.', 'success');
  };

  // Import New Batch
  const handleImportNewBatch = (batchName: string, pins: PinItem[]) => {
    const existing = storage.getBatches();
    const newBatch: Batch = {
      id: `batch-${Date.now()}`,
      name: batchName,
      total_pins: pins.length,
      approved: false, // Must be approved by owner per Hard Rule #1
      imported_at: new Date().toISOString(),
      language_breakdown: {
        EN: pins.filter((p) => p.language === 'EN').length,
        ES: pins.filter((p) => p.language === 'ES').length,
      },
      pins,
    };
    const updated = [newBatch, ...existing];
    storage.saveBatches(updated);
    setBatches(updated);
  };

  // Save Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
    showToast('Settings saved successfully.', 'success');
  };

  // Reorder Queue
  const handleReorderQueue = (newQueue: PinItem[]) => {
    storage.saveQueue(newQueue);
    setQueue(newQueue);
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset all demo data to factory defaults?')) {
      storage.resetToDefaults();
      setSettings(storage.getSettings());
      setAuth(storage.getAuth());
      setBoards(storage.getBoards());
      setBatches(storage.getBatches());
      setQueue(storage.getQueue());
      setLogs(storage.getLogs());
      showToast('All state reset to factory defaults.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans antialiased flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-stone-800 text-white border-stone-900'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main App Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        auth={auth}
        accessTier={settings.access_tier}
        onToggleTier={handleToggleTier}
        onRefreshTokens={handleRefreshTokens}
        onRunTick={handleRunTick}
        onOpenStandardGuide={() => setShowStandardGuide(true)}
        onOpenPrivacy={() => setShowPrivacy(true)}
        isPublishing={isPublishing}
        isRefreshing={isRefreshing}
        queueCount={queue.filter((p) => p.status !== 'published').length}
      />

      {/* Trial vs Standard Status Banner */}
      <TrialBanner
        accessTier={settings.access_tier}
        onOpenStandardGuide={() => setShowStandardGuide(true)}
        onToggleTier={handleToggleTier}
        onTestSandboxPin={handleTestSandboxPin}
        isPublishing={isPublishing}
      />

      {/* Body Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            settings={settings}
            auth={auth}
            queue={queue}
            logs={logs}
            onRunTick={handleRunTick}
            onNavigateTab={setCurrentTab}
            isPublishing={isPublishing}
          />
        )}

        {currentTab === 'batches' && (
          <BatchImportView
            settings={settings}
            boards={boards}
            batches={batches}
            onApproveBatch={handleApproveBatch}
            onImportNewBatch={handleImportNewBatch}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'queue' && (
          <QueueView
            settings={settings}
            queue={queue}
            onRunTick={handleRunTick}
            onPublishSpecificPin={handlePublishSpecificPin}
            onReorderQueue={handleReorderQueue}
            isPublishing={isPublishing}
          />
        )}

        {currentTab === 'logs' && (
          <LogsView logs={logs} />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            auth={auth}
            onSaveSettings={handleSaveSettings}
            onRefreshTokens={handleRefreshTokens}
            onResetDefaults={handleResetDefaults}
            isRefreshing={isRefreshing}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <div className="flex items-center space-x-2">
            <span>CasaFinds Pinterest Auto-Poster v2.0</span>
            <span>·</span>
            <span>Store ID: <strong className="font-mono text-stone-700">{settings.store_id}</strong></span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="hover:text-stone-800 underline"
            >
              Privacy Policy (FR-11)
            </button>
            <button
              type="button"
              onClick={() => setShowStandardGuide(true)}
              className="hover:text-stone-800 underline"
            >
              Standard Access Guide (§10)
            </button>
          </div>
        </div>
      </footer>

      {/* Live Publishing Pipeline Modal */}
      <PublishProgressModal
        progress={progressState}
        pinUrl={latestPublishedPinUrl}
        onClose={() =>
          setProgressState({
            isPublishing: false,
            currentStep: 'idle',
            stepMessage: '',
          })
        }
      />

      {/* Standard Access Guide Modal */}
      <StandardAccessGuideModal
        isOpen={showStandardGuide}
        onClose={() => setShowStandardGuide(false)}
        redirectUri={settings.redirect_uri}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
    </div>
  );
}
