import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Trash2,
  GitCompare,
  Download,
  ExternalLink,
  Search,
  Sparkles,
  FileText,
} from 'lucide-react';
import type { AcademicPaper } from '../types/paper.ts';
import { downloadBibTeXFile, generateBatchBibTeX } from '../utils/bibtex.ts';

interface SavedPapersViewProps {
  savedPapers: AcademicPaper[];
  onRemoveSaved: (paperId: string) => void;
  onClearAll: () => void;
  onOpenDetail: (paper: AcademicPaper) => void;
  onCompareAll: () => void;
}

export const SavedPapersView: React.FC<SavedPapersViewProps> = ({
  savedPapers,
  onRemoveSaved,
  onClearAll,
  onOpenDetail,
  onCompareAll,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredPapers = useMemo(() => {
    if (!filterQuery.trim()) return savedPapers;
    const q = filterQuery.toLowerCase();
    return savedPapers.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.authors.some((a) => a.toLowerCase().includes(q)) ||
        (p.venue && p.venue.toLowerCase().includes(q))
    );
  }, [savedPapers, filterQuery]);

  const handleExportBibtex = () => {
    if (savedPapers.length === 0) return;
    const bib = generateBatchBibTeX(savedPapers);
    downloadBibTeXFile(bib, 'researchscout_library.bib');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-850 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutral-100 tracking-tight">
              Saved Papers
            </h1>
            <span className="font-mono text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
              {savedPapers.length} papers in library
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Curated reading list for ongoing research and comparative study.
          </p>
        </div>

        {savedPapers.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onCompareAll}
              disabled={savedPapers.length < 2}
              className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <GitCompare className="h-3.5 w-3.5" />
              <span>Compare All</span>
            </button>

            <button
              onClick={handleExportBibtex}
              className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export .bib</span>
            </button>

            <button
              onClick={onClearAll}
              className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-400 hover:text-rose-400 hover:border-neutral-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Filter / Search within saved papers */}
      {savedPapers.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search saved papers by title, author, or venue..."
            className="w-full rounded-md border border-neutral-800 bg-neutral-900/60 pl-9 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors"
          />
        </div>
      )}

      {/* List */}
      {savedPapers.length === 0 ? (
        <div className="py-16 text-center rounded-lg border border-dashed border-neutral-850 p-6 space-y-2">
          <Bookmark className="h-6 w-6 text-neutral-600 mx-auto" />
          <h2 className="text-sm font-medium text-neutral-300">Your library is empty</h2>
          <p className="text-xs text-neutral-500">
            Click "Save" on any search result to bookmark publications here for literature reviews.
          </p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <p className="text-xs text-neutral-500 text-center py-8">
          No saved papers match your search filter.
        </p>
      ) : (
        <div className="divide-y divide-neutral-850 border-y border-neutral-850">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="py-4 flex items-start justify-between gap-4 group hover:bg-neutral-900/30 px-3 -mx-3 rounded-md transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <h3
                  onClick={() => onOpenDetail(paper)}
                  className="text-sm font-medium text-neutral-100 hover:text-white cursor-pointer transition-colors leading-snug line-clamp-2"
                >
                  {paper.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                  <span>{paper.authors.slice(0, 3).join(', ')}</span>
                  {paper.venue && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-xs">{paper.venue}</span>
                    </>
                  )}
                  {paper.year && (
                    <>
                      <span>·</span>
                      <span className="font-mono">{paper.year}</span>
                    </>
                  )}
                  {paper.citationCount !== null && (
                    <>
                      <span>·</span>
                      <span className="font-mono">{paper.citationCount} cites</span>
                    </>
                  )}
                </div>

                {paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {paper.fieldsOfStudy.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-neutral-900 px-1.5 py-0.2 text-[10px] text-neutral-400 border border-neutral-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                <button
                  type="button"
                  onClick={() => onOpenDetail(paper)}
                  className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
                >
                  Inspect
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveSaved(paper.id)}
                  className="rounded p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-850 transition-colors"
                  title="Remove from saved library"
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
