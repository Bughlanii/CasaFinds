/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Layers, 
  ExternalLink,
  Code,
  ShieldAlert,
  Info
} from 'lucide-react';
import { AppSettings, Batch, Board, PinItem } from '../types';
import { BATCH_1_PINS } from '../data/mockData';
import { DISCLOSURE_EN, DISCLOSURE_ES, validatePinRecord } from '../utils/rules';

interface BatchImportViewProps {
  settings: AppSettings;
  boards: Board[];
  batches: Batch[];
  onApproveBatch: (batchId: string) => void;
  onImportNewBatch: (batchName: string, pins: PinItem[]) => void;
  onNavigateTab: (tab: string) => void;
}

export const BatchImportView: React.FC<BatchImportViewProps> = ({
  settings,
  boards,
  batches,
  onApproveBatch,
  onImportNewBatch,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'approved' | 'import_new'>('approved');
  const [batchName, setBatchName] = useState('Batch 2 — Smart Countertop Gadgets');
  const [rawContent, setRawContent] = useState('');
  const [importFormat, setImportFormat] = useState<'json' | 'template'>('json');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [parsedPins, setParsedPins] = useState<PinItem[]>([]);
  const [validationRan, setValidationRan] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 1-Click Load Batch 1
  const handleLoadBatch1Template = () => {
    const jsonSample = JSON.stringify(
      BATCH_1_PINS.slice(0, 4).map((p) => ({
        title: p.title,
        description: p.description,
        product_url: p.product_url,
        image_url: p.image_url,
        image_width: p.image_width,
        image_height: p.image_height,
        language: p.language,
        board_id: p.board_id,
        board_name: p.board_name,
      })),
      null,
      2
    );
    setRawContent(jsonSample);
    setValidationRan(false);
    setValidationErrors([]);
    setParsedPins([]);
  };

  // Validate parsed content
  const handleValidateBatch = () => {
    setValidationErrors([]);
    setSuccessMsg('');
    setValidationRan(true);

    if (!rawContent.trim()) {
      setValidationErrors(['Please paste structured JSON or batch records.']);
      return;
    }

    try {
      const parsed = JSON.parse(rawContent);
      if (!Array.isArray(parsed)) {
        setValidationErrors(['Batch format error: Root must be a JSON array of pins.']);
        return;
      }

      const allErrors: string[] = [];
      const validPins: PinItem[] = [];

      parsed.forEach((item: any, idx: number) => {
        const pinValidation = validatePinRecord(item, settings.store_id);
        if (!pinValidation.valid) {
          allErrors.push(`Pin #${idx + 1} ("${item.title || 'Untitled'}"): ${pinValidation.errors.join('; ')}`);
        } else {
          validPins.push({
            id: `pin-import-${Date.now()}-${idx + 1}`,
            batch_id: 'pending-batch',
            title: item.title,
            description: item.description,
            hashtags: item.hashtags || [],
            image_url: item.image_url,
            image_width: item.image_width || 1000,
            image_height: item.image_height || 1500,
            product_url: item.product_url,
            affiliate_link: pinValidation.processedLink || item.product_url,
            board_id: item.board_id || boards[0]?.id || '109283746501',
            board_name: item.board_name || boards[0]?.name || 'Kitchen Finds',
            language: item.language || 'EN',
            status: 'queued',
            created_at: new Date().toISOString(),
          });
        }
      });

      if (allErrors.length > 0) {
        setValidationErrors(allErrors);
      } else {
        setParsedPins(validPins);
        setSuccessMsg(`Validation Passed: ${validPins.length} pins verified against FR-04 Amazon and Pinterest rules.`);
      }
    } catch (e: any) {
      setValidationErrors([`JSON Syntax Error: ${e.message}`]);
    }
  };

  const handleCommitBatch = () => {
    if (parsedPins.length === 0) return;
    onImportNewBatch(batchName, parsedPins);
    setSuccessMsg(`Successfully imported "${batchName}"! You can now review and approve it.`);
    setRawContent('');
    setParsedPins([]);
    setValidationRan(false);
    setActiveTab('approved');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Batch Management &amp; Approval</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Hard Rule #1: The system only publishes owner-approved batches. Unapproved batches never enter the queue.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'approved' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Review &amp; Approve Batches ({batches.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import_new')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'import_new' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import New Batch</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Approved / Existing Batches */}
      {activeTab === 'approved' && (
        <div className="space-y-6">
          {batches.map((batch) => {
            const enCount = batch.pins.filter((p) => p.language === 'EN').length;
            const esCount = batch.pins.filter((p) => p.language === 'ES').length;

            return (
              <div
                key={batch.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden"
              >
                <div className="p-5 sm:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-base text-stone-900">{batch.name}</span>
                      {batch.approved ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Approved for Queue</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pending Owner Approval</span>
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center space-x-3 text-xs text-stone-500">
                      <span>Total: <strong>{batch.pins.length} pins</strong></span>
                      <span>·</span>
                      <span className="text-blue-600 font-medium">{enCount} English</span>
                      <span>·</span>
                      <span className="text-emerald-600 font-medium">{esCount} Spanish</span>
                      <span>·</span>
                      <span>Imported {new Date(batch.imported_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {!batch.approved ? (
                      <button
                        type="button"
                        onClick={() => onApproveBatch(batch.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve &amp; Send to Queue</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigateTab('queue')}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <span>View in Queue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Pins preview grid in Batch */}
                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {batch.pins.map((pin, idx) => (
                      <div
                        key={pin.id || idx}
                        className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs hover:shadow-xs transition-shadow flex flex-col"
                      >
                        <div className="relative aspect-[2/3] bg-stone-100 overflow-hidden">
                          <img
                            src={pin.image_url}
                            alt={pin.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 flex items-center space-x-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-xs ${
                                pin.language === 'EN'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {pin.language}
                            </span>
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                              2:3 aspect
                            </span>
                          </div>
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <span className="text-[10px] text-stone-500 font-medium block truncate">
                              {pin.board_name}
                            </span>
                            <h4 className="text-xs font-bold text-stone-900 line-clamp-2 mt-0.5">
                              {pin.title}
                            </h4>
                          </div>

                          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono bg-stone-50 px-1 py-0.5 rounded border border-stone-200 text-stone-700">
                                {pin.affiliate_link.includes('amzn.to') ? 'amzn.to' : 'dp/ASIN'}
                              </span>
                              <span className="text-emerald-700 font-semibold">Disclosure #ad</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Import New Batch */}
      {activeTab === 'import_new' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Import Assistant Content Batch</h3>
              <p className="text-xs text-stone-500">
                Validated against FR-04: title length, exact disclosure ending, 2:3 imagery, and Store ID tagging.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadBatch1Template}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Load Batch Template (JSON)</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="batch-name-input" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Batch Name
              </label>
              <input
                id="batch-name-input"
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="batch-json-textarea" className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Paste JSON Array of Pins
                </label>
                <span className="text-[11px] text-stone-500">
                  Must include: title, description (with disclosure), product_url, image_url
                </span>
              </div>
              <textarea
                id="batch-json-textarea"
                rows={10}
                value={rawContent}
                onChange={(e) => {
                  setRawContent(e.target.value);
                  setValidationRan(false);
                }}
                placeholder='[
  {
    "title": "Herb Scissors with 5 Stainless Steel Blades",
    "description": "Cut fresh herbs in seconds. As an Amazon Associate I earn from qualifying purchases. #ad",
    "product_url": "https://www.amazon.com/dp/B00004OCK1",
    "image_url": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=1000&h=1500&fit=crop",
    "image_width": 1000,
    "image_height": 1500,
    "language": "EN"
  }
]'
                className="w-full font-mono text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            {/* Validation Rule Summary Box */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-2">
              <div className="flex items-center space-x-1.5 font-bold text-stone-900">
                <Info className="w-4 h-4 text-stone-600" />
                <span>FR-04 Automated Validation Rules</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px]">
                <li><strong>Title:</strong> Maximum 100 characters.</li>
                <li><strong>Description:</strong> Maximum 500 characters.</li>
                <li>
                  <strong>Mandatory Disclosure:</strong> Description must end with exact line:
                  <div className="mt-1 font-mono text-[10px] bg-stone-100 p-1.5 rounded">
                    EN: &quot;{DISCLOSURE_EN}&quot;<br />
                    ES: &quot;{DISCLOSURE_ES}&quot;
                  </div>
                </li>
                <li><strong>Image Ratio:</strong> Must be 2:3 ratio (min 1000×1500 px, 1200×1800 px, etc.).</li>
                <li>
                  <strong>Amazon URL Tagging:</strong> If <code className="font-mono">amazon.com/dp/...</code>, the app appends <code className="font-mono">?tag={settings.store_id}</code>. If <code className="font-mono">amzn.to/...</code> short link, it is preserved AS-IS.
                </li>
              </ul>
            </div>

            {/* Validation Feedback */}
            {validationErrors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>Validation Failed ({validationErrors.length} errors found)</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-red-800 mt-2">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleValidateBatch}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Run FR-04 Pre-Validation
              </button>

              {parsedPins.length > 0 && (
                <button
                  type="button"
                  onClick={handleCommitBatch}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Import {parsedPins.length} Validated Pins</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
