import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Target,
  Flame,
  Lightbulb,
  Cpu,
  BarChart3,
  Award,
  AlertTriangle,
  Compass,
  Code2,
  Copy,
  Check,
  Download,
  Share2,
} from 'lucide-react';
import type { AcademicPaper, PaperSummary } from '../types/paper.ts';

interface PaperSummaryModalProps {
  paper: AcademicPaper | null;
  summary: PaperSummary | null;
  isLoading: boolean;
  onClose: () => void;
  activeTopic?: string;
}

export const PaperSummaryModal: React.FC<PaperSummaryModalProps> = ({
  paper,
  summary,
  isLoading,
  onClose,
  activeTopic,
}) => {
  const [copied, setCopied] = useState(false);

  if (!paper) return null;

  const handleCopyMarkdown = () => {
    if (!summary) return;
    const md = `# Research Summary: ${paper.title}
**Authors:** ${paper.authors.join(', ')}  
**Year:** ${paper.year || 'N/A'} | **Venue:** ${paper.venue || 'N/A'}  
**DOI:** ${paper.doi || 'N/A'}  
**Research Context:** ${activeTopic || 'N/A'}

---

### 1. Research Problem
${summary.researchProblem}

### 2. Motivation
${summary.motivation}

### 3. Proposed Approach
${summary.proposedApproach}

### 4. Methodology
${summary.methodology}

### 5. Dataset / Benchmark
${summary.datasetBenchmark}

### 6. Key Results
${summary.keyResults}

### 7. Limitations
${summary.limitations}

### 8. Future Work
${summary.futureWork}

### 9. Important Technical Concepts
${summary.importantTechnicalConcepts.map((c) => `- **${c.term}**: ${c.definition}`).join('\n')}

### 10. Relevance to Research Topic
${summary.relevanceToUserTopic}

---
*Generated with PaperPilot via Gemini 3.8 Flash*
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <span>Structured Academic Summary</span>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/20">
                  Gemini 3.8 Flash
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-xl">
                {paper.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {summary && (
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                title="Copy full summary as Markdown"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Markdown</span>
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Paper Context Banner */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <h3 className="text-sm font-semibold text-white font-['Plus_Jakarta_Sans']">
              {paper.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>{paper.authors.slice(0, 4).join(', ')}{paper.authors.length > 4 ? ' et al.' : ''}</span>
              {paper.year && <span>• {paper.year}</span>}
              {paper.venue && <span className="italic">• {paper.venue}</span>}
              {paper.doi && (
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-indigo-400 hover:underline"
                >
                  doi:{paper.doi}
                </a>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
              <p className="text-sm font-semibold text-slate-200">
                Generating 10-Point Technical Research Summary...
              </p>
              <p className="text-xs text-slate-500 max-w-sm text-center">
                Gemini 3.8 Flash is analyzing problem formulations, methodology, benchmarks, empirical results, and technical concepts.
              </p>
            </div>
          ) : summary ? (
            <div className="space-y-6">
              {/* Highlight: Relevance to Research Topic */}
              <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-indigo-900/20 to-slate-950 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs uppercase tracking-wider mb-1.5">
                  <Target className="h-4 w-4 text-indigo-400" />
                  <span>Why This Paper is Relevant to Your Topic</span>
                  {activeTopic && (
                    <span className="text-slate-400 lowercase italic">({activeTopic})</span>
                  )}
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {summary.relevanceToUserTopic}
                </p>
              </div>

              {/* Grid of Core Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Research Problem */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider mb-2">
                    <Target className="h-3.5 w-3.5" />
                    <span>1. Research Problem</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {summary.researchProblem}
                  </p>
                </div>

                {/* 2. Motivation */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-2">
                    <Flame className="h-3.5 w-3.5" />
                    <span>2. Motivation</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {summary.motivation}
                  </p>
                </div>

                {/* 3. Proposed Approach */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider mb-2">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>3. Proposed Approach</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {summary.proposedApproach}
                  </p>
                </div>

                {/* 4. Methodology */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-2">
                    <Cpu className="h-3.5 w-3.5" />
                    <span>4. Methodology</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {summary.methodology}
                  </p>
                </div>

                {/* 5. Dataset / Benchmark */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs uppercase tracking-wider mb-2">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>5. Dataset / Benchmark</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {summary.datasetBenchmark}
                  </p>
                </div>

                {/* 6. Key Results */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-2">
                    <Award className="h-3.5 w-3.5" />
                    <span>6. Key Results</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {summary.keyResults}
                  </p>
                </div>

                {/* 7. Limitations */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs uppercase tracking-wider mb-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>7. Limitations</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {summary.limitations}
                  </p>
                </div>

                {/* 8. Future Work */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider mb-2">
                    <Compass className="h-3.5 w-3.5" />
                    <span>8. Future Work</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {summary.futureWork}
                  </p>
                </div>
              </div>

              {/* 9. Important Technical Concepts Glossary */}
              {summary.importantTechnicalConcepts && summary.importantTechnicalConcepts.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs uppercase tracking-wider mb-3">
                    <Code2 className="h-4 w-4 text-sky-400" />
                    <span>9. Important Technical Concepts & Glossary</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {summary.importantTechnicalConcepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3"
                      >
                        <span className="font-mono text-xs font-bold text-sky-300">
                          {concept.term}
                        </span>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                          {concept.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              No summary data available.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-3 text-xs text-slate-400">
          <span>Grounded in paper title, venue, and authentic abstract.</span>
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
