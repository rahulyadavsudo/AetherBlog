import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { ActivityLog } from '../types/index.ts';
import { getActivityLogs } from '../lib/storage.ts';
import {
  History,
  Shield,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
} from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>(getActivityLogs());
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-900 dark:text-slate-100">
        <h2 className="text-xl font-bold">Access Restricted to Administrator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Operational activity logs and security audit trails are restricted to Administrator accounts.
        </p>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    // Action category filter
    if (filterAction === 'auth' && !log.action.startsWith('AUTH_')) return false;
    if (filterAction === 'post' && !log.action.startsWith('POST_')) return false;
    if (filterAction === 'crypto' && !log.action.startsWith('E2EE_')) return false;
    if (filterAction === 'backup' && !log.action.startsWith('BACKUP_')) return false;
    if (filterAction === 'collab' && !log.action.startsWith('COLLAB_')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesDetails = log.details.toLowerCase().includes(q);
      const matchesActor = log.actorName.toLowerCase().includes(q);
      const matchesAction = log.action.toLowerCase().includes(q);
      if (!matchesDetails && !matchesActor && !matchesAction) return false;
    }

    return true;
  });

  const exportLogsJson = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aether-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: string) => {
    if (action.startsWith('AUTH_')) {
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900';
    }
    if (action.startsWith('POST_')) {
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    }
    if (action.startsWith('E2EE_')) {
      return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900';
    }
    if (action.startsWith('BACKUP_')) {
      return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-900';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Real-Time Activity Audit Trail
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable operational logs for authentication events, cryptographic operations, and manuscript revisions.
          </p>
        </div>

        <button
          onClick={exportLogsJson}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Audit Log (.json)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Segmented Category Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium overflow-x-auto">
          {[
            { id: 'all', label: 'All Operations' },
            { id: 'auth', label: 'Authentication' },
            { id: 'post', label: 'Manuscripts' },
            { id: 'crypto', label: 'Cryptographic (E2EE)' },
            { id: 'backup', label: 'Sync & Backups' },
            { id: 'collab', label: 'Peer Collaboration' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterAction(f.id)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filterAction === f.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action or details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Event</th>
                <th className="px-4 py-3">Actor & Role</th>
                <th className="px-4 py-3">Audit Details</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredLogs.map(log => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {log.actorName}
                      </span>
                      <span className="text-[10px] uppercase font-mono text-slate-400">
                        ({log.actorRole})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-md truncate font-mono text-xs text-slate-600 dark:text-slate-400">
                    {log.details}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span
                      className={`text-[10px] uppercase font-mono font-bold ${
                        log.status === 'success'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : log.status === 'warning'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
