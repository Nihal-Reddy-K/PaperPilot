import React, { useState } from 'react';
import {
  GitCompare,
  X,
  Plus,
  Copy,
  Check,
  Download,
  FileDown,
  Table,
  Columns,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type { AcademicPaper, PaperComparison } from '../types/paper.ts';

interface CompareViewProps {
  papers: AcademicPaper[];
  allPapers: AcademicPaper[];
  comparison: PaperComparison | null;
  isLoading: boolean;
  onRemovePaper: (paperId: string) => void;
  onAddPaper: (paper: AcademicPaper) => void;
  onRunComparison: () => void;
  onOpenDetail: (paper: AcademicPaper) => void;
  activeTopic?: string;
  onOpenExport?: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  papers,
  allPapers,
  comparison,
  isLoading,
  onRemovePaper,
  onAddPaper,
  onRunComparison,
  onOpenDetail,
  activeTopic,
  onOpenExport,
}) => {
  const [copied, setCopied] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  // Unselected papers available to add
  const unselectedPapers = allPapers.filter(
    (ap) => !papers.some((p) => p.id === ap.id)
  );

  const handleCopyMarkdown = () => {
    if (!comparison) return;

    const md = `# Comparative Literature Synthesis
**Topic:** ${activeTopic || 'Academic Research'}
**Compared Papers (${papers.length}):**
${papers.map((p, i) => `${i + 1}. ${p.title} (${p.year || 'N/A'}, ${p.venue || 'N/A'})`).join('\n')}

---

## 1. Common Research Themes
${comparison.commonThemes.map((t) => `- ${t}`).join('\n')}

## 2. Key Differences & Trade-offs
${comparison.keyDifferences.map((d) => `- ${d}`).join('\n')}

## 3. Methodology Matrix
| Aspect | ${papers.map((p) => p.title.slice(0, 30) + '...').join(' | ')} |
|---|${papers.map(() => '---').join('|')}|
${comparison.methodologyComparison
  .map(
    (m) =>
      `| ${m.aspect} | ${m.breakdown.map((b) => b.approach.replace(/\|/g, '-')).join(' | ')} |`
  )
  .join('\n')}

## 4. Benchmark & Evaluation Comparison
| Paper | Workloads / Datasets | Testbed / Hardware | Key Reported Metrics |
|---|---|---|---|
${comparison.benchmarkComparison
  .map(
    (b) =>
      `| ${b.paperTitle.replace(/\|/g, '-')} | ${b.workloadsOrDatasets.replace(/\|/g, '-')} | ${b.hardwareOrTestbed.replace(/\|/g, '-')} | ${b.reportedKeyMetrics.replace(/\|/g, '-')} |`
  )
  .join('\n')}

## 5. Trade-off Synthesis
${comparison.tradeoffSynthesis}

## 6. Research Gaps & Unexplored Areas
${comparison.researchGaps.map((g) => `- ${g}`).join('\n')}

## 7. Recommendations
${comparison.recommendations.map((r) => `- ${r}`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-850 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutral-100 tracking-tight">
              Compare Papers
            </h1>
            <span className="font-mono text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
              {papers.length} selected
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Side-by-side analysis of methodologies, benchmark setups, and empirical findings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {comparison && (
            <>
              {onOpenExport && (
                <button
                  onClick={onOpenExport}
                  title="Export comparison and research gaps to Markdown or PDF"
                  className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:border-neutral-700 hover:text-white transition-colors cursor-pointer"
                >
                  <FileDown className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Export Report (MD / PDF)</span>
                </button>
              )}
              <button
                onClick={handleCopyMarkdown}
                title="Quick copy comparison to clipboard"
                className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy MD'}</span>
              </button>
            </>
          )}

          <button
            onClick={onRunComparison}
            disabled={papers.length < 2 || isLoading}
            className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                <span>Comparing...</span>
              </>
            ) : (
              <>
                <GitCompare className="h-3.5 w-3.5" />
                <span>{comparison ? 'Re-run Comparison' : 'Run Comparison'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selected Papers Horizontal Selector Bar */}
      <div className="space-y-2">
        <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Selected Corpus
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {papers.map((paper, idx) => (
            <div
              key={paper.id}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200"
            >
              <span className="font-mono text-[10px] text-neutral-500 font-bold">
                [{idx + 1}]
              </span>
              <span
                onClick={() => onOpenDetail(paper)}
                className="max-w-[220px] truncate hover:text-white cursor-pointer font-medium"
                title={paper.title}
              >
                {paper.title}
              </span>
              {paper.year && (
                <span className="font-mono text-[11px] text-neutral-500">
                  ({paper.year})
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemovePaper(paper.id)}
                className="text-neutral-500 hover:text-neutral-200 ml-1"
                title="Remove paper from comparison"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Add paper button & dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-neutral-800 px-3 py-1.5 text-xs text-neutral-400 hover:border-neutral-700 hover:text-neutral-200 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add paper</span>
            </button>

            {showAddDropdown && (
              <div className="absolute left-0 top-full mt-1.5 z-30 w-80 max-h-64 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900 p-2 shadow-xl text-xs space-y-1">
                {unselectedPapers.length === 0 ? (
                  <p className="text-neutral-500 p-2 text-center">
                    All retrieved papers already selected.
                  </p>
                ) : (
                  unselectedPapers.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onAddPaper(p);
                        setShowAddDropdown(false);
                      }}
                      className="w-full text-left p-2 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors block truncate"
                    >
                      <p className="font-medium truncate">{p.title}</p>
                      <p className="text-[10px] text-neutral-500">
                        {p.authors[0] || 'Author'} · {p.year || 'N/A'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {papers.length < 2 && (
          <p className="text-xs text-neutral-500 pt-1">
            Select at least 2 papers to perform comparative analysis.
          </p>
        )}
      </div>

      {/* Comparison Results */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent" />
          <p className="text-sm font-medium text-neutral-200">
            Synthesizing methodologies and empirical benchmarks...
          </p>
          <p className="text-xs text-neutral-500 max-w-sm text-center">
            Comparing problem formulations, algorithmic paradigms, hardware platforms, and limitations across the selected literature.
          </p>
        </div>
      ) : comparison ? (
        <div className="space-y-8 pt-4">
          {/* Section: Common Themes & Key Differences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Common Themes */}
            <div className="rounded-lg border border-neutral-850 bg-neutral-900/40 p-4 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Shared Research Themes & Objectives
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-400">
                {comparison.commonThemes.map((theme, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-neutral-400 shrink-0" />
                    <span>{theme}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Differences */}
            <div className="rounded-lg border border-neutral-850 bg-neutral-900/40 p-4 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Divergent Philosophies & Trade-offs
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-400">
                {comparison.keyDifferences.map((diff, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-neutral-400 shrink-0" />
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section: Methodology Comparison Matrix Table */}
          {comparison.methodologyComparison && comparison.methodologyComparison.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Methodology Comparison Matrix
                </h2>
                <span className="text-[11px] text-neutral-500">
                  Algorithmic and architectural breakdown
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-neutral-850">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-850 bg-neutral-900 text-neutral-400 font-medium">
                    <tr>
                      <th className="p-3 w-1/4">Aspect</th>
                      {papers.map((p, idx) => (
                        <th key={p.id} className="p-3">
                          <span className="text-neutral-200 block truncate max-w-[200px]" title={p.title}>
                            [{idx + 1}] {p.title}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850/80 bg-neutral-950/50">
                    {comparison.methodologyComparison.map((row, idx) => (
                      <tr key={idx} className="hover:bg-neutral-900/30">
                        <td className="p-3 font-medium text-neutral-300 bg-neutral-900/20">
                          {row.aspect}
                        </td>
                        {row.breakdown.map((item, bIdx) => (
                          <td key={bIdx} className="p-3 text-neutral-400 leading-relaxed">
                            {item.approach}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Benchmark & Evaluation Matrix Table */}
          {comparison.benchmarkComparison && comparison.benchmarkComparison.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Benchmark & Experimental Setup Matrix
                </h2>
                <span className="text-[11px] text-neutral-500">
                  Testbeds, datasets, and reported performance metrics
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-neutral-850">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-850 bg-neutral-900 text-neutral-400 font-medium">
                    <tr>
                      <th className="p-3 w-1/4">Paper</th>
                      <th className="p-3 w-1/4">Workloads / Datasets</th>
                      <th className="p-3 w-1/4">Hardware / Testbed</th>
                      <th className="p-3 w-1/4">Reported Key Metrics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850/80 bg-neutral-950/50">
                    {comparison.benchmarkComparison.map((row, idx) => (
                      <tr key={idx} className="hover:bg-neutral-900/30">
                        <td className="p-3 font-medium text-neutral-200">
                          {row.paperTitle}
                        </td>
                        <td className="p-3 text-neutral-400">
                          {row.workloadsOrDatasets}
                        </td>
                        <td className="p-3 text-neutral-400">
                          {row.hardwareOrTestbed}
                        </td>
                        <td className="p-3 text-neutral-300 font-medium">
                          {row.reportedKeyMetrics}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Tradeoff Synthesis */}
          {comparison.tradeoffSynthesis && (
            <div className="rounded-lg border border-neutral-850 bg-neutral-900/30 p-5 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Consolidated Trade-off Synthesis
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {comparison.tradeoffSynthesis}
              </p>
            </div>
          )}

          {/* Section: Actionable Recommendations */}
          {comparison.recommendations && comparison.recommendations.length > 0 && (
            <div className="rounded-lg border border-neutral-850 bg-neutral-900/30 p-5 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Recommendations for Your Investigation
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
                {comparison.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-neutral-300 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center rounded-lg border border-dashed border-neutral-850 p-6">
          <p className="text-xs text-neutral-400">
            Click "Run Comparison" above to perform multi-paper comparative synthesis on the {papers.length} selected papers.
          </p>
        </div>
      )}
    </div>
  );
};
