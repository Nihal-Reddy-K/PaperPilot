import React, { useState, useMemo } from 'react';
import {
  Activity,
  Bell,
  Check,
  ExternalLink,
  Filter,
  History,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
} from 'lucide-react';
import type { AcademicPaper } from '../types/paper.ts';
import type { MonitoredPaper, CitationAlert } from '../types/citationMonitor.ts';
import { CitationGrowthChart } from './CitationGrowthChart.tsx';

interface CitationMonitorViewProps {
  monitoredPapers: MonitoredPaper[];
  alerts: CitationAlert[];
  unreadAlertCount: number;
  isChecking: boolean;
  onCheckCitations: () => Promise<void>;
  onSimulateCitationDiscovery: (paperId?: string) => void;
  onUntrackPaper: (paperId: string) => void;
  onBulkUntrackPapers?: (paperIds: string[]) => void;
  onOpenPaperDetail: (paper: AcademicPaper) => void;
  onMarkAllAlertsRead: () => void;
  onClearAlerts: () => void;
  onAddFromSearchPapers: () => void;
  availableSearchPapersCount: number;
}

export const CitationMonitorView: React.FC<CitationMonitorViewProps> = ({
  monitoredPapers,
  alerts,
  unreadAlertCount,
  isChecking,
  onCheckCitations,
  onSimulateCitationDiscovery,
  onUntrackPaper,
  onBulkUntrackPapers,
  onOpenPaperDetail,
  onMarkAllAlertsRead,
  onClearAlerts,
  onAddFromSearchPapers,
  availableSearchPapersCount,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'increased' | 'history'>('all');
  const [expandedHistories, setExpandedHistories] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Aggregate stats
  const totalNewCitations = useMemo(() => {
    return monitoredPapers.reduce((sum, p) => sum + (p.totalNewCitations || 0), 0);
  }, [monitoredPapers]);

  const papersWithIncreases = useMemo(() => {
    return monitoredPapers.filter((p) => p.totalNewCitations > 0);
  }, [monitoredPapers]);

  // Toggle history accordion for a card
  const toggleHistory = (paperId: string) => {
    setExpandedHistories((prev) => {
      const next = new Set(prev);
      if (next.has(paperId)) {
        next.delete(paperId);
      } else {
        next.add(paperId);
      }
      return next;
    });
  };

  // Filtered papers
  const filteredPapers = useMemo(() => {
    let list = [...monitoredPapers];

    if (activeTab === 'increased') {
      list = list.filter((p) => p.totalNewCitations > 0);
    }

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.paper.title.toLowerCase().includes(q) ||
          p.paper.authors.some((a) => a.toLowerCase().includes(q)) ||
          (p.paper.venue && p.paper.venue.toLowerCase().includes(q))
      );
    }

    return list;
  }, [monitoredPapers, activeTab, filterQuery]);

  // Selection & Bulk Remove Handlers
  const toggleSelectPaper = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllSelected =
    filteredPapers.length > 0 && filteredPapers.every((p) => selectedIds.has(p.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPapers.map((p) => p.id)));
    }
  };

  const handleBulkRemove = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (onBulkUntrackPapers) {
      onBulkUntrackPapers(ids);
    } else {
      ids.forEach((id) => onUntrackPaper(id));
    }
    setSelectedIds(new Set());
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Header / Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-neutral-100 tracking-tight">
              Citation Monitor
            </h1>
            <span className="text-[11px] font-mono text-neutral-400">
              ({monitoredPapers.length} tracked)
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-400 max-w-2xl leading-relaxed">
            Tracks selected academic papers and continuously alerts you when new citations are discovered across OpenAlex, Crossref, and Semantic Scholar during literature searches.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCheckCitations()}
            disabled={isChecking || monitoredPapers.length === 0}
            className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:border-neutral-700 hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
            title="Scan OpenAlex and Crossref for latest citation counts"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin text-emerald-400' : 'text-neutral-400'}`} />
            <span>{isChecking ? 'Scanning Indices...' : 'Check Citations'}</span>
          </button>

          <button
            onClick={() => onSimulateCitationDiscovery()}
            disabled={monitoredPapers.length === 0}
            className="flex items-center gap-1.5 rounded-md border border-emerald-800/60 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
            title="Simulate incoming citations to test notification toasts, badge counters, and search triggers"
          >
            <Play className="h-3.5 w-3.5 text-emerald-400" />
            <span>Simulate Discovery</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-lg border border-neutral-850 bg-neutral-900/40 p-3">
          <span className="text-neutral-500 block text-[11px]">Tracked Publications</span>
          <span className="text-lg font-semibold font-mono text-neutral-100">
            {monitoredPapers.length}
          </span>
        </div>

        <div className="rounded-lg border border-neutral-850 bg-neutral-900/40 p-3">
          <span className="text-neutral-500 block text-[11px]">New Citations Discovered</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold font-mono text-emerald-400">
              +{totalNewCitations}
            </span>
            <span className="text-[10px] text-neutral-500">across papers</span>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-850 bg-neutral-900/40 p-3">
          <span className="text-neutral-500 block text-[11px]">Papers With Increases</span>
          <span className="text-lg font-semibold font-mono text-neutral-200">
            {papersWithIncreases.length}
          </span>
        </div>

        <div className="rounded-lg border border-neutral-850 bg-neutral-900/40 p-3">
          <span className="text-neutral-500 block text-[11px]">Unread Discovery Alerts</span>
          <div className="flex items-center justify-between">
            <span className={`text-lg font-semibold font-mono ${unreadAlertCount > 0 ? 'text-emerald-400 font-bold' : 'text-neutral-400'}`}>
              {unreadAlertCount}
            </span>
            {unreadAlertCount > 0 && (
              <button
                onClick={onMarkAllAlertsRead}
                className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Mark read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {monitoredPapers.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center rounded-xl border border-dashed border-neutral-850 p-6 space-y-3 bg-neutral-950/60">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400">
            <Activity className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-neutral-200">
              No academic papers currently monitored
            </h2>
            <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
              Add papers from your search results to track citation growth over time. Whenever you execute a new search, PaperPilot compares newly retrieved bibliographic data and alerts you of any citation gains.
            </p>
          </div>

          {availableSearchPapersCount > 0 && (
            <div className="pt-2">
              <button
                onClick={onAddFromSearchPapers}
                className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-white transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Track Top Search Results ({Math.min(availableSearchPapersCount, 3)} papers)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Recharts Citation Growth & Trajectory Visualization */}
          <CitationGrowthChart
            monitoredPapers={monitoredPapers}
            onOpenPaperDetail={onOpenPaperDetail}
            onSimulateDiscovery={onSimulateCitationDiscovery}
          />

          {/* Filter Bar & Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-neutral-850 pb-3">
            {/* Segmented Filter Controls */}
            <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 p-0.5">
              <button
                onClick={() => setActiveTab('all')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-neutral-800 text-neutral-100'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All Tracked ({monitoredPapers.length})
              </button>
              <button
                onClick={() => setActiveTab('increased')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  activeTab === 'increased'
                    ? 'bg-neutral-800 text-neutral-100'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                With New Citations ({papersWithIncreases.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-neutral-800 text-neutral-100'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Discovery Log ({alerts.length})
              </button>
            </div>

            {/* Filter Search Input & Bulk Select Controls */}
            {activeTab !== 'history' && (
              <div className="flex flex-wrap items-center gap-2">
                {filteredPapers.length > 0 && (
                  <button
                    onClick={handleToggleSelectAll}
                    className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors cursor-pointer select-none"
                    title={isAllSelected ? 'Deselect all visible papers' : 'Select all visible papers for bulk actions'}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Square className="h-3.5 w-3.5 text-neutral-500" />
                    )}
                    <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
                  </button>
                )}

                {selectedIds.size > 0 && (
                  <button
                    onClick={handleBulkRemove}
                    className="flex items-center gap-1.5 rounded-md bg-rose-600/90 hover:bg-rose-600 px-3 py-1 font-semibold text-white transition-colors cursor-pointer text-xs shadow-sm"
                    title="Remove all selected papers from Citation Monitor"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Bulk Remove ({selectedIds.size})</span>
                  </button>
                )}

                <div className="relative">
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter monitored papers..."
                    className="w-44 sm:w-56 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                  />
                  {filterQuery && (
                    <button
                      onClick={() => setFilterQuery('')}
                      className="absolute right-2 top-1.5 text-neutral-500 hover:text-neutral-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* TAB 1 & 2: LIST OF MONITORED PAPERS */}
          {activeTab !== 'history' && (
            <div className="space-y-3">
              {filteredPapers.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  No monitored papers match your current filter.
                </div>
              ) : (
                filteredPapers.map((item) => {
                  const paper = item.paper;
                  const authorsString = paper.authors.join(', ');
                  const displayAuthors =
                    paper.authors.length > 3
                      ? `${paper.authors.slice(0, 3).join(', ')} et al.`
                      : authorsString || 'Unknown Authors';

                  const isExpanded = expandedHistories.has(item.id);
                  const hasGain = item.totalNewCitations > 0;
                  const isSelected = selectedIds.has(item.id);

                  return (
                    <article
                      key={item.id}
                      className={`rounded-xl border p-4 transition-colors ${
                        isSelected
                          ? 'border-neutral-750 bg-neutral-900/60 shadow-inner'
                          : 'border-neutral-850 bg-neutral-950 hover:border-neutral-800 hover:bg-neutral-900/30'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Checkbox for Bulk Removal */}
                        <div className="pt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectPaper(item.id)}
                            className="h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-900 text-neutral-100 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            title="Select paper for bulk removal"
                          />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          {/* Top Row: Title & Actions */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3
                                onClick={() => onOpenPaperDetail(paper)}
                                className="text-sm font-medium text-neutral-100 hover:text-white cursor-pointer transition-colors leading-snug line-clamp-2"
                              >
                                {paper.title}
                              </h3>

                              {/* Metadata byline (No pill wraps, clean typography) */}
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
                                <span className="text-neutral-300">{displayAuthors}</span>
                                {paper.venue && (
                                  <>
                                    <span className="text-neutral-600">·</span>
                                    <span className="text-neutral-400 truncate max-w-xs">
                                      {paper.venue}
                                    </span>
                                  </>
                                )}
                                {paper.year && (
                                  <>
                                    <span className="text-neutral-600">·</span>
                                    <span className="text-neutral-300 font-mono">{paper.year}</span>
                                  </>
                                )}
                                {paper.doi && (
                                  <>
                                    <span className="text-neutral-600">·</span>
                                    <a
                                      href={`https://doi.org/${paper.doi}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-neutral-500 hover:text-neutral-300 font-mono text-[11px]"
                                    >
                                      {paper.doi}
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Top Right Untrack button */}
                            <button
                              onClick={() => onUntrackPaper(item.id)}
                              className="shrink-0 p-1 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Remove this paper from Citation Monitor"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Citation Tracking Status Strip */}
                          <div className="mt-3 rounded-lg border border-neutral-850/80 bg-neutral-900/60 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap items-center gap-4">
                              <div>
                                <span className="text-[10px] text-neutral-500 block">Baseline Count</span>
                                <span className="font-mono text-neutral-300 font-medium">
                                  {item.initialCitationCount} citations
                                </span>
                              </div>

                              <div className="h-6 w-px bg-neutral-800" />

                              <div>
                                <span className="text-[10px] text-neutral-500 block">Current Count</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-neutral-100 font-semibold">
                                    {item.latestCitationCount} citations
                                  </span>
                                  {hasGain && (
                                    <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                                      (+{item.totalNewCitations})
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="h-6 w-px bg-neutral-800 hidden sm:block" />

                              <div className="hidden sm:block">
                                <span className="text-[10px] text-neutral-500 block">Last Checked</span>
                                <span className="text-neutral-400 text-[11px]">
                                  {new Date(item.lastCheckedAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Quick Test / Expand Buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onSimulateCitationDiscovery(item.id)}
                                className="flex items-center gap-1 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-[11px] font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors cursor-pointer"
                                title="Simulate +1 new citation for this paper"
                              >
                                <Plus className="h-3 w-3 text-emerald-400" />
                                <span>Simulate +1</span>
                              </button>

                              <button
                                onClick={() => toggleHistory(item.id)}
                                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                              >
                                <History className="h-3 w-3" />
                                <span>History ({item.history.length})</span>
                                {isExpanded ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expandable History Timeline */}
                          {isExpanded && (
                            <div className="mt-2.5 rounded-lg border border-neutral-850 bg-neutral-900/30 p-3 space-y-2 text-xs">
                              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                                Citation Growth Timeline
                              </span>

                              <div className="space-y-1.5 divide-y divide-neutral-850/60">
                                {item.history.map((entry, idx) => (
                                  <div
                                    key={idx}
                                    className="pt-1.5 flex items-center justify-between text-[11px]"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-neutral-500 font-mono">
                                        {new Date(entry.timestamp).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          month: 'short',
                                          day: 'numeric',
                                        })}
                                      </span>
                                      {entry.delta ? (
                                        <span className="font-mono text-emerald-400 font-medium">
                                          +{entry.delta} new citations
                                        </span>
                                      ) : (
                                        <span className="text-neutral-400">Baseline recorded</span>
                                      )}
                                      {entry.sourceQuery && (
                                        <span className="text-neutral-500 truncate max-w-xs">
                                          via search "{entry.sourceQuery}"
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-mono text-neutral-300 font-medium">
                                      {entry.count} total
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Card Footer Actions */}
                          <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                            <span className="text-[11px] text-neutral-500">
                              Tracked since {new Date(item.trackedSince).toLocaleDateString()}
                            </span>

                            <div className="flex items-center gap-3">
                              {paper.sourceUrl && (
                                <a
                                  href={paper.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-neutral-200 flex items-center gap-1 transition-colors"
                                >
                                  <span>Open</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              <button
                                onClick={() => onOpenPaperDetail(paper)}
                                className="hover:text-neutral-200 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Sparkles className="h-3 w-3 text-neutral-400" />
                                <span>Details & Summary</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: DISCOVERY ALERTS AUDIT LOG */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-850 pb-2">
                <span>Chronological log of newly discovered citations during literature searches</span>
                {alerts.length > 0 && (
                  <button
                    onClick={onClearAlerts}
                    className="text-neutral-400 hover:text-rose-400 text-xs transition-colors cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {alerts.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  No citation discoveries recorded yet. When a new search discovers higher citation counts for tracked papers, logs will appear here.
                </div>
              ) : (
                <div className="divide-y divide-neutral-850/80 rounded-xl border border-neutral-850 bg-neutral-950">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="p-3.5 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-400 font-semibold">
                              +{alert.delta} {alert.delta === 1 ? 'citation' : 'citations'}
                            </span>
                            <span className="text-neutral-600">·</span>
                            <span className="text-neutral-400">
                              Count: {alert.previousCount} →{' '}
                              <span className="text-neutral-200 font-mono font-medium">
                                {alert.newCount}
                              </span>
                            </span>
                          </div>

                          <p className="font-medium text-neutral-200">
                            {alert.paperTitle}
                          </p>

                          {alert.searchTopic && (
                            <p className="text-[11px] text-neutral-500">
                              Discovered during search for:{' '}
                              <span className="text-neutral-400 font-medium">
                                "{alert.searchTopic}"
                              </span>
                            </p>
                          )}
                        </div>

                        <span className="font-mono text-[11px] text-neutral-500 shrink-0">
                          {new Date(alert.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Bulk Remove Ribbon */}
      {selectedIds.size > 0 && activeTab !== 'history' && (
        <aside
          aria-label="Bulk removal actions"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="flex items-center gap-3 rounded-xl border border-neutral-750 bg-neutral-900/95 px-4 py-2.5 shadow-2xl backdrop-blur-md text-xs">
            <span className="font-mono text-neutral-300 font-semibold">
              {selectedIds.size} {selectedIds.size === 1 ? 'paper' : 'papers'} selected
            </span>
            <div className="h-3.5 w-px bg-neutral-800" />
            <button
              onClick={handleBulkRemove}
              className="flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 font-semibold text-white hover:bg-rose-500 transition-colors cursor-pointer shadow-sm"
              title="Remove all selected papers from Citation Monitor"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Bulk Remove ({selectedIds.size})</span>
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-neutral-400 hover:text-neutral-200 transition-colors ml-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};
