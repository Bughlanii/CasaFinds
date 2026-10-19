/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Lock, ExternalLink, ShieldCheck } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Privacy Policy (FR-11)</h3>
              <p className="text-xs text-stone-500">CasaFinds Pinterest Auto-Poster Compliance Policy</p>
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

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-stone-700 leading-relaxed">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="font-bold text-stone-900 block mb-1">Official Live Policy Reference</span>
            <p className="text-[11px] text-stone-600">
              The owner maintains an active public privacy policy at{' '}
              <a
                href="https://casafinds.blogspot.com/p/privacy-policy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-700 font-semibold underline inline-flex items-center space-x-1"
              >
                <span>casafinds.blogspot.com/p/privacy-policy.html</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              . This page mirrors and specifies internal handling of API credentials and user data.
            </p>
          </div>

          <h4 className="font-bold text-stone-900 text-sm pt-2">1. Overview</h4>
          <p>
            CasaFinds Pinterest Auto-Poster is an internal, private automation service used exclusively by CasaFinds to publish pre-approved affiliate product recommendations to Pinterest boards.
          </p>

          <h4 className="font-bold text-stone-900 text-sm pt-2">2. Data We Collect and Store</h4>
          <ul className="list-disc list-inside space-y-1 text-stone-600 pl-2">
            <li><strong>Pinterest Account Data:</strong> Connected Pinterest username (@casafinds) and board identifiers strictly via Pinterest OAuth 2.0. We NEVER request, access, or store account passwords, 2FA codes, or one-time passcodes.</li>
            <li><strong>OAuth Access &amp; Refresh Tokens:</strong> Stored securely with AES encryption at rest and used solely to communicate with official Pinterest API v5 endpoints.</li>
            <li><strong>Affiliate Content &amp; Logs:</strong> Product titles, descriptions, disclosures, image media IDs, and publishing timestamps for internal audit purposes.</li>
          </ul>

          <h4 className="font-bold text-stone-900 text-sm pt-2">3. Third-Party Integrations</h4>
          <p>
            This application communicates with:
          </p>
          <ul className="list-disc list-inside space-y-1 text-stone-600 pl-2">
            <li><strong>Pinterest API v5:</strong> for media upload and pin creation (<a href="https://policy.pinterest.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-red-700 underline">Pinterest Privacy Policy</a>).</li>
            <li><strong>Amazon Associates Program:</strong> links carry the confirmed tracking ID <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">casafinds090-20</code> and comply with Amazon Associates Operating Agreement disclosures.</li>
          </ul>

          <h4 className="font-bold text-stone-900 text-sm pt-2">4. Data Sharing &amp; Retention</h4>
          <p>
            We do NOT sell, rent, or monetize your personal data. All tokens and operational logs are stored solely for your automated schedule and can be cleared or revoked at any time.
          </p>

          <div className="pt-3 border-t border-stone-200 text-[11px] text-stone-500">
            Last updated: October 20, 2026 · CasaFinds
          </div>
        </div>

        <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold"
          >
            Close Policy
          </button>
        </div>
      </div>
    </div>
  );
};
