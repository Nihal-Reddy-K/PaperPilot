import React from 'react';
import {
  Compass,
  Bookmark,
  GitCompare,
  MessageSquareCode,
  FileText,
  Sparkles,
  ExternalLink,
  Share2,
  LayoutList,
} from 'lucide-react';

interface NavbarProps {
  selectedCount: number;
  savedCount: number;
  onOpenCompare: () => void;
  onOpenSaved: () => void;
  onOpenChat: () => void;
  onExportBibtex: () => void;
  activeTopic?: string;
  viewMode?: 'feed' | 'graph';
  onToggleViewMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCount,
  savedCount,
  onOpenCompare,
  onOpenSaved,
  onOpenChat,
  onExportBibtex,
  activeTopic,
  viewMode = 'feed',
  onToggleViewMode,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/20">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                Paper<span className="text-indigo-400">Pilot</span>
              </span>
              <span className="hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-300 sm:inline-block">
                AI RESEARCH ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Literature Discovery & Comparative Synthesis
            </p>
          </div>
        </div>

        {/* Center Topic Badge (if searching/viewing) */}
        {activeTopic && (
          <div className="hidden lg:flex items-center gap-2 max-w-md truncate rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1 text-xs text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-medium">Topic:</span>
            <span className="truncate font-semibold text-slate-200">{activeTopic}</span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Mode Switcher (Feed vs Graph) */}
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'graph'
                  ? 'border-indigo-500/60 bg-indigo-600/20 text-indigo-300 shadow-sm'
                  : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
              title={viewMode === 'graph' ? 'Switch to Card Feed' : 'Switch to Interactive Citation Graph'}
            >
              {viewMode === 'graph' ? (
                <>
                  <LayoutList className="h-4 w-4 text-indigo-400" />
                  <span className="hidden sm:inline">Feed View</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 text-indigo-400" />
                  <span className="hidden sm:inline">Citation Graph</span>
                </>
              )}
            </button>
          )}

          {/* Ask PaperPilot */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-850 hover:text-white transition-colors"
            title="Ask research questions grounded in retrieved papers"
          >
            <MessageSquareCode className="h-4 w-4 text-sky-400" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* BibTeX Export */}
          <button
            onClick={onExportBibtex}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-850 hover:text-white transition-colors"
            title="Export BibTeX citations"
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">BibTeX</span>
          </button>

          {/* Compare Papers Button */}
          <button
            onClick={onOpenCompare}
            disabled={selectedCount < 2}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              selectedCount >= 2
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 cursor-pointer animate-pulse'
                : 'border border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed'
            }`}
            title={selectedCount >= 2 ? 'Compare selected papers side-by-side' : 'Select at least 2 papers to compare'}
          >
            <GitCompare className="h-4 w-4" />
            <span>Compare</span>
            {selectedCount > 0 && (
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  selectedCount >= 2 ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {selectedCount}
              </span>
            )}
          </button>

          {/* Saved Papers / Library */}
          <button
            onClick={onOpenSaved}
            className="relative flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-850 hover:text-white transition-colors"
            title="View saved papers library"
          >
            <Bookmark className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Library</span>
            {savedCount > 0 && (
              <span className="ml-0.5 rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
