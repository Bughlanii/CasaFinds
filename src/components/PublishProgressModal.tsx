/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, ExternalLink, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { PublishProgressState } from '../types';

interface PublishProgressModalProps {
  progress: PublishProgressState;
  onClose: () => void;
  pinUrl?: string;
}

export const PublishProgressModal: React.FC<PublishProgressModalProps> = ({
  progress,
  onClose,
  pinUrl,
}) => {
  if (!progress.isPublishing && progress.currentStep === 'idle') {
    return null;
  }

  const steps = [
    {
      id: 'upload_media_init',
      name: '1. Register Media',
      sub: 'POST /v5/media',
    },
    {
      id: 'upload_s3',
      name: '2. S3 Direct Upload',
      sub: 'multipart/form-data',
    },
    {
      id: 'poll_media',
      name: '3. Poll Processing',
      sub: 'GET /v5/media/{id}',
    },
    {
      id: 'create_pin',
      name: '4. Publish Pin',
      sub: 'POST /v5/pins',
    },
    {
      id: 'verify_pin',
      name: '5. Audit Verify',
      sub: 'GET /v5/pins/{id}',
    },
  ];

  const getStepStatus = (stepId: string) => {
    const stepOrder = ['upload_media_init', 'upload_s3', 'poll_media', 'create_pin', 'verify_pin', 'complete'];
    const currentIndex = stepOrder.indexOf(progress.currentStep);
    const thisIndex = stepOrder.indexOf(stepId);

    if (progress.currentStep === 'error') {
      return thisIndex === currentIndex ? 'error' : thisIndex < currentIndex ? 'completed' : 'pending';
    }
    if (progress.currentStep === 'complete') {
      return 'completed';
    }
    if (thisIndex < currentIndex) {
      return 'completed';
    }
    if (thisIndex === currentIndex) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              P
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Pinterest API v5 Pipeline</h3>
              <p className="text-xs text-stone-500">Autonomous media upload and verification</p>
            </div>
          </div>
          {!progress.isPublishing && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6">
          {progress.pinTitle && (
            <div className="mb-5 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Target Pin</span>
              <p className="text-xs font-semibold text-stone-900 line-clamp-1 mt-0.5">{progress.pinTitle}</p>
            </div>
          )}

          {/* Stepper */}
          <div className="space-y-3">
            {steps.map((st) => {
              const status = getStepStatus(st.id);
              return (
                <div
                  key={st.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                    status === 'active'
                      ? 'bg-red-50/70 border-red-200 text-red-900 font-semibold'
                      : status === 'completed'
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                      : status === 'error'
                      ? 'bg-red-100 border-red-300 text-red-900'
                      : 'bg-stone-50/50 border-stone-200 text-stone-400'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {status === 'active' && <Loader2 className="w-4 h-4 text-red-600 animate-spin shrink-0" />}
                    {status === 'pending' && <div className="w-4 h-4 rounded-full border border-stone-300 shrink-0" />}
                    {status === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                    <div>
                      <span className="block font-medium">{st.name}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-stone-500 bg-white/80 px-1.5 py-0.5 rounded border border-stone-200">
                    {st.sub}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Live Progress Status message */}
          <div className="mt-4 p-3 rounded-lg bg-stone-100/70 border border-stone-200 text-xs text-stone-700">
            <span className="font-semibold text-stone-900">Current Action: </span>
            <span>{progress.stepMessage}</span>
          </div>

          {/* Success Result */}
          {progress.currentStep === 'complete' && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <div className="inline-flex p-2 bg-emerald-100 text-emerald-700 rounded-full mb-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-emerald-900">Pin Successfully Published & Verified!</h4>
              <p className="text-xs text-emerald-800">
                Logged to Daily Audit Log with HTTP 201 response and owner Amazon tag attached.
              </p>
              {pinUrl && (
                <div className="pt-2">
                  <a
                    href={pinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg shadow-xs"
                  >
                    <span>View Published Pin on Pinterest</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {progress.currentStep === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-red-900">
                <AlertCircle className="w-4 h-4" />
                <span>Publishing Pipeline Halted</span>
              </div>
              <p>{progress.error || 'Unexpected error during API call'}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={progress.isPublishing}
            className={`px-4 py-2 rounded-lg text-xs font-semibold ${
              progress.isPublishing
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-stone-800 hover:bg-stone-900 text-white'
            }`}
          >
            {progress.currentStep === 'complete' ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
