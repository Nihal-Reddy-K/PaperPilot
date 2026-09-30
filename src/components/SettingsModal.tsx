import React from 'react';
import {
  X,
  Settings,
  Database,
  Sliders,
  FileText,
  Trash2,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLimit: number;
  onChangeDefaultLimit: (limit: number) => void;
  onClearSessionCache: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultLimit,
  onChangeDefaultLimit,
  onClearSessionCache,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border border-neutral-850 bg-neutral-900 shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-850 px-5 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-100">
              Settings & Data Sources
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Data Sources */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Configured Academic Repositories
            </label>
            <div className="space-y-1.5 rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-neutral-300">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-neutral-200">OpenAlex</span>
                  <p className="text-[11px] text-neutral-500">250M+ scholarly works, abstracts, and DOIs</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
                <div>
                  <span className="font-semibold text-neutral-200">arXiv API</span>
                  <p className="text-[11px] text-neutral-500">Preprints across CS, AI, Math, and Physics</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
                <div>
                  <span className="font-semibold text-neutral-200">Crossref</span>
                  <p className="text-[11px] text-neutral-500">Official DOI publisher metadata and citations</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Default Retrieval Limit */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Default Retrieval Limit
            </label>
            <div className="flex items-center gap-2">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChangeDefaultLimit(num)}
                  className={`flex-1 rounded-md py-1.5 border text-center transition-colors ${
                    defaultLimit === num
                      ? 'border-neutral-700 bg-neutral-800 text-neutral-100 font-semibold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  {num} papers
                </button>
              ))}
            </div>
          </div>

          {/* Session Data */}
          <div className="space-y-2 pt-2 border-t border-neutral-850">
            <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Session Cache
            </label>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-neutral-500 max-w-[240px]">
                Clear local summary cache and temporary comparison states.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClearSessionCache();
                  onClose();
                }}
                className="rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-neutral-400 hover:text-rose-400 hover:border-neutral-700 transition-colors"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-neutral-850 px-5 py-3 bg-neutral-950/60">
          <button
            onClick={onClose}
            className="rounded-md bg-neutral-800 px-3.5 py-1.5 font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
