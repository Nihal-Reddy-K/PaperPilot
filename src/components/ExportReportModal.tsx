import React, { useState, useMemo } from 'react';
import {
  X,
  FileDown,
  Copy,
  Check,
  Printer,
  FileText,
  FileCode,
  Layers,
  Sparkles,
  GitCompare,
  BookOpen,
  Info,
  Download,
  Eye,
  ExternalLink,
} from 'lucide-react';
import type { AcademicPaper, PaperComparison, StructuredResearchGap } from '../types/paper.ts';
import {
  generateMarkdownReport,
  downloadMarkdownFile,
  printOrSavePdfReport,
  downloadHtmlReport,
  type ReportExportData,
} from '../utils/exportReport.ts';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReportExportData;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'markdown'>('preview');
  const [isPdfInitiating, setIsPdfInitiating] = useState(false);

  const markdownContent = useMemo(() => {
    return generateMarkdownReport(data);
  }, [data]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const filename = `research_synthesis_${data.topic.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}.md`;
    downloadMarkdownFile(markdownContent, filename);
  };

  const handlePrintPdf = () => {
    setIsPdfInitiating(true);
    printOrSavePdfReport(data);
    setTimeout(() => setIsPdfInitiating(false), 1200);
  };

  const handleDownloadHtml = () => {
    const filename = `research_report_${data.topic.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}.html`;
    downloadHtmlReport(data, filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl flex flex-col rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden max-h-[90vh] text-xs">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 px-5 py-3.5 bg-neutral-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300">
              <FileDown className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100">
                Export Research Synthesis & Gaps
              </h3>
              <p className="text-[11px] text-neutral-400 truncate max-w-md">
                {data.topic}
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-950 p-0.5 mr-2">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Eye className="h-3 w-3" />
                <span>Document</span>
              </button>
              <button
                onClick={() => setViewMode('markdown')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  viewMode === 'markdown'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <FileCode className="h-3 w-3" />
                <span>Markdown</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              title="Copy markdown text to clipboard"
              className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              title="Download formatted .md file"
              className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-neutral-200 hover:border-neutral-700 hover:text-white transition-colors cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-neutral-400" />
              <span>Download .md</span>
            </button>

            <button
              onClick={handlePrintPdf}
              title="Save as PDF or print offline document"
              className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-white transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{isPdfInitiating ? 'Preparing PDF...' : 'Save as PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Scope Banner */}
        <div className="border-b border-neutral-800 bg-neutral-950/70 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-neutral-400 text-[11px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-neutral-300">
              <BookOpen className="h-3.5 w-3.5 text-neutral-400" />
              <strong>{data.papers.length}</strong> publications in corpus
            </span>
            <span className="text-neutral-700">•</span>
            <span className="flex items-center gap-1">
              <GitCompare className="h-3.5 w-3.5 text-neutral-400" />
              Comparative Matrix:
              <strong className={data.comparison ? 'text-emerald-400' : 'text-neutral-500'}>
                {data.comparison ? 'Included' : 'Not generated yet'}
              </strong>
            </span>
            <span className="text-neutral-700">•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-neutral-400" />
              Research Gaps:
              <strong className={data.gaps.length > 0 ? 'text-amber-400' : 'text-neutral-500'}>
                {data.gaps.length > 0 ? `${data.gaps.length} gaps identified` : 'Not run yet'}
              </strong>
            </span>
          </div>

          <button
            onClick={handleDownloadHtml}
            className="text-neutral-400 hover:text-neutral-200 underline decoration-neutral-700 text-[11px] cursor-pointer"
          >
            Download HTML report
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto bg-neutral-950">
          {viewMode === 'markdown' ? (
            /* Raw Markdown View */
            <div className="p-5 font-mono text-[11px] text-neutral-300 leading-relaxed whitespace-pre-wrap select-text selection:bg-neutral-800">
              {markdownContent}
            </div>
          ) : (
            /* Rendered Document Preview */
            <div className="p-6 max-w-3xl mx-auto space-y-7 text-neutral-200">
              
              {/* Document Header */}
              <div className="border-b border-neutral-800 pb-5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold">
                  PaperPilot Research Review & Literature Synthesis
                </span>
                <h2 className="text-xl font-bold text-neutral-100 tracking-tight mt-1 mb-2">
                  {data.topic}
                </h2>
                {data.keywords && (
                  <p className="text-xs text-neutral-400">
                    <strong className="text-neutral-300">Keywords:</strong> {data.keywords}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-500">
                  <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{data.papers.length} publications reviewed</span>
                  <span>•</span>
                  <span>Offline review document</span>
                </div>
              </div>

              {/* Section 1: Comparative Synthesis */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2">
                  <GitCompare className="h-4 w-4 text-neutral-400" />
                  <h3 className="text-sm font-semibold text-neutral-100">
                    1. Multi-Paper Comparative Synthesis
                  </h3>
                </div>

                {data.comparison ? (
                  <div className="space-y-5 text-xs text-neutral-300">
                    {/* Common Themes */}
                    {data.comparison.commonThemes && data.comparison.commonThemes.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
                          1.1 Common Objectives & Themes
                        </h4>
                        <ul className="space-y-1.5 list-disc list-inside text-neutral-300">
                          {data.comparison.commonThemes.map((theme, i) => (
                            <li key={i} className="leading-relaxed">
                              {theme}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Differences */}
                    {data.comparison.keyDifferences && data.comparison.keyDifferences.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
                          1.2 Divergent Methodological Approaches
                        </h4>
                        <ul className="space-y-1.5 list-disc list-inside text-neutral-300">
                          {data.comparison.keyDifferences.map((diff, i) => (
                            <li key={i} className="leading-relaxed">
                              {diff}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Methodology Matrix */}
                    {data.comparison.methodologyComparison && data.comparison.methodologyComparison.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
                          1.3 Methodology Comparison Matrix
                        </h4>
                        <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900/60">
                          <table className="w-full text-left border-collapse text-[11px]">
                            <thead>
                              <tr className="border-b border-neutral-800 bg-neutral-900 text-neutral-300 font-semibold">
                                <th className="p-2.5 w-1/4">Aspect</th>
                                {data.papers.slice(0, 4).map((p, idx) => (
                                  <th key={p.id} className="p-2.5">
                                    [{idx + 1}] {p.title.slice(0, 24)}...
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                              {data.comparison.methodologyComparison.map((m, idx) => (
                                <tr key={idx} className="hover:bg-neutral-850/30">
                                  <td className="p-2.5 font-medium text-neutral-200 bg-neutral-900/30">
                                    {m.aspect}
                                  </td>
                                  {m.breakdown.slice(0, 4).map((b, bIdx) => (
                                    <td key={bIdx} className="p-2.5 leading-relaxed text-neutral-400">
                                      {b.approach}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Benchmark Comparison */}
                    {data.comparison.benchmarkComparison && data.comparison.benchmarkComparison.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
                          1.4 Benchmark & Evaluation Setup
                        </h4>
                        <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900/60">
                          <table className="w-full text-left border-collapse text-[11px]">
                            <thead>
                              <tr className="border-b border-neutral-800 bg-neutral-900 text-neutral-300 font-semibold">
                                <th className="p-2.5">Paper</th>
                                <th className="p-2.5">Workloads / Datasets</th>
                                <th className="p-2.5">Hardware / Testbed</th>
                                <th className="p-2.5">Reported Key Metrics</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                              {data.comparison.benchmarkComparison.map((b, idx) => (
                                <tr key={idx} className="hover:bg-neutral-850/30">
                                  <td className="p-2.5 font-medium text-neutral-200">
                                    {b.paperTitle}
                                  </td>
                                  <td className="p-2.5 text-neutral-400">{b.workloadsOrDatasets}</td>
                                  <td className="p-2.5 text-neutral-400">{b.hardwareOrTestbed}</td>
                                  <td className="p-2.5 text-neutral-400">{b.reportedKeyMetrics}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Trade-off Synthesis */}
                    {data.comparison.tradeoffSynthesis && (
                      <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3.5">
                        <h4 className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1.5">
                          1.5 Consolidated Trade-off Synthesis
                        </h4>
                        <p className="text-neutral-300 leading-relaxed">
                          {data.comparison.tradeoffSynthesis}
                        </p>
                      </div>
                    )}

                    {/* Recommendations */}
                    {data.comparison.recommendations && data.comparison.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
                          1.6 Actionable Recommendations
                        </h4>
                        <ul className="space-y-1.5 list-disc list-inside text-neutral-300">
                          {data.comparison.recommendations.map((rec, i) => (
                            <li key={i} className="leading-relaxed">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-neutral-800 p-4 text-center text-neutral-500">
                    Comparative synthesis has not been generated for this export. Run &ldquo;Compare Papers&rdquo; in the app to include side-by-side matrices.
                  </div>
                )}
              </div>

              {/* Section 2: Research Gaps */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2">
                  <Sparkles className="h-4 w-4 text-neutral-400" />
                  <h3 className="text-sm font-semibold text-neutral-100">
                    2. Identified Research Gaps & Open Frontiers
                  </h3>
                </div>

                <div className="rounded-md border border-neutral-800/80 bg-neutral-900/40 p-3 text-[11px] text-neutral-400 leading-relaxed flex items-start gap-2">
                  <Info className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Methodological Disclaimer:</strong> Patterns and potential gaps identified across the literature corpus indicate possible omissions, divergent assumptions, or evaluation boundary conditions. Empirical verification with primary literature is recommended.
                  </span>
                </div>

                {data.gaps && data.gaps.length > 0 ? (
                  <div className="space-y-3.5">
                    {data.gaps.map((g, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 space-y-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] uppercase tracking-wider bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-semibold">
                            Gap 0{idx + 1}
                          </span>
                          <h4 className="text-xs font-semibold text-neutral-100">
                            {g.possibleGap}
                          </h4>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-neutral-300">
                          <p>
                            <strong className="text-neutral-400">Why Underexplored:</strong>{' '}
                            {g.whyUnderexplored}
                          </p>
                          <p>
                            <strong className="text-neutral-400">Evidence from Literature:</strong>{' '}
                            <span className="italic text-neutral-300">{g.evidenceFromLiterature}</span>
                          </p>
                          {g.supportingPapers && g.supportingPapers.length > 0 && (
                            <p>
                              <strong className="text-neutral-400">Supporting Works:</strong>{' '}
                              <span className="text-neutral-300">{g.supportingPapers.join('; ')}</span>
                            </p>
                          )}
                          <p>
                            <strong className="text-neutral-400">Potential Direction:</strong>{' '}
                            <span className="text-neutral-200">{g.potentialResearchDirection}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-neutral-800 p-4 text-center text-neutral-500">
                    Research gaps have not been analyzed for this session. Use &ldquo;Discover Gaps&rdquo; in the app to include structural gap synthesis.
                  </div>
                )}
              </div>

              {/* Section 3: Publications Corpus */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2">
                  <BookOpen className="h-4 w-4 text-neutral-400" />
                  <h3 className="text-sm font-semibold text-neutral-100">
                    3. Analyzed Publications Corpus ({data.papers.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {data.papers.map((p, idx) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-neutral-800/70 bg-neutral-900/30 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-xs text-neutral-200">
                          [{idx + 1}] {p.title}
                        </div>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {p.authors.join(', ')} • <em>{p.venue || 'Academic Publication'}</em> ({p.year || 'N/A'})
                        {p.citationCount !== null && ` • ${p.citationCount} citations`}
                        {p.doi && ` • DOI: ${p.doi}`}
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-3 leading-relaxed pt-1">
                        {p.abstract}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 px-5 py-3 text-neutral-500 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <span>Compatible with:</span>
            <span className="font-mono text-neutral-400">Markdown (.md)</span>
            <span>•</span>
            <span className="font-mono text-neutral-400">PDF / Print</span>
            <span>•</span>
            <span className="font-mono text-neutral-400">HTML</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPdf}
              className="rounded-md bg-neutral-100 px-3 py-1 font-semibold text-neutral-950 hover:bg-white transition-colors cursor-pointer"
            >
              Export PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-md bg-neutral-800 px-3 py-1 font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
