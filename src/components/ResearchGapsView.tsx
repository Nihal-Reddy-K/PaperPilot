import React, { useState } from 'react';
import {
  Sparkles,
  Info,
  Copy,
  Check,
  FileDown,
  ArrowRight,
  ExternalLink,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import type { AcademicPaper, StructuredResearchGap } from '../types/paper.ts';

interface ResearchGapsViewProps {
  papers: AcademicPaper[];
  gaps: StructuredResearchGap[];
  isLoading: boolean;
  onAnalyzeGaps: () => void;
  onOpenPaperDetail: (paperTitle: string) => void;
  activeTopic?: string;
  onOpenExport?: () => void;
}

export const ResearchGapsView: React.FC<ResearchGapsViewProps> = ({
  papers,
  gaps,
  isLoading,
  onAnalyzeGaps,
  onOpenPaperDetail,
  activeTopic,
  onOpenExport,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    if (!gaps || gaps.length === 0) return;

    const md = `# Research Gaps Analysis
**Topic:** ${activeTopic || 'Academic Research'}
**Analyzed Papers:** ${papers.length}
*Disclaimer: Patterns and possible gaps identified across the selected literature. Does not imply mathematically proven novelty.*

---

${gaps
  .map(
    (g, idx) => `### Gap ${idx + 1}: ${g.possibleGap}
*Possible research gap*

**Why It Appears Underexplored:**
${g.whyUnderexplored}

**Evidence from Literature:**
${g.evidenceFromLiterature}

**Supporting Papers in Corpus:**
${g.supportingPapers.map((p) => `- ${p}`).join('\n')}

**Potential Research Direction:**
${g.potentialResearchDirection}

---`
  )
  .join('\n\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-850 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutral-100 tracking-tight">
              Research Gaps
            </h1>
            <span className="font-mono text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
              {gaps.length > 0 ? `${gaps.length} gaps identified` : 'Ready'}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Patterns and possible gaps identified across the selected literature.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {gaps.length > 0 && (
            <>
              {onOpenExport && (
                <button
                  onClick={onOpenExport}
                  title="Export research gaps and comparative summary to Markdown or PDF"
                  className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:border-neutral-700 hover:text-white transition-colors cursor-pointer"
                >
                  <FileDown className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Export Report (MD / PDF)</span>
                </button>
              )}
              <button
                onClick={handleCopyMarkdown}
                title="Quick copy gaps to clipboard"
                className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy MD'}</span>
              </button>
            </>
          )}

          <button
            onClick={onAnalyzeGaps}
            disabled={papers.length === 0 || isLoading}
            className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                <span>Synthesizing Gaps...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>{gaps.length > 0 ? 'Re-analyze Gaps' : 'Discover Gaps'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Epistemic Transparency Notice */}
      <div className="rounded-md border border-neutral-850 bg-neutral-900/40 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-neutral-400">
        <Info className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-neutral-300">Methodological Note:</strong> These insights represent potential omissions, divergent assumptions, or evaluation boundary conditions extracted across {papers.length} retrieved papers. They do not constitute mathematical proof of novelty; empirical verification with primary literature is recommended.
        </p>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent" />
          <p className="text-sm font-medium text-neutral-200">
            Analyzing literature boundary conditions and unresolved tensions...
          </p>
          <p className="text-xs text-neutral-500 max-w-sm text-center">
            Comparing evaluation datasets, conflicting assumptions, and unexplored intersections across {papers.length} publications.
          </p>
        </div>
      ) : gaps.length === 0 ? (
        <div className="py-16 text-center rounded-lg border border-dashed border-neutral-850 p-8 space-y-3">
          <Sparkles className="h-8 w-8 text-neutral-600 mx-auto" />
          <h2 className="text-sm font-medium text-neutral-200">
            No research gaps synthesized yet
          </h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Click "Discover Gaps" to analyze the current corpus of {papers.length} academic papers and identify potential research frontiers.
          </p>
          <button
            onClick={onAnalyzeGaps}
            disabled={papers.length === 0}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-white transition-colors"
          >
            <span>Run Gap Synthesis</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {gaps.map((gap, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-neutral-850 bg-neutral-900/30 p-5 space-y-4 hover:border-neutral-800 transition-colors"
            >
              {/* Gap Header */}
              <div className="flex items-start justify-between gap-3 border-b border-neutral-850/60 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-neutral-500 font-bold">
                      GAP 0{idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.2 rounded border border-neutral-800">
                      Possible research gap
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-neutral-100 leading-snug">
                    {gap.possibleGap}
                  </h2>
                </div>
              </div>

              {/* 1. Why Underexplored */}
              <div className="space-y-1">
                <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Why It Appears Underexplored
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {gap.whyUnderexplored}
                </p>
              </div>

              {/* 2. Evidence from Literature */}
              <div className="space-y-1">
                <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Evidence from Literature
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-['Newsreader']">
                  {gap.evidenceFromLiterature}
                </p>
              </div>

              {/* 3. Supporting Papers in Corpus */}
              {gap.supportingPapers && gap.supportingPapers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                    Supporting Papers
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {gap.supportingPapers.map((paperTitle, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => onOpenPaperDetail(paperTitle)}
                        className="inline-flex items-center gap-1 rounded bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:bg-neutral-850 border border-neutral-800 transition-colors text-left truncate max-w-md"
                        title="View paper details"
                      >
                        <span className="truncate">{paperTitle}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 text-neutral-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Potential Research Direction */}
              <div className="pt-2 border-t border-neutral-850/80 space-y-1">
                <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 text-neutral-400" />
                  <span>Potential Research Direction</span>
                </h3>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
                  {gap.potentialResearchDirection}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
