import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { MonitoredPaper } from '../types/citationMonitor.ts';

interface CitationGrowthChartProps {
  monitoredPapers: MonitoredPaper[];
  onOpenPaperDetail?: (paper: any) => void;
  onSimulateDiscovery?: (paperId?: string) => void;
}

const COLOR_PALETTE = [
  '#10b981', // Emerald
  '#38bdf8', // Sky
  '#a855f7', // Purple
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#ec4899', // Pink
];

export const CitationGrowthChart: React.FC<CitationGrowthChartProps> = ({
  monitoredPapers,
  onOpenPaperDetail,
  onSimulateDiscovery,
}) => {
  const [metricMode, setMetricMode] = useState<'cumulative' | 'absolute'>('cumulative');
  const [visiblePaperIds, setVisiblePaperIds] = useState<Set<string>>(
    () => new Set(monitoredPapers.slice(0, 6).map((p) => p.id))
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Keep visiblePaperIds synced if papers change and nothing was selected
  React.useEffect(() => {
    setVisiblePaperIds((prev) => {
      if (prev.size === 0 && monitoredPapers.length > 0) {
        return new Set(monitoredPapers.slice(0, 6).map((p) => p.id));
      }
      return prev;
    });
  }, [monitoredPapers]);

  // Color mapping per paper
  const paperColors = useMemo(() => {
    const map = new Map<string, string>();
    monitoredPapers.forEach((paper, idx) => {
      map.set(paper.id, COLOR_PALETTE[idx % COLOR_PALETTE.length]);
    });
    return map;
  }, [monitoredPapers]);

  // Total discovery events across all papers
  const totalEvents = useMemo(() => {
    return monitoredPapers.reduce((acc, p) => acc + Math.max(0, p.history.length - 1), 0);
  }, [monitoredPapers]);

  // Format timestamp helper
  const formatTimeLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  };

  // Build unified chronological timeline data for Recharts
  const chartData = useMemo(() => {
    if (monitoredPapers.length === 0) return [];

    // Gather all unique timestamps from all papers' histories
    const timestampSet = new Set<number>();
    monitoredPapers.forEach((paper) => {
      paper.history.forEach((h) => timestampSet.add(h.timestamp));
    });

    const sortedTimestamps = Array.from(timestampSet).sort((a, b) => a - b);

    // If only 1 single timestamp exists in the entire dataset, create a simulated prior point (5 min ago)
    // so Recharts can render an informative line rather than a single point in space
    const timestampsToUse = [...sortedTimestamps];
    if (timestampsToUse.length === 1) {
      timestampsToUse.unshift(timestampsToUse[0] - 60000 * 5);
    }

    return timestampsToUse.map((time) => {
      const dataPoint: Record<string, any> = {
        timestamp: time,
        timeFormatted: formatTimeLabel(time),
        dateFormatted: formatDateLabel(time),
      };

      monitoredPapers.forEach((paper) => {
        // Find latest history entry up to this time
        const pastEntries = paper.history.filter((h) => h.timestamp <= time);
        if (pastEntries.length > 0) {
          const latest = pastEntries[pastEntries.length - 1];
          if (metricMode === 'cumulative') {
            dataPoint[paper.id] = Math.max(0, latest.count - paper.initialCitationCount);
          } else {
            dataPoint[paper.id] = latest.count;
          }
          dataPoint[`${paper.id}_raw`] = latest.count;
          dataPoint[`${paper.id}_gain`] = Math.max(0, latest.count - paper.initialCitationCount);
        } else {
          // Paper was not yet monitored at this historical timestamp
          if (metricMode === 'cumulative') {
            dataPoint[paper.id] = 0;
          } else {
            dataPoint[paper.id] = paper.initialCitationCount;
          }
          dataPoint[`${paper.id}_raw`] = paper.initialCitationCount;
          dataPoint[`${paper.id}_gain`] = 0;
        }
      });

      return dataPoint;
    });
  }, [monitoredPapers, metricMode]);

  const togglePaperVisibility = (id: string) => {
    setVisiblePaperIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id); // Keep at least one visible
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const showAllPapers = () => {
    setVisiblePaperIds(new Set(monitoredPapers.map((p) => p.id)));
  };

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const dataObj = payload[0]?.payload;
    if (!dataObj) return null;

    return (
      <div className="rounded-lg border border-neutral-750 bg-neutral-900/95 p-3 shadow-xl backdrop-blur-md text-xs max-w-sm">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 mb-2 text-[11px] text-neutral-400 font-mono">
          <span>{dataObj.dateFormatted}</span>
          <span>{dataObj.timeFormatted}</span>
        </div>

        <div className="space-y-1.5">
          {payload.map((item: any) => {
            const paper = monitoredPapers.find((p) => p.id === item.dataKey);
            if (!paper) return null;

            const color = item.color;
            const currentVal = item.value;
            const rawCount = dataObj[`${paper.id}_raw`];
            const gain = dataObj[`${paper.id}_gain`];

            return (
              <div key={paper.id} className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate text-neutral-200 font-medium" title={paper.paper.title}>
                    {paper.paper.title}
                  </span>
                </div>
                <div className="text-right shrink-0 font-mono">
                  {metricMode === 'cumulative' ? (
                    <span className="text-emerald-400 font-semibold">+{gain} new</span>
                  ) : (
                    <span className="text-neutral-100 font-semibold">{rawCount} citations</span>
                  )}
                  {metricMode === 'cumulative' && (
                    <span className="text-neutral-500 text-[10px] block">
                      ({rawCount} total)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (monitoredPapers.length === 0) return null;

  return (
    <div className="rounded-xl border border-neutral-850 bg-neutral-900/40 p-4 transition-colors">
      {/* Chart Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-semibold text-neutral-100">
                Citation Trajectory & Growth Over Time
              </h2>
              {totalEvents > 0 && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  {totalEvents} discovery {totalEvents === 1 ? 'event' : 'events'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              Interactive timeline tracking citation evolution across monitored publications.
            </p>
          </div>
        </div>

        {/* Header Controls: Metric Switcher & Collapse */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-md border border-neutral-800 bg-neutral-900 p-0.5 text-xs">
            <button
              onClick={() => setMetricMode('cumulative')}
              className={`rounded px-2.5 py-1 font-medium transition-colors cursor-pointer text-[11px] ${
                metricMode === 'cumulative'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Show new citations gained (+Δ) since tracking began"
            >
              Net Growth (+Δ)
            </button>
            <button
              onClick={() => setMetricMode('absolute')}
              className={`rounded px-2.5 py-1 font-medium transition-colors cursor-pointer text-[11px] ${
                metricMode === 'absolute'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Show total absolute citation counts over time"
            >
              Total Citations
            </button>
          </div>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand citation chart' : 'Collapse citation chart'}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-4 space-y-4">
          {/* Recharts LineChart Visualization */}
          <div className="w-full h-64 sm:h-72 rounded-lg border border-neutral-850/80 bg-neutral-950/60 p-2 sm:p-3 relative">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                No citation trajectory data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 12, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.6} />
                  <XAxis
                    dataKey="timeFormatted"
                    stroke="#525252"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#404040' }}
                  />
                  <YAxis
                    stroke="#525252"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#404040' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Render Lines for Visible Papers */}
                  {monitoredPapers
                    .filter((p) => visiblePaperIds.has(p.id))
                    .map((paper) => {
                      const color = paperColors.get(paper.id) || '#10b981';
                      return (
                        <Line
                          key={paper.id}
                          type="monotone"
                          dataKey={paper.id}
                          stroke={color}
                          strokeWidth={2}
                          dot={{ r: 3, fill: color, stroke: '#0a0a0a', strokeWidth: 1.5 }}
                          activeDot={{ r: 5, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
                          isAnimationActive={true}
                        />
                      );
                    })}
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* Quick helper badge if only initial baseline points exist */}
            {totalEvents === 0 && onSimulateDiscovery && (
              <div className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/90 px-2 py-1 text-[11px] text-neutral-400 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                <span>Baseline recorded.</span>
                <button
                  onClick={() => onSimulateDiscovery()}
                  className="text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer ml-1"
                >
                  Simulate Discovery
                </button>
              </div>
            )}
          </div>

          {/* Interactive Legend & Paper Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Toggle Series:
              </span>
              {monitoredPapers.map((paper) => {
                const isVisible = visiblePaperIds.has(paper.id);
                const color = paperColors.get(paper.id) || '#10b981';

                return (
                  <button
                    key={paper.id}
                    onClick={() => togglePaperVisibility(paper.id)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-all cursor-pointer border ${
                      isVisible
                        ? 'border-neutral-750 bg-neutral-900 text-neutral-200'
                        : 'border-neutral-850 bg-neutral-950/60 text-neutral-500 opacity-60 hover:opacity-90'
                    }`}
                    title={
                      isVisible
                        ? `Hide ${paper.paper.title}`
                        : `Show ${paper.paper.title}`
                    }
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: isVisible ? color : '#525252' }}
                    />
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">
                      {paper.paper.title}
                    </span>
                    {paper.totalNewCitations > 0 && (
                      <span className="font-mono text-emerald-400 text-[10px]">
                        +{paper.totalNewCitations}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {visiblePaperIds.size < monitoredPapers.length && (
              <button
                onClick={showAllPapers}
                className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
