/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, ShieldAlert, Sparkles, ExternalLink, Beaker } from 'lucide-react';
import { AccessTier } from '../types';

interface TrialBannerProps {
  accessTier: AccessTier;
  onOpenStandardGuide: () => void;
  onToggleTier: () => void;
  onTestSandboxPin: () => void;
  isPublishing: boolean;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({
  accessTier,
  onOpenStandardGuide,
  onToggleTier,
  onTestSandboxPin,
  isPublishing,
}) => {
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  if (accessTier === 'standard') {
    return (
      <div className="bg-emerald-50/80 border-b border-emerald-200 px-4 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold">Pinterest Standard Access Active:</span>
            <span className="text-emerald-700">
              Live automated publishing to public boards enabled with full <code className="font-mono text-[11px] bg-emerald-100 px-1 py-0.5 rounded">pins:write</code> capability.
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onToggleTier}
              className="text-emerald-700 hover:text-emerald-900 underline font-medium"
            >
              Switch to Trial / Sandbox Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-amber-900">
                  Waiting for Pinterest Standard Access Approval (Trial Access Active)
                </span>
                <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Sandbox Only
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Public feed posting is restricted by Pinterest until Standard Access is granted. You can safely build batches, prepare the queue, and publish sandbox test pins.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={onTestSandboxPin}
              disabled={isPublishing}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Beaker className="w-3.5 h-3.5" />
              <span>Test Sandbox Pin</span>
            </button>
            <button
              type="button"
              onClick={onToggleTier}
              className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Simulate Standard Access
            </button>
            <button
              type="button"
              onClick={onOpenStandardGuide}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
            >
              <span>Owner Submission Checklist</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Collapsible Trial Trap Diagnostic per FR-10 */}
        <div className="mt-2.5 pt-2 border-t border-amber-200/60">
          <button
            type="button"
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="flex items-center space-x-1.5 text-xs text-amber-900 font-medium hover:underline"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>Understanding the &quot;Trial Trap Diagnostic&quot; (Why a 201 Created Pin might show 404 for visitors)</span>
            {showDiagnostic ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDiagnostic && (
            <div className="mt-2 p-3 bg-amber-100/70 rounded-lg text-xs text-amber-900 space-y-1.5">
              <p>
                <strong>Diagnostic Note (FR-10):</strong> In Pinterest Trial Access, test pins created via the API return <code className="bg-amber-200/80 px-1 py-0.5 rounded font-mono font-bold">HTTP 201 Created</code> with a valid Pinterest Pin ID, and no errors occur.
              </p>
              <p>
                However, Trial pins are visible <strong>strictly to the authenticated account owner / creator</strong>. If another person or logged-out browser opens the pin URL and sees an <em>HTTP 404 Not Found</em> page on Pinterest, your application code, payload, tags, and media uploads are completely fine. The Pinterest Trial tier boundary is the sole cause. Once Standard Access is approved, the exact same code publishes publicly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
