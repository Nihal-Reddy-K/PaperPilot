import React from 'react';
import {
  History,
  Trash2,
  ArrowRight,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import type { SearchHistoryItem } from '../types/paper.ts';

interface SearchHistoryViewProps {
  history: SearchHistoryItem[];
  onSelectHistory: (item: SearchHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const SearchHistoryView: React.FC<SearchHistoryViewProps> = ({
  history,
  onSelectHistory,
  onClearHistory,
  onDeleteHistoryItem,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-850 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutral-100 tracking-tight">
              Search History
            </h1>
            <span className="font-mono text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
              {history.length} searches
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Previous academic searches and their retrieved literature corpus.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-400 hover:text-rose-400 hover:border-neutral-700 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="py-16 text-center rounded-lg border border-dashed border-neutral-850 p-6 space-y-2">
          <Clock className="h-6 w-6 text-neutral-600 mx-auto" />
          <h2 className="text-sm font-medium text-neutral-300">No search history yet</h2>
          <p className="text-xs text-neutral-500">
            Searches you perform will be saved locally so you can return to prior literature sets.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-850 border-y border-neutral-850">
          {history.map((item) => (
            <div
              key={item.id}
              className="py-4 flex items-center justify-between gap-4 group hover:bg-neutral-900/30 px-3 -mx-3 rounded-md transition-colors"
            >
              <div
                onClick={() => onSelectHistory(item)}
                className="flex-1 cursor-pointer min-w-0"
              >
                <h3 className="text-sm font-medium text-neutral-100 group-hover:text-white transition-colors truncate">
                  {item.topic}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span className="font-mono text-neutral-400">
                    {item.paperCount} {item.paperCount === 1 ? 'paper' : 'papers'}
                  </span>
                  <span>·</span>
                  <span>{item.date}</span>
                  {item.keywords && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-xs text-neutral-500 italic">
                        "{item.keywords}"
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectHistory(item)}
                  className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Restore</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteHistoryItem(item.id)}
                  className="rounded p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-850 transition-colors"
                  title="Delete search from history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
