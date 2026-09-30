import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  Sparkles,
  Bookmark,
  Check,
  Quote,
  Copy,
  ChevronDown,
  ChevronUp,
  Download,
  BookOpen,
} from 'lucide-react';
import type { AcademicPaper } from '../types/paper.ts';
import { generateBibTeX } from '../utils/bibtex.ts';

interface PaperCardProps {
  paper: AcademicPaper;
  isSelected: boolean;
  isSaved: boolean;
  onToggleSelect: (paperId: string) => void;
  onToggleSave: (paper: AcademicPaper) => void;
  onSummarize: (paper: AcademicPaper) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  isSelected,
  isSaved,
  onToggleSelect,
  onToggleSave,
  onSummarize,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedBibtex, setCopiedBibtex] = useState(false);

  const handleCopyBibtex = (e: React.MouseEvent) => {
    e.stopPropagation();
    const bib = generateBibTeX(paper);
    navigator.clipboard.writeText(bib);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  const authorsString = paper.authors.join(', ');
  const displayAuthors =
    paper.authors.length > 3
      ? `${paper.authors.slice(0, 3).join(', ')} et al.`
      : authorsString || 'Unknown Authors';

  const isAbstractLong = paper.abstract && paper.abstract.length > 280;
  const abstractText = isExpanded || !isAbstractLong
    ? paper.abstract
    : `${paper.abstract.slice(0, 280)}...`;

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 ${
        isSelected
          ? 'border-indigo-500 bg-slate-900/95 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
          : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900/90'
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Top Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Source Badge */}
            <span
              className={`rounded-md px-2 py-0.5 font-medium ${
                paper.source === 'arXiv'
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  : paper.source === 'OpenAlex'
                  ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              }`}
            >
              {paper.source}
            </span>

            {/* Year */}
            {paper.year && (
              <span className="rounded-md border border-slate-700/80 bg-slate-800/80 px-2 py-0.5 font-semibold text-slate-300">
                {paper.year}
              </span>
            )}

            {/* Citations Count */}
            {paper.citationCount !== null && (
              <span className="flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-300">
                <Quote className="h-3 w-3" />
                <span>{paper.citationCount.toLocaleString()} citations</span>
              </span>
            )}

            {/* Open Access */}
            {paper.isOpenAccess && (
              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                Open Access
              </span>
            )}
          </div>

          {/* Relevance Meter & Checkbox */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" title={`Relevance score: ${paper.relevanceScore}%`}>
              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-indigo-500"
                  style={{ width: `${paper.relevanceScore}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-indigo-300 font-mono">
                {paper.relevanceScore}%
              </span>
            </div>

            {/* Select checkbox for comparison */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(paper.id)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <span className="hidden sm:inline">Select</span>
            </label>
          </div>
        </div>

        {/* Paper Title */}
        <h3 className="text-lg font-bold leading-snug text-white font-['Plus_Jakarta_Sans'] group-hover:text-indigo-200 transition-colors">
          {paper.sourceUrl ? (
            <a
              href={paper.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-start gap-1.5"
            >
              <span>{paper.title}</span>
              <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-indigo-400" />
            </a>
          ) : (
            paper.title
          )}
        </h3>

        {/* Authors & Venue */}
        <div className="mt-2 text-xs text-slate-400 space-y-1">
          <p className="line-clamp-1">
            <span className="text-slate-500 font-medium">Authors:</span> {displayAuthors}
          </p>
          {paper.venue && (
            <p className="line-clamp-1 italic text-slate-300">
              <span className="text-slate-500 not-italic font-medium">Venue:</span> {paper.venue}
            </p>
          )}
        </div>

        {/* Abstract */}
        <div className="mt-3 text-xs leading-relaxed text-slate-300/90 font-['Newsreader'] sm:text-sm">
          <p>{abstractText}</p>
          {isAbstractLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 inline-flex items-center gap-1 text-xs font-sans font-medium text-indigo-400 hover:text-indigo-300"
            >
              {isExpanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  <span>Read full abstract</span>
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Fields of study tags */}
        {paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {paper.fieldsOfStudy.map((field, idx) => (
              <span
                key={idx}
                className="rounded bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-400 border border-slate-700/40"
              >
                {field}
              </span>
            ))}
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-xs">
          {/* Identifiers & PDF */}
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            {paper.doi && (
              <a
                href={`https://doi.org/${paper.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono hover:text-indigo-300 hover:underline"
              >
                doi:{paper.doi.length > 25 ? paper.doi.slice(0, 25) + '...' : paper.doi}
              </a>
            )}
            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-emerald-400 hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                <span>PDF Available</span>
              </a>
            )}
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Copy BibTeX */}
            <button
              onClick={handleCopyBibtex}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
              title="Copy BibTeX entry"
            >
              {copiedBibtex ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>BibTeX</span>
                </>
              )}
            </button>

            {/* Save to library */}
            <button
              onClick={() => onToggleSave(paper)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 transition-colors ${
                isSaved
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
              title={isSaved ? 'Remove from saved library' : 'Save paper to library'}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {/* AI Summary Button */}
            <button
              onClick={() => onSummarize(paper)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/90 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
              <span>AI Summary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
