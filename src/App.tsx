import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckSquare,
  Square,
  Sparkles,
  GitCompare,
  Bookmark,
  FileText,
  AlertCircle,
  BookOpen,
  Share2,
  LayoutList,
  Menu,
  ChevronDown,
  ExternalLink,
  Plus,
  SlidersHorizontal,
  FileDown,
  Activity,
} from 'lucide-react';
import type {
  AcademicPaper,
  SearchRequest,
  SearchResponse,
  PaperSummary,
  PaperComparison,
  StructuredResearchGap,
  SearchHistoryItem,
} from './types/paper.ts';
import type { MonitoredPaper, CitationAlert } from './types/citationMonitor.ts';

import { Sidebar, type NavigationTab } from './components/Sidebar.tsx';
import { SearchComposer } from './components/SearchComposer.tsx';
import { PaperResultItem } from './components/PaperResultItem.tsx';
import { PaperDetailView } from './components/PaperDetailView.tsx';
import { CompareView } from './components/CompareView.tsx';
import { ResearchGapsView } from './components/ResearchGapsView.tsx';
import { SearchHistoryView } from './components/SearchHistoryView.tsx';
import { SavedPapersView } from './components/SavedPapersView.tsx';
import { CitationGraph } from './components/CitationGraph.tsx';
import { CitationMonitorView } from './components/CitationMonitorView.tsx';
import { CitationAlertToast } from './components/CitationAlertToast.tsx';
import { CitationAlertsDropdown } from './components/CitationAlertsDropdown.tsx';
import { PaperChatDrawer } from './components/PaperChatDrawer.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { BibTeXModal } from './components/BibTeXModal.tsx';
import { LoadingIndicator } from './components/LoadingIndicator.tsx';
import { ExportReportModal } from './components/ExportReportModal.tsx';
import type { ReportExportData } from './utils/exportReport.ts';

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('search');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [resultsViewMode, setResultsViewMode] = useState<'list' | 'graph'>('list');

  // Search state
  const [hasSearched, setHasSearched] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('Cache contention aware CPU workload placement');
  const [currentKeywords, setCurrentKeywords] = useState('LLC, cache contention, CPU scheduling, workload interference');
  const [papers, setPapers] = useState<AcademicPaper[]>([]);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search History state (stored in localStorage)
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('researchscout_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Saved Papers Library state (stored in localStorage)
  const [savedPapers, setSavedPapers] = useState<AcademicPaper[]>(() => {
    try {
      const stored = localStorage.getItem('researchscout_saved');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Citation Monitor state (stored in localStorage)
  const [monitoredPapers, setMonitoredPapers] = useState<MonitoredPaper[]>(() => {
    try {
      const stored = localStorage.getItem('researchscout_monitored_papers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [citationAlerts, setCitationAlerts] = useState<CitationAlert[]>(() => {
    try {
      const stored = localStorage.getItem('researchscout_citation_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [recentCitationAlert, setRecentCitationAlert] = useState<CitationAlert | null>(null);
  const [isCheckingCitations, setIsCheckingCitations] = useState(false);
  const [isAlertsDropdownOpen, setIsAlertsDropdownOpen] = useState(false);

  // Selection state for multi-paper comparison
  const [selectedPaperIds, setSelectedPaperIds] = useState<Set<string>>(new Set());

  // Filter & Sort
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'citations' | 'newest'>('relevance');
  const [onlyOpenAccess, setOnlyOpenAccess] = useState(false);

  // Paper Detail View state
  const [activeDetailPaper, setActiveDetailPaper] = useState<AcademicPaper | null>(null);
  const [summaryCache, setSummaryCache] = useState<Record<string, PaperSummary>>({});
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Compare View state
  const [comparisonResult, setComparisonResult] = useState<PaperComparison | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  // Research Gaps View state
  const [researchGaps, setResearchGaps] = useState<StructuredResearchGap[]>([]);
  const [isLoadingGaps, setIsLoadingGaps] = useState(false);

  // Dialogs & drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBibtexOpen, setIsBibtexOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [defaultLimit, setDefaultLimit] = useState(10);

  // Sync saved papers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('researchscout_saved', JSON.stringify(savedPapers));
    } catch (e) {
      console.error('Failed to sync saved papers:', e);
    }
  }, [savedPapers]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('researchscout_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to sync history:', e);
    }
  }, [history]);

  // Sync monitored papers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('researchscout_monitored_papers', JSON.stringify(monitoredPapers));
    } catch (e) {
      console.error('Failed to sync monitored papers:', e);
    }
  }, [monitoredPapers]);

  // Sync citation alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('researchscout_citation_alerts', JSON.stringify(citationAlerts));
    } catch (e) {
      console.error('Failed to sync citation alerts:', e);
    }
  }, [citationAlerts]);

  const monitoredPaperIds = useMemo(
    () => new Set(monitoredPapers.map((p) => p.id)),
    [monitoredPapers]
  );
  const unreadAlertCount = useMemo(
    () => citationAlerts.filter((a) => !a.read).length,
    [citationAlerts]
  );

  // Citation Monitor Verification Engine
  // Checks all tracked papers against newly discovered literature during search
  const checkMonitoredPapersOnSearch = async (
    retrievedPapers: AcademicPaper[],
    searchTopic: string,
    currentMonitoredList: MonitoredPaper[]
  ) => {
    if (currentMonitoredList.length === 0) return;

    const newAlerts: CitationAlert[] = [];
    const updated = currentMonitoredList.map((mon) => {
      // Find matching paper in search results
      const matchInSearch = retrievedPapers.find((r) => {
        if (r.id === mon.id) return true;
        if (
          r.doi &&
          mon.paper.doi &&
          r.doi.toLowerCase().trim() === mon.paper.doi.toLowerCase().trim()
        )
          return true;
        const normR = r.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normM = mon.paper.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normR.length > 10 && normR === normM;
      });

      if (matchInSearch && typeof matchInSearch.citationCount === 'number') {
        const freshCount = matchInSearch.citationCount;
        if (freshCount > mon.latestCitationCount) {
          const delta = freshCount - mon.latestCitationCount;
          const alert: CitationAlert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            paperId: mon.id,
            paperTitle: mon.paper.title,
            previousCount: mon.latestCitationCount,
            newCount: freshCount,
            delta,
            timestamp: Date.now(),
            searchTopic,
            read: false,
          };
          newAlerts.push(alert);

          return {
            ...mon,
            latestCitationCount: freshCount,
            totalNewCitations: mon.totalNewCitations + delta,
            lastCheckedAt: Date.now(),
            lastDiscoveryAt: Date.now(),
            history: [
              {
                timestamp: Date.now(),
                count: freshCount,
                delta,
                sourceQuery: searchTopic,
                note: `Discovered during search for "${searchTopic}"`,
              },
              ...mon.history,
            ],
          };
        }
      }

      return {
        ...mon,
        lastCheckedAt: Date.now(),
      };
    });

    // Also check remaining monitored papers that were not in this search query
    const unMatchedMonitored = updated.filter(
      (m) =>
        !retrievedPapers.some(
          (r) =>
            r.id === m.id ||
            (r.doi && m.paper.doi && r.doi.toLowerCase().trim() === m.paper.doi.toLowerCase().trim())
        )
    );

    if (unMatchedMonitored.length > 0) {
      try {
        const payload = unMatchedMonitored.map((m) => ({
          id: m.id,
          doi: m.paper.doi,
          title: m.paper.title,
          currentCount: m.latestCitationCount,
        }));

        const res = await fetch('/api/check-citations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ papers: payload }),
        });

        if (res.ok) {
          const { updates } = await res.json();
          if (Array.isArray(updates)) {
            for (const upd of updates) {
              if (typeof upd.citationCount === 'number') {
                const targetIdx = updated.findIndex((m) => m.id === upd.id);
                if (targetIdx !== -1) {
                  const target = updated[targetIdx];
                  if (upd.citationCount > target.latestCitationCount) {
                    const delta = upd.citationCount - target.latestCitationCount;
                    const alert: CitationAlert = {
                      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                      paperId: target.id,
                      paperTitle: target.paper.title,
                      previousCount: target.latestCitationCount,
                      newCount: upd.citationCount,
                      delta,
                      timestamp: Date.now(),
                      searchTopic,
                      read: false,
                    };
                    newAlerts.push(alert);

                    updated[targetIdx] = {
                      ...target,
                      latestCitationCount: upd.citationCount,
                      totalNewCitations: target.totalNewCitations + delta,
                      lastCheckedAt: Date.now(),
                      lastDiscoveryAt: Date.now(),
                      history: [
                        {
                          timestamp: Date.now(),
                          count: upd.citationCount,
                          delta,
                          sourceQuery: searchTopic,
                          note: `Discovered during search for "${searchTopic}" via ${upd.source || 'OpenAlex'}`,
                        },
                        ...target.history,
                      ],
                    };
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Background citation refresh failed:', err);
      }
    }

    setMonitoredPapers(updated);

    if (newAlerts.length > 0) {
      setCitationAlerts((prev) => [...newAlerts, ...prev]);
      setRecentCitationAlert(newAlerts[0]);
    }
  };

  // Initial load: execute search for example research topic
  useEffect(() => {
    handleExecuteSearch({
      topic: 'Cache contention aware CPU workload placement',
      keywords: 'LLC, cache contention, CPU scheduling, workload interference',
      startYear: 2020,
      endYear: 2026,
      limit: 10,
    });
  }, []);

  // Main search execution handler
  const handleExecuteSearch = async (params: SearchRequest) => {
    setIsSearching(true);
    setErrorMessage(null);
    setCurrentTopic(params.topic);
    setCurrentKeywords(params.keywords);
    setCurrentTab('search');

    try {
      const res = await fetch('/api/search-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Search request failed with status ${res.status}`);
      }

      const data: SearchResponse = await res.json();
      setSearchResponse(data);
      const retrieved = data.papers || [];
      setPapers(retrieved);
      setHasSearched(true);

      // Pre-select top 2 papers for comparison readiness
      if (retrieved.length >= 2) {
        setSelectedPaperIds(new Set([retrieved[0].id, retrieved[1].id]));
      } else {
        setSelectedPaperIds(new Set());
      }

      // Citation Monitor Verification:
      // If first run, auto-seed the first 2 papers into Citation Monitor so tracking is ready immediately
      if (
        monitoredPapers.length === 0 &&
        !localStorage.getItem('researchscout_monitored_seed') &&
        retrieved.length >= 2
      ) {
        localStorage.setItem('researchscout_monitored_seed', 'true');
        const seedPapers: MonitoredPaper[] = retrieved.slice(0, 2).map((paper) => ({
          id: paper.id,
          paper,
          initialCitationCount: paper.citationCount ?? 0,
          latestCitationCount: paper.citationCount ?? 0,
          totalNewCitations: 0,
          trackedSince: Date.now(),
          lastCheckedAt: Date.now(),
          history: [
            {
              timestamp: Date.now(),
              count: paper.citationCount ?? 0,
              delta: 0,
              sourceQuery: params.topic,
              note: 'Initial research topic baseline',
            },
          ],
          status: 'active',
        }));
        setMonitoredPapers(seedPapers);
      } else if (monitoredPapers.length > 0) {
        // Evaluate monitored papers against new search results & academic sources
        checkMonitoredPapersOnSearch(retrieved, params.topic.trim(), monitoredPapers);
      }

      // Record to history
      if (params.topic.trim()) {
        const historyItem: SearchHistoryItem = {
          id: `hist-${Date.now()}`,
          topic: params.topic.trim(),
          keywords: params.keywords.trim(),
          paperCount: retrieved.length,
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          timestamp: Date.now(),
          papers: retrieved,
          searchResponse: data,
        };
        setHistory((prev) => [
          historyItem,
          ...prev.filter((h) => h.topic.toLowerCase() !== params.topic.trim().toLowerCase()),
        ]);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMessage(err.message || 'Failed to retrieve academic literature.');
    } finally {
      setIsSearching(false);
    }
  };

  // Restore previous search from history
  const handleRestoreHistory = (item: SearchHistoryItem) => {
    setCurrentTopic(item.topic);
    setCurrentKeywords(item.keywords);
    setPapers(item.papers || []);
    if (item.searchResponse) setSearchResponse(item.searchResponse);
    setHasSearched(true);
    setCurrentTab('search');
    if (item.papers && item.papers.length >= 2) {
      setSelectedPaperIds(new Set([item.papers[0].id, item.papers[1].id]));
    }
  };

  // Paper selection toggle
  const handleToggleSelectPaper = (paperId: string) => {
    setSelectedPaperIds((prev) => {
      const next = new Set(prev);
      if (next.has(paperId)) {
        next.delete(paperId);
      } else {
        next.add(paperId);
      }
      return next;
    });
  };

  // Select / Deselect all
  const handleSelectAll = () => {
    if (selectedPaperIds.size === filteredPapers.length) {
      setSelectedPaperIds(new Set());
    } else {
      setSelectedPaperIds(new Set(filteredPapers.map((p) => p.id)));
    }
  };

  // Save / Bookmark toggle
  const handleToggleSavePaper = (paper: AcademicPaper) => {
    setSavedPapers((prev) => {
      const exists = prev.some((p) => p.id === paper.id);
      if (exists) {
        return prev.filter((p) => p.id !== paper.id);
      } else {
        return [...prev, paper];
      }
    });
  };

  // Citation Monitor: Toggle tracking for an individual paper
  const handleToggleMonitorPaper = (paper: AcademicPaper) => {
    setMonitoredPapers((prev) => {
      const exists = prev.some((p) => p.id === paper.id);
      if (exists) {
        return prev.filter((p) => p.id !== paper.id);
      }
      const newMon: MonitoredPaper = {
        id: paper.id,
        paper,
        initialCitationCount: paper.citationCount ?? 0,
        latestCitationCount: paper.citationCount ?? 0,
        totalNewCitations: 0,
        trackedSince: Date.now(),
        lastCheckedAt: Date.now(),
        history: [
          {
            timestamp: Date.now(),
            count: paper.citationCount ?? 0,
            delta: 0,
            sourceQuery: currentTopic || 'Initial selection',
            note: 'Tracking initiated',
          },
        ],
        status: 'active',
      };
      return [newMon, ...prev];
    });
  };

  // Citation Monitor: Bulk track all currently selected papers
  const handleTrackSelectedPapers = () => {
    const selectedList = papers.filter((p) => selectedPaperIds.has(p.id));
    if (selectedList.length === 0) return;

    setMonitoredPapers((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const toAdd: MonitoredPaper[] = [];

      for (const paper of selectedList) {
        if (!existingIds.has(paper.id)) {
          toAdd.push({
            id: paper.id,
            paper,
            initialCitationCount: paper.citationCount ?? 0,
            latestCitationCount: paper.citationCount ?? 0,
            totalNewCitations: 0,
            trackedSince: Date.now(),
            lastCheckedAt: Date.now(),
            history: [
              {
                timestamp: Date.now(),
                count: paper.citationCount ?? 0,
                delta: 0,
                sourceQuery: currentTopic || 'Bulk selection',
                note: 'Tracked from selection',
              },
            ],
            status: 'active',
          });
        }
      }

      return [...toAdd, ...prev];
    });
  };

  // Citation Monitor: Stop tracking a paper
  const handleUntrackPaper = (paperId: string) => {
    setMonitoredPapers((prev) => prev.filter((p) => p.id !== paperId));
  };

  // Citation Monitor: Bulk untrack multiple papers in a single click
  const handleBulkUntrackPapers = (paperIds: string[]) => {
    const toRemove = new Set(paperIds);
    setMonitoredPapers((prev) => prev.filter((p) => !toRemove.has(p.id)));
  };

  // Citation Monitor: Track top search papers
  const handleAddTopSearchPapersToMonitor = () => {
    const topPapers = papers.slice(0, 3);
    if (topPapers.length === 0) return;

    setMonitoredPapers((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const toAdd: MonitoredPaper[] = [];

      for (const paper of topPapers) {
        if (!existingIds.has(paper.id)) {
          toAdd.push({
            id: paper.id,
            paper,
            initialCitationCount: paper.citationCount ?? 0,
            latestCitationCount: paper.citationCount ?? 0,
            totalNewCitations: 0,
            trackedSince: Date.now(),
            lastCheckedAt: Date.now(),
            history: [
              {
                timestamp: Date.now(),
                count: paper.citationCount ?? 0,
                delta: 0,
                sourceQuery: currentTopic || 'Top results',
                note: 'Tracked from top search results',
              },
            ],
            status: 'active',
          });
        }
      }

      return [...toAdd, ...prev];
    });
  };

  // Citation Monitor: Live scan of academic indices for all monitored papers
  const handleCheckCitations = async () => {
    if (monitoredPapers.length === 0) return;
    setIsCheckingCitations(true);

    try {
      const payload = monitoredPapers.map((m) => ({
        id: m.id,
        doi: m.paper.doi,
        title: m.paper.title,
        currentCount: m.latestCitationCount,
      }));

      const res = await fetch('/api/check-citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ papers: payload }),
      });

      if (!res.ok) throw new Error('Failed to check citation counts');

      const { updates } = await res.json();
      if (!Array.isArray(updates)) return;

      const newAlerts: CitationAlert[] = [];
      const updated = monitoredPapers.map((mon) => {
        const found = updates.find((u: any) => u.id === mon.id);
        if (
          found &&
          typeof found.citationCount === 'number' &&
          found.citationCount > mon.latestCitationCount
        ) {
          const delta = found.citationCount - mon.latestCitationCount;
          const alert: CitationAlert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            paperId: mon.id,
            paperTitle: mon.paper.title,
            previousCount: mon.latestCitationCount,
            newCount: found.citationCount,
            delta,
            timestamp: Date.now(),
            searchTopic: 'Manual Index Verification',
            read: false,
          };
          newAlerts.push(alert);

          return {
            ...mon,
            latestCitationCount: found.citationCount,
            totalNewCitations: mon.totalNewCitations + delta,
            lastCheckedAt: Date.now(),
            lastDiscoveryAt: Date.now(),
            history: [
              {
                timestamp: Date.now(),
                count: found.citationCount,
                delta,
                sourceQuery: 'Live Index Refresh',
                note: `Discovered +${delta} citations via ${found.source}`,
              },
              ...mon.history,
            ],
          };
        }

        return {
          ...mon,
          lastCheckedAt: Date.now(),
        };
      });

      setMonitoredPapers(updated);

      if (newAlerts.length > 0) {
        setCitationAlerts((prev) => [...newAlerts, ...prev]);
        setRecentCitationAlert(newAlerts[0]);
      }
    } catch (err) {
      console.error('Check citations error:', err);
    } finally {
      setIsCheckingCitations(false);
    }
  };

  // Citation Monitor: Simulation trigger for interactive testing & verification
  const handleSimulateCitationDiscovery = (targetPaperId?: string) => {
    if (monitoredPapers.length === 0) return;

    const target = targetPaperId
      ? monitoredPapers.find((p) => p.id === targetPaperId)
      : monitoredPapers[0];

    if (!target) return;

    const delta = Math.floor(Math.random() * 2) + 1; // 1 or 2 new citations
    const freshCount = target.latestCitationCount + delta;

    const alert: CitationAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      paperId: target.id,
      paperTitle: target.paper.title,
      previousCount: target.latestCitationCount,
      newCount: freshCount,
      delta,
      timestamp: Date.now(),
      searchTopic: currentTopic || 'Simulation Test',
      read: false,
    };

    setMonitoredPapers((prev) =>
      prev.map((mon) => {
        if (mon.id !== target.id) return mon;
        return {
          ...mon,
          latestCitationCount: freshCount,
          totalNewCitations: mon.totalNewCitations + delta,
          lastCheckedAt: Date.now(),
          lastDiscoveryAt: Date.now(),
          history: [
            {
              timestamp: Date.now(),
              count: freshCount,
              delta,
              sourceQuery: currentTopic || 'Simulation Test',
              note: `Simulated discovery of +${delta} new citations`,
            },
            ...mon.history,
          ],
        };
      })
    );

    setCitationAlerts((prev) => [alert, ...prev]);
    setRecentCitationAlert(alert);
  };

  const handleMarkAllAlertsRead = () => {
    setCitationAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleClearAlerts = () => {
    setCitationAlerts([]);
  };

  // Single paper AI summary generator
  const handleGenerateSummary = async (paper: AcademicPaper) => {
    if (summaryCache[paper.id]) return;

    setIsLoadingSummary(true);
    try {
      const res = await fetch('/api/summarize-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper,
          topic: currentTopic,
          keywords: currentKeywords,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate summary.');

      const summaryData: PaperSummary = await res.json();
      setSummaryCache((prev) => ({ ...prev, [paper.id]: summaryData }));
    } catch (err: any) {
      console.error('Summary error:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Open paper detail view
  const handleOpenDetail = (paper: AcademicPaper) => {
    setActiveDetailPaper(paper);
    if (!summaryCache[paper.id]) {
      handleGenerateSummary(paper);
    }
  };

  // Open paper detail by title (used in Research Gaps view)
  const handleOpenDetailByTitle = (title: string) => {
    const found = papers.find(
      (p) => p.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
    if (found) {
      handleOpenDetail(found);
    }
  };

  // Run Multi-Paper Comparison
  const handleRunComparison = async () => {
    const selectedList = papers.filter((p) => selectedPaperIds.has(p.id));
    if (selectedList.length < 2) return;

    setIsLoadingComparison(true);
    setCurrentTab('compare');

    try {
      const res = await fetch('/api/compare-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          papers: selectedList,
          topic: currentTopic,
          keywords: currentKeywords,
        }),
      });

      if (!res.ok) throw new Error('Comparison failed.');

      const data: PaperComparison = await res.json();
      setComparisonResult(data);
    } catch (err: any) {
      console.error('Compare error:', err);
    } finally {
      setIsLoadingComparison(false);
    }
  };

  // Run Research Gaps Synthesis
  const handleAnalyzeResearchGaps = async () => {
    const targetPapers =
      selectedPaperIds.size >= 2
        ? papers.filter((p) => selectedPaperIds.has(p.id))
        : papers;

    if (targetPapers.length === 0) return;

    setIsLoadingGaps(true);
    setCurrentTab('gaps');

    try {
      const res = await fetch('/api/research-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          papers: targetPapers,
          topic: currentTopic,
          keywords: currentKeywords,
        }),
      });

      if (!res.ok) throw new Error('Gap analysis failed.');

      const data = await res.json();
      setResearchGaps(data.gaps || []);
    } catch (err: any) {
      console.error('Gaps error:', err);
    } finally {
      setIsLoadingGaps(false);
    }
  };

  // Reset to initial research composer
  const handleNewResearch = () => {
    setCurrentTab('search');
    setHasSearched(false);
    setPapers([]);
    setSearchResponse(null);
    setSelectedPaperIds(new Set());
    setActiveDetailPaper(null);
  };

  // Filtered & Sorted Papers
  const filteredPapers = useMemo(() => {
    let result = [...papers];

    if (onlyOpenAccess) {
      result = result.filter((p) => p.isOpenAccess);
    }

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.authors.some((a) => a.toLowerCase().includes(q)) ||
          p.abstract.toLowerCase().includes(q) ||
          (p.venue && p.venue.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'citations') {
      result.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else {
      result.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    return result;
  }, [papers, filterQuery, sortBy, onlyOpenAccess]);

  const selectedPapersList = useMemo(() => {
    return papers.filter((p) => selectedPaperIds.has(p.id));
  }, [papers, selectedPaperIds]);

  // Aggregate export payload for comparative synthesis and research gaps
  const reportExportData: ReportExportData = useMemo(() => {
    const exportCorpus = selectedPapersList.length > 0 ? selectedPapersList : papers;
    return {
      topic: currentTopic,
      keywords: currentKeywords,
      papers: exportCorpus,
      comparison: comparisonResult,
      gaps: researchGaps,
    };
  }, [currentTopic, currentKeywords, selectedPapersList, papers, comparisonResult, researchGaps]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans antialiased">
      {/* LEFT SIDEBAR (Desktop & Mobile Drawer) */}
      <div
        className={`${
          isMobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden md:flex'
        }`}
      >
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          onNewResearch={handleNewResearch}
          savedCount={savedPapers.length}
          historyCount={history.length}
          selectedCompareCount={selectedPaperIds.size}
          monitoredCount={monitoredPapers.length}
          unreadCitationAlertsCount={unreadAlertCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenExportReport={() => setIsExportReportOpen(true)}
        />
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-neutral-950/70 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </div>

      {/* MAIN VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-neutral-950">
        {/* Top Header Bar for Mobile & Quick Status */}
        <header className="h-12 border-b border-neutral-850 flex items-center justify-between px-4 shrink-0 bg-neutral-950/90 text-xs text-neutral-400">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden rounded p-1 text-neutral-400 hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </button>

            {hasSearched && currentTab === 'search' && (
              <div className="flex items-center gap-2 truncate max-w-sm sm:max-w-md">
                <span className="font-semibold text-neutral-300">Topic:</span>
                <span className="text-neutral-100 truncate font-medium">{currentTopic}</span>
              </div>
            )}

            {currentTab === 'history' && (
              <span className="font-semibold text-neutral-200">Search History</span>
            )}
            {currentTab === 'saved' && (
              <span className="font-semibold text-neutral-200">Saved Papers Library</span>
            )}
            {currentTab === 'compare' && (
              <span className="font-semibold text-neutral-200">Comparative Workspace</span>
            )}
            {currentTab === 'gaps' && (
              <span className="font-semibold text-neutral-200">Research Gaps Explorer</span>
            )}
            {currentTab === 'monitor' && (
              <span className="font-semibold text-neutral-200">Citation Monitor</span>
            )}
          </div>

          {/* Right Header Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* Citation Monitor Alerts Dropdown */}
            <CitationAlertsDropdown
              alerts={citationAlerts}
              unreadCount={unreadAlertCount}
              isOpen={isAlertsDropdownOpen}
              onToggle={() => setIsAlertsDropdownOpen(!isAlertsDropdownOpen)}
              onClose={() => setIsAlertsDropdownOpen(false)}
              onMarkAllRead={handleMarkAllAlertsRead}
              onClearAlerts={handleClearAlerts}
              onSelectAlert={(alert) => {
                const found =
                  papers.find((p) => p.id === alert.paperId) ||
                  monitoredPapers.find((m) => m.id === alert.paperId)?.paper;
                if (found) handleOpenDetail(found);
                else setCurrentTab('monitor');
              }}
              onOpenMonitor={() => setCurrentTab('monitor')}
            />

            {papers.length > 0 && (
              <button
                onClick={() => setIsExportReportOpen(true)}
                title="Export Research Synthesis & Gaps (Markdown / PDF)"
                className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors cursor-pointer"
              >
                <FileDown className="h-3.5 w-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Export Report</span>
              </button>
            )}

            {selectedPaperIds.size >= 2 && currentTab !== 'compare' && (
              <button
                onClick={handleRunComparison}
                className="flex items-center gap-1 rounded bg-neutral-850 border border-neutral-750 px-2.5 py-1 text-xs font-medium text-neutral-200 hover:bg-neutral-800 transition-colors"
              >
                <GitCompare className="h-3 w-3" />
                <span>Compare ({selectedPaperIds.size})</span>
              </button>
            )}

            <button
              onClick={() => setIsBibtexOpen(true)}
              className="rounded p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Export BibTeX"
            >
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Main Body based on Tab */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* TAB 1: SEARCH / RESULTS VIEW */}
          {currentTab === 'search' && (
            <>
              {!hasSearched && !isSearching ? (
                /* Initial Centered Search Composer */
                <SearchComposer
                  onSearch={handleExecuteSearch}
                  isLoading={isSearching}
                  initialTopic={currentTopic}
                  initialKeywords={currentKeywords}
                />
              ) : (
                /* Search Results View */
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Compact Header Search Composer */}
                  <SearchComposer
                    compact
                    onSearch={handleExecuteSearch}
                    isLoading={isSearching}
                    initialTopic={currentTopic}
                    initialKeywords={currentKeywords}
                  />

                  {/* Top Bar for Results: count, query, view mode, sort & filter */}
                  <div className="border-b border-neutral-850 px-6 py-3 bg-neutral-950 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-neutral-100 text-sm">
                        Research results
                      </span>
                      <span className="font-mono text-neutral-400 text-xs">
                        ({filteredPapers.length} {filteredPapers.length === 1 ? 'paper' : 'papers'})
                      </span>

                      {/* View Switcher: List vs Citation Graph */}
                      <div className="flex items-center rounded border border-neutral-800 bg-neutral-900 p-0.5 ml-2">
                        <button
                          onClick={() => setResultsViewMode('list')}
                          className={`rounded px-2 py-0.5 font-medium transition-colors ${
                            resultsViewMode === 'list'
                              ? 'bg-neutral-800 text-neutral-100'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          List
                        </button>
                        <button
                          onClick={() => setResultsViewMode('graph')}
                          className={`rounded px-2 py-0.5 font-medium transition-colors ${
                            resultsViewMode === 'graph'
                              ? 'bg-neutral-800 text-neutral-100'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          Citation Graph
                        </button>
                      </div>

                      {/* Select All Checkbox */}
                      {filteredPapers.length > 0 && resultsViewMode === 'list' && (
                        <button
                          onClick={handleSelectAll}
                          className="text-neutral-400 hover:text-neutral-200 transition-colors ml-2 hidden sm:inline"
                        >
                          {selectedPaperIds.size === filteredPapers.length
                            ? 'Deselect All'
                            : 'Select All'}
                        </button>
                      )}
                    </div>

                    {/* Filter & Sort Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Filter Search Input */}
                      <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="Filter results..."
                        className="w-36 sm:w-48 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                      />

                      {/* Open Access Filter */}
                      <label className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 cursor-pointer select-none text-[11px]">
                        <input
                          type="checkbox"
                          checked={onlyOpenAccess}
                          onChange={(e) => setOnlyOpenAccess(e.target.checked)}
                          className="h-3 w-3 rounded text-neutral-100 focus:ring-0"
                        />
                        <span>Open Access</span>
                      </label>

                      {/* Sort Dropdown */}
                      <div className="flex items-center gap-1 text-neutral-400">
                        <span className="text-neutral-500">Sort:</span>
                        <select
                          value={sortBy}
                          onChange={(e: any) => setSortBy(e.target.value)}
                          className="rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-neutral-200 focus:outline-none"
                        >
                          <option value="relevance">Relevance</option>
                          <option value="citations">Citations</option>
                          <option value="newest">Year</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Main Content: List of Papers or D3 Citation Graph */}
                  <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
                    {/* Error Notice */}
                    {errorMessage && (
                      <div className="mb-4 rounded-md border border-neutral-800 bg-neutral-900/60 p-3 text-xs text-neutral-300 flex items-center justify-between">
                        <span>{errorMessage}</span>
                        <button
                          onClick={() => setErrorMessage(null)}
                          className="text-neutral-400 hover:text-white underline text-[11px]"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}

                    {isSearching ? (
                      <LoadingIndicator type="search" />
                    ) : filteredPapers.length === 0 ? (
                      <div className="py-20 text-center rounded-lg border border-dashed border-neutral-850 p-6 space-y-2">
                        <Search className="h-6 w-6 text-neutral-600 mx-auto" />
                        <h2 className="text-sm font-medium text-neutral-300">
                          No research papers found
                        </h2>
                        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                          Try adjusting search terms, broadening the publication date range, or exploring related keywords.
                        </p>
                      </div>
                    ) : resultsViewMode === 'graph' ? (
                      <CitationGraph
                        papers={filteredPapers}
                        selectedPaperIds={selectedPaperIds}
                        savedPaperIds={new Set(savedPapers.map((p) => p.id))}
                        monitoredPaperIds={monitoredPaperIds}
                        onToggleSelect={handleToggleSelectPaper}
                        onToggleSave={handleToggleSavePaper}
                        onToggleMonitor={handleToggleMonitorPaper}
                        onSummarize={handleOpenDetail}
                      />
                    ) : (
                      <div className="divide-y divide-neutral-850/80 border-t border-b border-neutral-850">
                        {filteredPapers.map((paper) => (
                          <PaperResultItem
                            key={paper.id}
                            paper={paper}
                            isSelected={selectedPaperIds.has(paper.id)}
                            isSaved={savedPapers.some((p) => p.id === paper.id)}
                            isMonitored={monitoredPaperIds.has(paper.id)}
                            onSelect={() => handleToggleSelectPaper(paper.id)}
                            onToggleSave={() => handleToggleSavePaper(paper)}
                            onToggleMonitor={() => handleToggleMonitorPaper(paper)}
                            onOpenDetail={() => handleOpenDetail(paper)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: SEARCH HISTORY VIEW */}
          {currentTab === 'history' && (
            <SearchHistoryView
              history={history}
              onSelectHistory={handleRestoreHistory}
              onClearHistory={() => setHistory([])}
              onDeleteHistoryItem={(id) => setHistory((prev) => prev.filter((h) => h.id !== id))}
            />
          )}

          {/* TAB 3: SAVED PAPERS LIBRARY VIEW */}
          {currentTab === 'saved' && (
            <SavedPapersView
              savedPapers={savedPapers}
              onRemoveSaved={(id) => setSavedPapers((prev) => prev.filter((p) => p.id !== id))}
              onClearAll={() => setSavedPapers([])}
              onOpenDetail={handleOpenDetail}
              onCompareAll={() => {
                setSelectedPaperIds(new Set(savedPapers.map((p) => p.id)));
                handleRunComparison();
              }}
            />
          )}

          {/* TAB 4: COMPARE PAPERS WORKSPACE */}
          {currentTab === 'compare' && (
            <CompareView
              papers={selectedPapersList}
              allPapers={papers}
              comparison={comparisonResult}
              isLoading={isLoadingComparison}
              onRemovePaper={handleToggleSelectPaper}
              onAddPaper={(p) => handleToggleSelectPaper(p.id)}
              onRunComparison={handleRunComparison}
              onOpenDetail={handleOpenDetail}
              activeTopic={currentTopic}
              onOpenExport={() => setIsExportReportOpen(true)}
            />
          )}

          {/* TAB 5: RESEARCH GAPS VIEW */}
          {currentTab === 'gaps' && (
            <ResearchGapsView
              papers={papers}
              gaps={researchGaps}
              isLoading={isLoadingGaps}
              onAnalyzeGaps={handleAnalyzeResearchGaps}
              onOpenPaperDetail={handleOpenDetailByTitle}
              activeTopic={currentTopic}
              onOpenExport={() => setIsExportReportOpen(true)}
            />
          )}

          {/* TAB 6: CITATION MONITOR VIEW */}
          {currentTab === 'monitor' && (
            <CitationMonitorView
              monitoredPapers={monitoredPapers}
              alerts={citationAlerts}
              unreadAlertCount={unreadAlertCount}
              isChecking={isCheckingCitations}
              onCheckCitations={handleCheckCitations}
              onSimulateCitationDiscovery={handleSimulateCitationDiscovery}
              onUntrackPaper={handleUntrackPaper}
              onBulkUntrackPapers={handleBulkUntrackPapers}
              onOpenPaperDetail={handleOpenDetail}
              onMarkAllAlertsRead={handleMarkAllAlertsRead}
              onClearAlerts={handleClearAlerts}
              onAddFromSearchPapers={handleAddTopSearchPapersToMonitor}
              availableSearchPapersCount={papers.length}
            />
          )}
        </div>
      </div>

      {/* Floating Bottom Compare & Monitor Action Ribbon (when 2+ selected & in list view) */}
      {selectedPaperIds.size >= 2 && currentTab === 'search' && !activeDetailPaper && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-3 rounded-xl border border-neutral-750 bg-neutral-900/95 px-4 py-2.5 shadow-2xl backdrop-blur-md text-xs">
            <span className="font-mono text-neutral-300 font-semibold">
              {selectedPaperIds.size} papers selected
            </span>
            <div className="h-3 w-px bg-neutral-800" />
            <button
              onClick={handleRunComparison}
              className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1 font-semibold text-neutral-950 hover:bg-white transition-colors cursor-pointer"
            >
              <GitCompare className="h-3.5 w-3.5" />
              <span>Compare</span>
            </button>
            <button
              onClick={handleTrackSelectedPapers}
              className="flex items-center gap-1.5 rounded-md border border-neutral-750 bg-neutral-800 px-3 py-1 font-medium text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
              title="Track citations for selected papers in Citation Monitor"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Monitor Citations ({selectedPaperIds.size})</span>
            </button>
            <button
              onClick={() => setSelectedPaperIds(new Set())}
              className="text-neutral-500 hover:text-neutral-300 ml-1 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* FOCUSED PAPER DETAIL / READING VIEW */}
      {activeDetailPaper && (
        <PaperDetailView
          paper={activeDetailPaper}
          summary={summaryCache[activeDetailPaper.id] || null}
          isLoadingSummary={isLoadingSummary}
          onGenerateSummary={handleGenerateSummary}
          isSelected={selectedPaperIds.has(activeDetailPaper.id)}
          isSaved={savedPapers.some((p) => p.id === activeDetailPaper.id)}
          isMonitored={monitoredPaperIds.has(activeDetailPaper.id)}
          onToggleSelect={() => handleToggleSelectPaper(activeDetailPaper.id)}
          onToggleSave={() => handleToggleSavePaper(activeDetailPaper)}
          onToggleMonitor={() => handleToggleMonitorPaper(activeDetailPaper)}
          onClose={() => setActiveDetailPaper(null)}
          activeTopic={currentTopic}
        />
      )}

      {/* CITATION ALERT NOTIFICATION TOAST */}
      <CitationAlertToast
        alert={recentCitationAlert}
        onDismiss={() => setRecentCitationAlert(null)}
        onOpenMonitor={() => setCurrentTab('monitor')}
      />

      {/* GROUNDED RESEARCH CHAT DRAWER */}
      <PaperChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        papers={papers}
        activeTopic={currentTopic}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultLimit={defaultLimit}
        onChangeDefaultLimit={setDefaultLimit}
        onClearSessionCache={() => {
          setSummaryCache({});
          setComparisonResult(null);
          setResearchGaps([]);
        }}
      />

      {/* BIBTEX EXPORT MODAL */}
      {isBibtexOpen && (
        <BibTeXModal
          papers={selectedPapersList.length > 0 ? selectedPapersList : papers}
          onClose={() => setIsBibtexOpen(false)}
        />
      )}

      {/* RESEARCH SYNTHESIS & GAPS EXPORT MODAL */}
      <ExportReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
        data={reportExportData}
      />
    </div>
  );
}
