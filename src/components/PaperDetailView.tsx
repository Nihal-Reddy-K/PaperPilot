import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Sparkles,
  Bookmark,
  GitCompare,
  Copy,
  Check,
  Download,
  BookOpen,
  ArrowLeft,
  FileText,
  Activity,
} from 'lucide-react';
import type { AcademicPaper, PaperSummary } from '../types/paper.ts';
import { generateBibTeX } from '../utils/bibtex.ts';

interface PaperDetailViewProps {
  paper: AcademicPaper | null;
  summary: PaperSummary | null;
  isLoadingSummary: boolean;
  onGenerateSummary: (paper: AcademicPaper) => void;
  isSelected: boolean;
  isSaved: boolean;
  isMonitored?: boolean;
  onToggleSelect: () => void;
  onToggleSave: () => void;
  onToggleMonitor?: () => void;
  onClose: () => void;
  activeTopic?: string;
}

export const PaperDetailView: React.FC<PaperDetailViewProps> = ({
  paper,
  summary,
  isLoadingSummary,
  onGenerateSummary,
  isSelected,
  isSaved,
  isMonitored = false,
  onToggleSelect,
  onToggleSave,
  onToggleMonitor,
  onClose,
  activeTopic,
}) => {
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!paper) return null;

  const handleCopyBibtex = () => {
    const bib = generateBibTeX(paper);
    navigator.clipboard.writeText(bib);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  const handleCopyMarkdown = () => {
    if (!summary) return;
    const md = `# ${paper.title}
**Authors:** ${paper.authors.join(', ')}
**Venue:** ${paper.venue || 'N/A'} (${paper.year || 'N/A'})
**DOI:** ${paper.doi || 'N/A'}

## Research Problem
${summary.researchProblem}

## Motivation
${summary.motivation}

## Proposed Approach & Methodology
${summary.proposedApproach}

${summary.methodology}

## Dataset / Benchmark
${summary.datasetBenchmark}

## Key Results
${summary.keyResults}

## Limitations
${summary.limitations}

## Future Work
${summary.futureWork}

## Relevance to Research Topic (${activeTopic || 'Research'})
${summary.relevanceToUserTopic}

---
*Analysis generated via PaperPilot*
`;
    navigator.clipboard.writeText(md);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-neutral-850 bg-neutral-950 shadow-2xl backdrop-blur-xl">
      {/* Header Bar */}
      <div className="flex h-14 items-center justify-between border-b border-neutral-850 px-5 shrink-0 bg-neutral-950/90">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 transition-colors"
            title="Close paper detail"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-neutral-500">/</span>
          <span className="font-mono text-neutral-400 uppercase text-[10px]">
            {paper.source}
          </span>
          {paper.year && (
            <span className="font-mono text-neutral-500">· {paper.year}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {summary && (
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300 hover:border-neutral-700 transition-colors"
              title="Copy markdown summary"
            >
              {copiedSummary ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedSummary ? 'Copied' : 'Copy MD'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Reading View */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Title & Metadata */}
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-neutral-100 leading-snug tracking-tight">
            {paper.title}
          </h1>

          <div className="mt-2 text-xs text-neutral-400 space-y-1">
            <p className="text-neutral-300 font-medium">
              {paper.authors.join(', ') || 'Unknown Authors'}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-neutral-500">
              {paper.venue && <span>{paper.venue}</span>}
              {paper.venue && paper.year && <span>·</span>}
              {paper.year && <span className="font-mono">{paper.year}</span>}
              {paper.citationCount !== null && (
                <>
                  <span>·</span>
                  <span className="font-mono text-neutral-400">
                    {paper.citationCount} citations
                  </span>
                </>
              )}
            </div>

            {paper.doi && (
              <div className="pt-1 font-mono text-[11px] text-neutral-500">
                <span>DOI: </span>
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-300 underline underline-offset-2"
                >
                  {paper.doi}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 py-3 border-y border-neutral-850/80 text-xs">
          {paper.sourceUrl && (
            <a
              href={paper.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-medium text-neutral-200 hover:border-neutral-700 transition-colors"
            >
              <span>Open Paper</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-medium text-neutral-200 hover:border-neutral-700 transition-colors"
            >
              <Download className="h-3 w-3" />
              <span>PDF</span>
            </a>
          )}

          {!summary && (
            <button
              onClick={() => onGenerateSummary(paper)}
              disabled={isLoadingSummary}
              className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1.5 font-medium text-neutral-950 hover:bg-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isLoadingSummary ? 'Analyzing...' : 'Summarize with AI'}</span>
            </button>
          )}

          <button
            onClick={onToggleSave}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-medium transition-colors ${
              isSaved
                ? 'border-neutral-700 bg-neutral-850 text-neutral-100'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
            }`}
          >
            <Bookmark className={`h-3 w-3 ${isSaved ? 'fill-neutral-200' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={onToggleSelect}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-medium transition-colors ${
              isSelected
                ? 'border-neutral-700 bg-neutral-850 text-neutral-100'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
            }`}
          >
            <GitCompare className="h-3 w-3" />
            <span>{isSelected ? 'Selected' : 'Compare'}</span>
          </button>

          {onToggleMonitor && (
            <button
              onClick={onToggleMonitor}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                isMonitored
                  ? 'border-emerald-800/80 bg-emerald-950/40 text-emerald-300'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
              title={isMonitored ? 'Paper is tracked in Citation Monitor' : 'Track citations for this paper'}
            >
              <Activity className={`h-3 w-3 ${isMonitored ? 'text-emerald-400' : ''}`} />
              <span>{isMonitored ? 'Tracking Citations' : 'Monitor Citations'}</span>
            </button>
          )}

          <button
            onClick={handleCopyBibtex}
            className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-neutral-400 hover:text-neutral-200 transition-colors ml-auto"
            title="Copy BibTeX reference"
          >
            {copiedBibtex ? <Check className="h-3 w-3 text-emerald-400" /> : <FileText className="h-3 w-3" />}
            <span>{copiedBibtex ? 'Copied' : 'BibTeX'}</span>
          </button>
        </div>

        {/* Abstract Section */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            Abstract
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-['Newsreader'] whitespace-pre-wrap">
            {paper.abstract}
          </p>
        </div>

        {/* AI Summary Section */}
        {isLoadingSummary ? (
          <div className="py-8 border-t border-neutral-850/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
              <span>PaperPilot is analyzing paper methodology and key findings...</span>
            </div>
            <div className="space-y-2 opacity-50">
              <div className="h-4 w-3/4 bg-neutral-900 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-neutral-900 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-neutral-900 rounded animate-pulse" />
            </div>
          </div>
        ) : summary ? (
          <div className="pt-4 border-t border-neutral-850 space-y-5">
            {/* Subtle PaperPilot Label & Disclaimer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-neutral-900">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                <Sparkles className="h-3.5 w-3.5 text-neutral-400" />
                <span>PaperPilot Analysis</span>
              </div>
              <span className="text-[11px] text-neutral-500 italic">
                Analysis based on available abstract and metadata.
              </span>
            </div>

            {/* Relevance to Topic */}
            {summary.relevanceToUserTopic && (
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  Relevance to Research Topic
                </h3>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
                  {summary.relevanceToUserTopic}
                </p>
              </div>
            )}

            {/* Research Problem */}
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                Research Problem
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {summary.researchProblem}
              </p>
            </div>

            {/* Motivation */}
            {summary.motivation && (
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  Motivation
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {summary.motivation}
                </p>
              </div>
            )}

            {/* Proposed Approach & Methodology */}
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                Approach & Methodology
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-2">
                {summary.proposedApproach}
              </p>
              {summary.methodology && (
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {summary.methodology}
                </p>
              )}
            </div>

            {/* Dataset / Benchmark */}
            {summary.datasetBenchmark && (
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  Dataset & Evaluation Setup
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {summary.datasetBenchmark}
                </p>
              </div>
            )}

            {/* Key Results */}
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                Key Results
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {summary.keyResults}
              </p>
            </div>

            {/* Limitations & Future Work */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  Limitations
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {summary.limitations}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  Future Work
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {summary.futureWork}
                </p>
              </div>
            </div>

            {/* Important Technical Concepts */}
            {summary.importantTechnicalConcepts && summary.importantTechnicalConcepts.length > 0 && (
              <div className="pt-3 border-t border-neutral-900 space-y-2">
                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  Important Technical Concepts
                </h3>
                <div className="space-y-2">
                  {summary.importantTechnicalConcepts.map((item, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-mono font-semibold text-neutral-200">
                        {item.term}:{' '}
                      </span>
                      <span className="text-neutral-400 leading-relaxed">
                        {item.definition}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
