import React from 'react';
import {
  Search,
  Plus,
  History,
  Bookmark,
  GitCompare,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass,
  MessageSquare,
  Share2,
  FileDown,
  Activity,
} from 'lucide-react';

export type NavigationTab = 'search' | 'history' | 'saved' | 'compare' | 'gaps' | 'monitor';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onNewResearch: () => void;
  savedCount: number;
  historyCount: number;
  selectedCompareCount: number;
  monitoredCount?: number;
  unreadCitationAlertsCount?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSettings: () => void;
  onOpenChat: () => void;
  onOpenExportReport?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNewResearch,
  savedCount,
  historyCount,
  selectedCompareCount,
  monitoredCount = 0,
  unreadCitationAlertsCount = 0,
  isCollapsed,
  onToggleCollapse,
  onOpenSettings,
  onOpenChat,
  onOpenExportReport,
}) => {
  const navItems = [
    {
      id: 'search' as NavigationTab,
      label: 'New Research',
      icon: Plus,
      badge: null,
      onClick: onNewResearch,
    },
    {
      id: 'monitor' as NavigationTab,
      label: 'Citation Monitor',
      icon: Activity,
      badge:
        unreadCitationAlertsCount > 0
          ? `+${unreadCitationAlertsCount}`
          : monitoredCount > 0
          ? monitoredCount
          : null,
      onClick: () => onSelectTab('monitor'),
    },
    {
      id: 'saved' as NavigationTab,
      label: 'Saved Papers',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null,
      onClick: () => onSelectTab('saved'),
    },
    {
      id: 'compare' as NavigationTab,
      label: 'Compare',
      icon: GitCompare,
      badge: selectedCompareCount > 0 ? selectedCompareCount : null,
      onClick: () => onSelectTab('compare'),
    },
    {
      id: 'gaps' as NavigationTab,
      label: 'Research Gaps',
      icon: Sparkles,
      badge: null,
      onClick: () => onSelectTab('gaps'),
    },
    {
      id: 'history' as NavigationTab,
      label: 'Search History',
      icon: History,
      badge: historyCount > 0 ? historyCount : null,
      onClick: () => onSelectTab('history'),
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-neutral-800/80 bg-neutral-950 transition-all duration-200 select-none z-30 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header / Wordmark */}
      <div className="flex h-14 items-center justify-between px-3.5 border-b border-neutral-850">
        {!isCollapsed ? (
          <div
            onClick={onNewResearch}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-950 font-semibold shadow-sm">
              <Compass className="h-4 w-4 text-neutral-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-neutral-100">
                PaperPilot
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={onNewResearch}
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-950 font-semibold hover:bg-white transition-colors"
            title="PaperPilot - New Research"
          >
            <Compass className="h-4 w-4" />
          </button>
        )}

        {/* Toggle Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-neutral-850 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? 'text-neutral-100' : 'text-neutral-400'
                }`}
              />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                        isActive
                          ? 'bg-neutral-700 text-neutral-200'
                          : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}

        {/* Subtle separator */}
        <div className="my-2 border-t border-neutral-900 px-2" />

        {/* Export Synthesis Report button */}
        {onOpenExportReport && (
          <button
            onClick={onOpenExportReport}
            title={isCollapsed ? 'Export Research Report (MD / PDF)' : undefined}
            className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 transition-colors"
          >
            <FileDown className="h-4 w-4 shrink-0 text-neutral-400" />
            {!isCollapsed && (
              <div className="flex-1 text-left flex items-center justify-between">
                <span>Export Report</span>
                <span className="text-[10px] text-neutral-500 font-mono">MD/PDF</span>
              </div>
            )}
          </button>
        )}

        {/* Interactive grounded Q&A button */}
        <button
          onClick={onOpenChat}
          title={isCollapsed ? 'Ask PaperPilot AI' : undefined}
          className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 transition-colors"
        >
          <MessageSquare className="h-4 w-4 shrink-0 text-neutral-400" />
          {!isCollapsed && (
            <div className="flex-1 text-left flex items-center justify-between">
              <span>Ask Assistant</span>
              <span className="text-[10px] text-neutral-500 font-mono">Q&A</span>
            </div>
          )}
        </button>
      </div>

      {/* Bottom Footer Actions */}
      <div className="border-t border-neutral-850 p-2 space-y-1">
        <button
          onClick={onOpenSettings}
          title={isCollapsed ? 'Settings' : undefined}
          className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 transition-colors"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Settings & Sources</span>}
        </button>
      </div>
    </aside>
  );
};
