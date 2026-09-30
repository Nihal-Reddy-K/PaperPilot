import React, { useState } from 'react';
import {
  X,
  GitCompare,
  Sparkles,
  Layers,
  Scale,
  Cpu,
  BarChart,
  Lightbulb,
  Search,
  CheckCircle2,
  Copy,
  Check,
  FileDown,
} from 'lucide-react';
import type { AcademicPaper, PaperComparison } from '../types/paper.ts';

interface PaperComparisonModalProps {
  papers: AcademicPaper[];
  comparison: PaperComparison | null;
  isLoading: boolean;
  onClose: () => void;
  activeTopic?: string;
}

export const PaperComparisonModal: React.FC<PaperComparisonModalProps> = ({
  papers,
  comparison,
  isLoading,
  onClose,
  activeTopic,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'themes' | 'methodology' | 'benchmarks' | 'gaps'>('themes');

  const handleCopyMarkdown = () => {
    if (!comparison) return;

    const md = `# Comparative Literature Synthesis: ${papers.length} Papers
**Research Topic:** ${activeTopic || 'Academic Literature Synthesis'}  
**Compared Papers:**
${papers.map((p, i) => `${i + 1}. "${p.title}" (${p.year || 'N/A'}, ${p.venue || 'N/A'})`).join('\n')}

---

## 1. Common Research Themes & Shared Goals
${comparison.commonThemes.map((t) => `- ${t}`).join('\n')}

## 2. Key Differences & Divergent Philosophies
${comparison.keyDifferences.map((d) => `- ${d}`).join('\n')}

## 3. Methodology Comparison
${comparison.methodologyComparison
  .map(
    (m) => `### Aspect: ${m.aspect}
${m.breakdown.map((b) => `- **${b.paperTitle}**: ${b.approach}`).join('\n')}
`
  )
  .join('\n')}

## 4. Benchmark & Evaluation Matrix
| Paper | Workloads / Datasets | Testbed / Hardware | Key Reported Metrics |
|---|---|---|---|
${comparison.benchmarkComparison
  .map(
    (b) =>
      `| ${b.paperTitle.replace(/\|/g, '-')} | ${b.workloadsOrDatasets.replace(/\|/g, '-')} | ${b.hardwareOrTestbed.replace(/\|/g, '-')} | ${b.reportedKeyMetrics.replace(/\|/g, '-')} |`
  )
  .join('\n')}

## 5. Critical Trade-off Synthesis
${comparison.tradeoffSynthesis}

## 6. Identified Research Gaps & Open Opportunities
${comparison.researchGaps.map((g) => `- ${g}`).join('\n')}

## 7. Actionable Recommendations for Your Topic
${comparison.recommendations.map((r) => `- ${r}`).join('\n')}

---
*Synthesized with PaperPilot via Gemini 3.8 Flash*
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <GitCompare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <span>Comparative Paper Synthesis</span>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/20">
                  {papers.length} Papers Selected
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cross-paper analysis of paradigms, methodologies, benchmarks, and research gaps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparison && (
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                title="Copy comparative report as Markdown"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Synthesis MD</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Papers Overview Ribbon */}
        <div className="border-b border-slate-800/80 bg-slate-950/50 px-6 py-2.5 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-400 shrink-0">Corpus:</span>
            {papers.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-slate-300 border border-slate-800 shrink-0 max-w-xs truncate"
                title={p.title}
              >
                <span className="font-bold text-indigo-400">[{idx + 1}]</span>
                <span className="truncate">{p.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6">
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === 'themes'
                ? 'border-indigo-500 text-indigo-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Themes & Differences</span>
          </button>
          <button
            onClick={() => setActiveTab('methodology')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === 'methodology'
                ? 'border-indigo-500 text-indigo-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>Methodology Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === 'benchmarks'
                ? 'border-indigo-500 text-indigo-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart className="h-4 w-4" />
            <span>Benchmarks & Evaluations</span>
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === 'gaps'
                ? 'border-indigo-500 text-indigo-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Research Gaps & Roadmap</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
              <p className="text-sm font-semibold text-slate-200">
                Synthesizing {papers.length} Papers with Gemini 3.8 Flash...
              </p>
              <p className="text-xs text-slate-500 max-w-md text-center">
                Comparing architectural tradeoffs, mapping divergent methodologies, assessing benchmark coverage, and identifying open research opportunities.
              </p>
            </div>
          ) : comparison ? (
            <div className="space-y-6">
              {/* TAB 1: THEMES & DIFFERENCES */}
              {activeTab === 'themes' && (
                <div className="space-y-6">
                  {/* Common Themes */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Shared Research Themes & Common Objectives</span>
                    </h3>
                    <div className="space-y-2.5">
                      {comparison.commonThemes.map((theme, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <p>{theme}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Differences */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                      <Scale className="h-4 w-4 text-amber-400" />
                      <span>Divergent Philosophies & Architectural Disagreements</span>
                    </h3>
                    <div className="space-y-2.5">
                      {comparison.keyDifferences.map((diff, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                          <p>{diff}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tradeoff Synthesis */}
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-300 mb-2">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      <span>Consolidated Trade-off Synthesis</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {comparison.tradeoffSynthesis}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: METHODOLOGY MATRIX */}
              {activeTab === 'methodology' && (
                <div className="space-y-5">
                  <p className="text-xs text-slate-400">
                    Side-by-side comparison of technical paradigms and algorithmic formulations across papers:
                  </p>
                  {comparison.methodologyComparison.map((m, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <h4 className="font-semibold text-sm text-sky-300 mb-3 flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-sky-400" />
                        <span>Dimension: {m.aspect}</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {m.breakdown.map((item, bIdx) => (
                          <div
                            key={bIdx}
                            className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3"
                          >
                            <span className="text-[11px] font-bold text-slate-300 block truncate" title={item.paperTitle}>
                              {item.paperTitle}
                            </span>
                            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                              {item.approach}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: BENCHMARKS & EVALUATIONS */}
              {activeTab === 'benchmarks' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Experimental setups, workload benchmarks, and reported quantitative gains:
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-3 w-1/4">Paper</th>
                          <th className="p-3 w-1/4">Workloads / Datasets</th>
                          <th className="p-3 w-1/4">Testbed / Hardware</th>
                          <th className="p-3 w-1/4">Reported Metrics & Gains</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                        {comparison.benchmarkComparison.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-850/50">
                            <td className="p-3 font-medium text-white">{row.paperTitle}</td>
                            <td className="p-3 text-slate-300">{row.workloadsOrDatasets}</td>
                            <td className="p-3 text-slate-300">{row.hardwareOrTestbed}</td>
                            <td className="p-3 font-semibold text-emerald-400">{row.reportedKeyMetrics}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: RESEARCH GAPS & ROADMAP */}
              {activeTab === 'gaps' && (
                <div className="space-y-6">
                  {/* Research Gaps */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-rose-300 mb-3">
                      <Search className="h-4 w-4 text-rose-400" />
                      <span>Identified Research Gaps & Unexplored Areas</span>
                    </h3>
                    <div className="space-y-2.5">
                      {comparison.researchGaps.map((gap, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                          <p>{gap}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="rounded-xl border border-indigo-500/30 bg-slate-950/60 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-300 mb-3">
                      <Lightbulb className="h-4 w-4 text-indigo-400" />
                      <span>Actionable Research Directions For Your Project</span>
                    </h3>
                    <div className="space-y-2.5">
                      {comparison.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <p>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              No comparison generated yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-3 text-xs text-slate-400">
          <span>Comparative literature synthesis across {papers.length} publications.</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 font-medium text-white hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
