import React from 'react';
import { TrendingUp, BellRing, X, ArrowRight } from 'lucide-react';
import type { CitationAlert } from '../types/citationMonitor.ts';

interface CitationAlertToastProps {
  alert: CitationAlert | null;
  onDismiss: () => void;
  onOpenMonitor: () => void;
}

export const CitationAlertToast: React.FC<CitationAlertToastProps> = ({
  alert,
  onDismiss,
  onOpenMonitor,
}) => {
  if (!alert) return null;

  return (
    <aside
      aria-label="Citation monitor notification"
      className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] rounded-xl border border-neutral-800 bg-neutral-900/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
          <TrendingUp className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <BellRing className="h-3.5 w-3.5" />
            <span>New Citations Discovered</span>
          </div>

          <p className="mt-1 text-xs font-medium text-neutral-100 line-clamp-2 leading-snug">
            {alert.paperTitle}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
            <span className="font-mono text-emerald-300 font-medium">
              +{alert.delta} {alert.delta === 1 ? 'citation' : 'citations'}
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400">
              Total: <span className="font-mono text-neutral-200">{alert.newCount}</span> (was {alert.previousCount})
            </span>
          </div>

          {alert.searchTopic && (
            <p className="mt-1 text-[11px] text-neutral-500 truncate">
              Triggered during search: <span className="text-neutral-400">{alert.searchTopic}</span>
            </p>
          )}

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => {
                onOpenMonitor();
                onDismiss();
              }}
              className="flex items-center gap-1 text-xs font-medium text-neutral-200 hover:text-white transition-colors cursor-pointer"
            >
              <span>View in Citation Monitor</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={onDismiss}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="shrink-0 rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
          title="Dismiss alert"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
};
