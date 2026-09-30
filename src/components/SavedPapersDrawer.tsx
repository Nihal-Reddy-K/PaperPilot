import React from 'react';
import {
  X,
  Bookmark,
  Trash2,
  GitCompare,
  FileText,
  ExternalLink,
  Download,
  BookOpen,
} from 'lucide-react';
import type { AcademicPaper } from '../types/paper.ts';
import { downloadBibTeXFile, generateBatchBibTeX } from '../utils/bibtex.ts';

interface SavedPapersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPapers: AcademicPaper[];
  onRemoveSaved: (paperId: string) => void;
  onClearAll: () => void;
  onCompareSaved: () => void;
  onSummarize: (paper: AcademicPaper) => void;
}

export const SavedPapersDrawer: React.FC<SavedPapersDrawerProps> = ({
  isOpen,
  onClose,
  savedPapers,
  onRemoveSaved,
  onClearAll,
  onCompareSaved,
  onSummarize,
}) => {
  if (!isOpen) return null;

  const handleExportAllBibtex = () => {
    if (savedPapers.length === 0) return;
    const bib = generateBatchBibTeX(savedPapers);
    downloadBibTeXFile(bib, 'paperpilot_library.bib');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-800 bg-slate-950 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Bookmark className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              <span>Saved Papers Library</span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-medium text-amber-300 border border-amber-500/20">
                {savedPapers.length} Saved
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Curated reading list for this research session
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Batch Actions Bar */}
      {savedPapers.length > 0 && (
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/40 px-5 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onCompareSaved}
              disabled={savedPapers.length < 2}
              className="flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 font-medium text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <GitCompare className="h-3.5 w-3.5" />
              <span>Compare All ({savedPapers.length})</span>
            </button>
            <button
              onClick={handleExportAllBibtex}
              className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .bib</span>
            </button>
          </div>

          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {savedPapers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
            <Bookmark className="h-10 w-10 text-slate-700 mb-2" />
            <p className="text-sm font-medium text-slate-400">Your library is empty</p>
            <p className="text-xs text-slate-600 mt-1 max-w-xs">
              Click the bookmark icon on any paper card to save it for easy comparison and BibTeX export.
            </p>
          </div>
        ) : (
          savedPapers.map((paper) => (
            <div
              key={paper.id}
              className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 hover:bg-slate-900/90 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-indigo-400">{paper.source}</span>
                    {paper.year && <span>• {paper.year}</span>}
                    {paper.citationCount !== null && (
                      <span>• {paper.citationCount} cites</span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-2">
                    {paper.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                    {paper.authors.slice(0, 3).join(', ')}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveSaved(paper.id)}
                  className="rounded p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                  title="Remove from library"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  {paper.sourceUrl && (
                    <a
                      href={paper.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300"
                    >
                      <span>Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {paper.pdfUrl && (
                    <a
                      href={paper.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      PDF
                    </a>
                  )}
                </div>

                <button
                  onClick={() => onSummarize(paper)}
                  className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <BookOpen className="h-3 w-3 text-indigo-400" />
                  <span>Summary</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
