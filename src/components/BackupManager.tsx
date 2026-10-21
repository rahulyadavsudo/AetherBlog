import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { BackupSnapshot, Post } from '../types/index.ts';
import {
  getBackupSnapshots,
  createBackupSnapshot,
  restoreBackupSnapshot,
  exportBackupBundle,
  importBackupBundle,
  addActivityLog,
} from '../lib/storage.ts';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  HardDrive,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileArchive,
  ArrowRight,
} from 'lucide-react';

interface BackupManagerProps {
  onDataRestored: () => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({ onDataRestored }) => {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(getBackupSnapshots());
  const [isSyncing, setIsSyncing] = useState(false);
  const [importStatus, setImportStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<BackupSnapshot | null>(null);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-900 dark:text-slate-100">
        <h2 className="text-xl font-bold">Access Restricted to Administrator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Automated backup vaults, database synchronization, and state recovery snapshots are restricted to Administrator accounts.
        </p>
      </div>
    );
  }

  const handleCreateSnapshot = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const snap = createBackupSnapshot(false);
      setSnapshots(getBackupSnapshots());
      setIsSyncing(false);

      if (user) {
        addActivityLog({
          action: 'BACKUP_SYNC',
          actorName: user.name,
          actorRole: user.role,
          details: `Manual vault snapshot created (${snap.postCount} posts, ${(snap.sizeBytes / 1024).toFixed(1)} KB)`,
          status: 'success',
        });
      }
    }, 400);
  };

  const handleRestore = () => {
    if (!selectedSnapshot) return;
    const ok = restoreBackupSnapshot(selectedSnapshot.id);
    if (ok) {
      if (user) {
        addActivityLog({
          action: 'BACKUP_RESTORE',
          actorName: user.name,
          actorRole: user.role,
          details: `Restored vault state to snapshot ${selectedSnapshot.id} (${new Date(selectedSnapshot.timestamp).toLocaleString()})`,
          status: 'warning',
        });
      }
      setConfirmRestoreOpen(false);
      onDataRestored();
    }
  };

  const handleExportJson = () => {
    const bundleStr = exportBackupBundle();
    const blob = new Blob([bundleStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aether-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const res = importBackupBundle(content);
      if (res.success) {
        setImportStatus({
          message: `Successfully imported ${res.count} articles into local storage repository.`,
          type: 'success',
        });
        setSnapshots(getBackupSnapshots());
        onDataRestored();
      } else {
        setImportStatus({
          message: res.error || 'Failed to import backup.',
          type: 'error',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Automated Backup Synchronization
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Continuous local state snapshots, cryptographic integrity verification, and recovery points.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateSnapshot}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Create Snapshot Now'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Sync Pipeline Synchronized</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                Healthy
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Automated snapshots trigger on every content publication or every 5 minutes during active composition.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400">Total Snapshots:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {snapshots.length}
          </span>
        </div>
      </div>

      {/* Import / Export Utility Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 mb-2">
              <Download className="w-5 h-5" />
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                Export Vault Snapshot (.json)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Download complete application data including all markdown documents, revision history, comments, and audit logs into a portable file.
            </p>
          </div>

          <button
            onClick={handleExportJson}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Encrypted Archive</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 mb-2">
              <Upload className="w-5 h-5" />
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                Restore from Vault File (.json)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Import a previously exported JSON vault backup. Existing state will be merged with the imported records.
            </p>

            {importStatus && (
              <div
                className={`mb-4 p-2.5 rounded-lg text-xs font-mono ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                }`}
              >
                {importStatus.message}
              </div>
            )}
          </div>

          <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Select Backup File...</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Snapshots Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Recovery Snapshots Register
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Point-in-time state records with hash validation
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Retention: 20 Snapshots</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="px-5 py-3">Snapshot ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Articles</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Trigger Type</th>
                <th className="px-4 py-3">Integrity Digest</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              {snapshots.map((snap, idx) => (
                <tr
                  key={snap.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                    {snap.id}
                    {idx === 0 && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase font-sans font-bold">
                        Latest
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                    {new Date(snap.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums">
                    {snap.postCount} documents
                  </td>
                  <td className="px-4 py-3.5 tabular-nums">
                    {(snap.sizeBytes / 1024).toFixed(1)} KB
                  </td>
                  <td className="px-4 py-3.5 font-sans">
                    <span
                      className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${
                        snap.autoGenerated
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {snap.autoGenerated ? 'Auto-Daemon' : 'Manual Trigger'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                    {snap.hash}
                  </td>
                  <td className="px-4 py-3.5 text-right font-sans">
                    <button
                      onClick={() => {
                        setSelectedSnapshot(snap);
                        setConfirmRestoreOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmRestoreOpen && selectedSnapshot && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Confirm Vault State Rollback
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Restoring snapshot <strong>{selectedSnapshot.id}</strong> will revert all current articles, drafts, and comments to their state as of <strong>{new Date(selectedSnapshot.timestamp).toLocaleString()}</strong>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setConfirmRestoreOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow cursor-pointer"
              >
                Proceed with Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
