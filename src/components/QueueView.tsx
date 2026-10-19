/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ListOrdered, 
  Clock, 
  ExternalLink, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Eye,
  X
} from 'lucide-react';
import { AppSettings, PinItem } from '../types';

interface QueueViewProps {
  settings: AppSettings;
  queue: PinItem[];
  onRunTick: () => void;
  onPublishSpecificPin: (pinId: string) => void;
  onReorderQueue: (newQueue: PinItem[]) => void;
  isPublishing: boolean;
}

export const QueueView: React.FC<QueueViewProps> = ({
  settings,
  queue,
  onRunTick,
  onPublishSpecificPin,
  onReorderQueue,
  isPublishing,
}) => {
  const [filterLanguage, setFilterLanguage] = useState<'ALL' | 'EN' | 'ES'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'queued' | 'scheduled' | 'published'>('ALL');
  const [inspectPin, setInspectPin] = useState<PinItem | null>(null);

  const filteredQueue = queue.filter((p) => {
    if (filterLanguage !== 'ALL' && p.language !== filterLanguage) return false;
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    return true;
  });

  const movePin = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= queue.length) return;

    const newQueue = [...queue];
    const temp = newQueue[index];
    newQueue[index] = newQueue[targetIndex];
    newQueue[targetIndex] = temp;
    onReorderQueue(newQueue);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Publishing Queue &amp; Schedule</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Pacing: {settings.min_spacing_minutes}–{settings.max_spacing_minutes} min intervals · Window: {settings.posting_window_start}–{settings.posting_window_end} ET · Alternating EN/ES
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onRunTick}
            disabled={isPublishing || queue.filter((p) => p.status !== 'published').length === 0}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Play className={`w-3.5 h-3.5 ${isPublishing ? 'animate-pulse' : 'fill-white'}`} />
            <span>{isPublishing ? 'Publishing...' : 'Publish Next Due Pin'}</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-stone-600">Language:</span>
          <div className="inline-flex rounded-lg bg-stone-100 p-0.5">
            {(['ALL', 'EN', 'ES'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setFilterLanguage(lang)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  filterLanguage === lang
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-semibold text-stone-600">Status:</span>
          <div className="inline-flex rounded-lg bg-stone-100 p-0.5">
            {(['ALL', 'scheduled', 'published'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-md font-semibold capitalize transition-colors ${
                  filterStatus === status
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="text-stone-500 font-medium">
          Showing {filteredQueue.length} of {queue.length} pins
        </div>
      </div>

      {/* Queue Table / List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredQueue.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">No pins matching current filter</p>
            <p className="text-xs text-stone-500 mt-1">Try resetting filters or import a new batch.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredQueue.map((pin, idx) => (
              <div
                key={pin.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="font-mono text-xs font-bold text-stone-400 w-6 text-center shrink-0">
                    #{idx + 1}
                  </div>

                  <img
                    src={pin.image_url}
                    alt={pin.title}
                    className="w-14 h-21 object-cover rounded-lg border border-stone-200 shrink-0 shadow-2xs"
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pin.language === 'EN'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {pin.language}
                      </span>
                      <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        {pin.board_name}
                      </span>
                      {pin.status === 'published' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Published</span>
                        </span>
                      ) : pin.status === 'publishing' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
                          Publishing...
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>
                            {pin.scheduled_at
                              ? new Date(pin.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Scheduled'}
                          </span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{pin.title}</h4>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{pin.description}</p>

                    <div className="mt-1.5 flex items-center space-x-3 text-[10px] text-stone-500">
                      <span className="font-mono bg-stone-50 px-1 py-0.5 rounded border border-stone-200 text-stone-700 truncate max-w-xs">
                        {pin.affiliate_link}
                      </span>
                      <span className="text-emerald-700 font-semibold">Store ID: {settings.store_id}</span>
                    </div>
                  </div>
                </div>

                {/* Pin Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setInspectPin(pin)}
                    className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200 transition-colors"
                    title="Inspect Pin Payload"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {pin.status !== 'published' && (
                    <>
                      <div className="flex flex-col space-y-0.5">
                        <button
                          type="button"
                          onClick={() => movePin(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 rounded hover:bg-stone-200"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePin(idx, 'down')}
                          disabled={idx === queue.length - 1}
                          className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 rounded hover:bg-stone-200"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onPublishSpecificPin(pin.id)}
                        disabled={isPublishing}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3 fill-red-600" />
                        <span>Publish Now</span>
                      </button>
                    </>
                  )}

                  {pin.pin_url && (
                    <a
                      href={pin.pin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <span>View Pin</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspect Pin Modal */}
      {inspectPin && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">Pin Payload Inspector (Pinterest v5 Schema)</h3>
              <button
                type="button"
                onClick={() => setInspectPin(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex gap-4">
                <img
                  src={inspectPin.image_url}
                  alt={inspectPin.title}
                  className="w-24 h-36 object-cover rounded-lg border border-stone-200 shrink-0"
                />
                <div className="space-y-1.5 min-w-0">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">Board</span>
                  <p className="text-xs font-semibold text-stone-900">{inspectPin.board_name} (ID: {inspectPin.board_id})</p>
                  <span className="text-[10px] font-bold text-stone-500 uppercase block mt-2">Title</span>
                  <p className="text-xs font-bold text-stone-900">{inspectPin.title}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Description (with Disclosure)</span>
                <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-200 whitespace-pre-wrap">
                  {inspectPin.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Affiliate Destination Link</span>
                <p className="text-xs font-mono text-stone-800 bg-stone-50 p-2.5 rounded-lg border border-stone-200 break-all">
                  {inspectPin.affiliate_link}
                </p>
              </div>
            </div>
            <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectPin(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
