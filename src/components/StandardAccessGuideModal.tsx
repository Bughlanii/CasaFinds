/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Video, 
  ShieldCheck, 
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

interface StandardAccessGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUri: string;
}

export const StandardAccessGuideModal: React.FC<StandardAccessGuideModalProps> = ({
  isOpen,
  onClose,
  redirectUri,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 text-red-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Pinterest Standard Access Guide (§10)</h3>
              <p className="text-xs text-stone-500">Step-by-step checklist to unlock public live feed publishing</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-700">
          {/* Overview Note */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Standard Access Gate (Owner One-Time Step)</span>
            </div>
            <p className="text-[11px] text-amber-800">
              In Pinterest API v5, all new apps start in <strong>Trial Access</strong> (where <code className="font-mono">pins:write</code> is restricted to sandbox testing). To publish public pins, Pinterest reviews your app.
            </p>
          </div>

          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">1</span>
              <span>Register App in Pinterest Developer Portal</span>
            </div>
            <p className="text-stone-600 pl-7">
              Visit <a href="https://developers.pinterest.com/apps/" target="_blank" rel="noopener noreferrer" className="text-red-700 font-semibold underline inline-flex items-center space-x-1"><span>developers.pinterest.com/apps</span> <ExternalLink className="w-3 h-3" /></a> and click <strong>Create app</strong>.
            </p>
            <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-stone-50 rounded border border-stone-200">
                <strong>App Name:</strong> CasaFinds Pinterest Auto-Poster
              </div>
              <div className="p-2 bg-stone-50 rounded border border-stone-200">
                <strong>Description:</strong> Private tool that publishes my own pre-approved pins to my own boards via official API.
              </div>
            </div>
          </div>

          {/* Step 2: Redirect URI */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">2</span>
              <span>Set the Exact Redirect URI</span>
            </div>
            <p className="text-stone-600 pl-7">
              Pinterest requires an exact match for the OAuth callback URL. Copy this URL into the <em>Redirect URIs</em> field:
            </p>
            <div className="pl-7">
              <div className="flex items-center justify-between p-2.5 bg-stone-100 rounded-lg border border-stone-200 font-mono text-[11px] text-stone-800 break-all">
                <span>{redirectUri}</span>
                <button
                  type="button"
                  onClick={handleCopyUri}
                  className="ml-2 px-2.5 py-1 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded font-sans text-xs font-semibold flex items-center space-x-1 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy URI'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Least Privilege Scopes */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">3</span>
              <span>Verify Required Least-Privilege Scopes (FR-01, FR-02)</span>
            </div>
            <div className="pl-7 space-y-1">
              <div className="flex items-center space-x-2 text-emerald-800 font-medium">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">user_accounts:read</code>
                <span className="text-[11px] text-stone-500">— REQUIRED for FR-02 account verification</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-800 font-medium">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">boards:read</code>
                <span className="text-[11px] text-stone-500">— Resolve board IDs for posting</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-800 font-medium">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">pins:read</code>
                <span className="text-[11px] text-stone-500">— Verify published pins</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-800 font-medium">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">pins:write</code>
                <span className="text-[11px] text-stone-500">— Create pins with affiliate links</span>
              </div>
            </div>
          </div>

          {/* Step 4: Video Demo Submission Guidelines */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">4</span>
              <span>Record Short Video Demo (1–2 minutes)</span>
            </div>
            <div className="pl-7 p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <div className="flex items-center space-x-1.5 font-semibold text-stone-900">
                <Video className="w-4 h-4 text-red-600" />
                <span>What to show in the review recording:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-stone-600 text-[11px]">
                <li>Show the OAuth connect screen with Pinterest consent and permitted scopes.</li>
                <li>Show the dashboard displaying your connected Pinterest business account (@casafinds) and your boards.</li>
                <li>Click <strong>&quot;Test Sandbox Pin&quot;</strong> or <strong>&quot;Publish Next Pin&quot;</strong> and show the 5-step upload and verification pipeline completing.</li>
                <li>Explain: <em>&quot;This is a private automation tool publishing my own pre-approved kitchen product batches to my own Pinterest business boards.&quot;</em></li>
              </ol>
            </div>
          </div>

          {/* Review Timeline */}
          <div className="p-3 bg-stone-100 rounded-xl text-stone-600 text-[11px] flex items-center justify-between">
            <span><strong>Review timeline:</strong> Typically 1–3 weeks (decided by Pinterest developer relations).</span>
            <span className="font-semibold text-stone-800">No coding changes needed after approval.</span>
          </div>
        </div>

        <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
