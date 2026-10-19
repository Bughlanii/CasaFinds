/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  Search, 
  Filter,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { PublishLog } from '../types';

interface LogsViewProps {
  logs: PublishLog[];
  onClearLogs?: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onClearLogs }) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'published' | 'failed' | 'refreshed'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const publishedToday = logs.filter((l) => l.status === 'published' && l.attempted_at.startsWith(todayStr)).length;
  const failedToday = logs.filter((l) => l.status === 'failed' && l.attempted_at.startsWith(todayStr)).length;
  const refreshedToday = logs.filter((l) => l.status === 'refreshed' && l.attempted_at.startsWith(todayStr)).length;

  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = log.pin_title.toLowerCase().includes(q);
      const matchBoard = log.board_name.toLowerCase().includes(q);
      const matchUrl = log.pin_url?.toLowerCase().includes(q);
      if (!matchTitle && !matchBoard && !matchUrl) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Attempted At', 'Status', 'HTTP Status', 'Pin Title', 'Board', 'Language', 'Pin URL', 'Error', 'Tier'];
    const rows = filteredLogs.map((l) => [
      l.attempted_at,
      l.status,
      l.http_status,
      `"${(l.pin_title || '').replace(/"/g, '""')}"`,
      `"${(l.board_name || '').replace(/"/g, '""')}"`,
      l.language,
      l.pin_url || '',
      `"${(l.error || '').replace(/"/g, '""')}"`,
      l.tier,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `casafinds_pinterest_audit_log_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Daily Audit Report &amp; Publish Log</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Owner Routine Review (FR-08): Every attempt is logged with HTTP status, Pinterest URL, and verification state.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Published Today</span>
            <span className="text-xl font-bold text-stone-900">{publishedToday} pins</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Failures / Errors</span>
            <span className="text-xl font-bold text-stone-900">{failedToday} failures</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Token Refresh Runs</span>
            <span className="text-xl font-bold text-stone-900">{refreshedToday} automated</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-stone-600">Filter Status:</span>
          <div className="inline-flex rounded-lg bg-stone-100 p-0.5">
            {(['ALL', 'published', 'failed', 'refreshed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-semibold capitalize transition-colors ${
                  statusFilter === st ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pin title, board..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">No log entries found</p>
            <p className="text-xs text-stone-500 mt-1">Publish runs and token maintenance events appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Timestamp</th>
                  <th className="px-4 py-3 font-semibold">Status / Code</th>
                  <th className="px-4 py-3 font-semibold">Target Pin Title</th>
                  <th className="px-4 py-3 font-semibold">Board</th>
                  <th className="px-4 py-3 font-semibold">Verification / Link</th>
                  <th className="px-4 py-3 font-semibold text-right">Access Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-stone-600 whitespace-nowrap">
                      {new Date(log.attempted_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.status === 'published' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>HTTP {log.http_status} Published</span>
                        </span>
                      ) : log.status === 'refreshed' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <RefreshCw className="w-3 h-3 text-blue-600" />
                          <span>Token Refreshed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          <span>HTTP {log.http_status} Failed</span>
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900 line-clamp-1 max-w-sm">{log.pin_title}</div>
                      {log.error && (
                        <p className="text-[11px] text-red-600 font-medium mt-0.5">{log.error}</p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            log.language === 'EN' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {log.language}
                        </span>
                        <span className="text-stone-700">{log.board_name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.pin_url ? (
                        <a
                          href={log.pin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-red-700 hover:text-red-900 font-semibold"
                        >
                          <span>Verified Pin</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-stone-400 font-mono text-[10px]">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="font-mono text-[10px] uppercase font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                        {log.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
