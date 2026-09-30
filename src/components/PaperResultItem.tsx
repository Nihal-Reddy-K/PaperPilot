import React from 'react';
import {
  ExternalLink,
  Sparkles,
  Bookmark,
  GitCompare,
  FileText,
  Download,
  Quote,
  Activity,
} from 'lucide-react';
import type { AcademicPaper } from '../types/paper.ts';

interface PaperResultItemProps {
  paper: AcademicPaper;
  isSelected: boolean;
  isSaved: boolean;
  isMonitored?: boolean;
  onSelect: () => void;
  onToggleSave: () => void;
  onToggleMonitor?: () => void;
  onOpenDetail: () => void;
}

export const PaperResultItem: React.FC<PaperResultItemProps> = ({
  paper,
  isSelected,
  isSaved,
  isMonitored = false,
  onSelect,
  onToggleSave,
  onToggleMonitor,
  onOpenDetail,
}) => {
  const authorsString = paper.authors.join(', ');
  const displayAuthors =
    paper.authors.length > 3
      ? `${paper.authors.slice(0, 3).join(', ')} et al.`
      : authorsString || 'Unknown Authors';

  const snippet = paper.abstract
    ? paper.abstract.length > 220
      ? paper.abstract.slice(0, 220) + '…'
      : paper.abstract
    : 'No abstract text available for this publication record.';

  return (
    <article
      className={`group relative border-b border-neutral-850/80 px-4 py-4 transition-colors hover:bg-neutral-900/40 ${
        isSelected ? 'bg-neutral-900/60' : ''
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Subtle Checkbox for Multi-Select Comparison */}
        <div className="pt-0.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-900 text-neutral-100 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            title="Select for comparison"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-baseline justify-between gap-3">
            <h3
              onClick={onOpenDetail}
              className="text-sm font-medium text-neutral-100 hover:text-white cursor-pointer transition-colors leading-snug line-clamp-2"
            >
              {paper.title}
            </h3>

            {/* Subtle Relevance Metric (Non-flashy, muted) */}
            <span
              className="text-[11px] font-mono text-neutral-500 shrink-0 select-none"
              title={`Relevance score: ${paper.relevanceScore}%`}
            >
              {paper.relevanceScore}% rel
            </span>
          </div>

          {/* Metadata Byline: Authors · Venue · Year */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
            <span className="text-neutral-300">{displayAuthors}</span>
            {paper.venue && (
              <>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-400 truncate max-w-xs">{paper.venue}</span>
              </>
            )}
            {paper.year && (
              <>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-300 font-mono">{paper.year}</span>
              </>
            )}
            {paper.citationCount !== null && (
              <>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-400 font-mono">
                  {paper.citationCount} {paper.citationCount === 1 ? 'citation' : 'citations'}
                </span>
              </>
            )}
          </div>

          {/* Abstract Snippet */}
          <p
            onClick={onOpenDetail}
            className="mt-2 text-xs text-neutral-400 leading-relaxed font-['Newsreader'] line-clamp-2 cursor-pointer hover:text-neutral-300 transition-colors"
          >
            {snippet}
          </p>

          {/* Bottom Tags and Actions Row */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Metadata Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {paper.year && (
                <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 border border-neutral-800">
                  {paper.year}
                </span>
              )}
              <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] text-neutral-400 border border-neutral-800">
                {paper.source}
              </span>
              {paper.isOpenAccess && (
                <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] text-neutral-300 border border-neutral-800">
                  Open Access
                </span>
              )}
              {paper.fieldsOfStudy && paper.fieldsOfStudy.slice(0, 2).map((field, idx) => (
                <span
                  key={idx}
                  className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] text-neutral-400 border border-neutral-800 hidden sm:inline"
                >
                  {field}
                </span>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              {paper.sourceUrl && (
                <a
                  href={paper.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-200 flex items-center gap-1 transition-colors"
                >
                  <span>Open Paper</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              <button
                onClick={onOpenDetail}
                className="hover:text-neutral-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-neutral-400" />
                <span>Summarize</span>
              </button>

              <button
                onClick={onToggleSave}
                className={`hover:text-neutral-200 flex items-center gap-1 transition-colors cursor-pointer ${
                  isSaved ? 'text-neutral-200 font-medium' : ''
                }`}
              >
                <Bookmark className={`h-3 w-3 ${isSaved ? 'fill-neutral-200' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {onToggleMonitor && (
                <button
                  onClick={onToggleMonitor}
                  title={isMonitored ? 'Paper is tracked in Citation Monitor' : 'Track citations for this paper'}
                  className={`hover:text-neutral-200 flex items-center gap-1 transition-colors cursor-pointer ${
                    isMonitored ? 'text-emerald-400 font-medium' : ''
                  }`}
                >
                  <Activity className="h-3 w-3" />
                  <span>{isMonitored ? 'Tracking' : 'Monitor'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
