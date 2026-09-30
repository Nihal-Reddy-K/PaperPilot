import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  Calendar,
  Layers,
  Tag,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
} from 'lucide-react';
import type { SearchRequest, SearchSourceStatus } from '../types/paper.ts';

interface SearchHeaderProps {
  onSearch: (params: SearchRequest) => void;
  isLoading: boolean;
  sourceStatuses?: SearchSourceStatus[];
  optimizedQuery?: string;
  expandedKeywords?: string[];
}

const PRESET_TOPICS = [
  {
    topic: 'Cache contention aware CPU workload placement',
    keywords: 'LLC, cache contention, CPU scheduling, workload interference',
    startYear: 2020,
    endYear: 2026,
    limit: 10,
  },
  {
    topic: 'Efficient KV cache compression for long-context LLMs',
    keywords: 'KV cache, attention quantization, context window, token eviction',
    startYear: 2022,
    endYear: 2026,
    limit: 10,
  },
  {
    topic: 'Differential privacy in decentralized federated learning',
    keywords: 'differential privacy, federated learning, gradient leakage, noise addition',
    startYear: 2021,
    endYear: 2026,
    limit: 10,
  },
  {
    topic: 'Zero-Knowledge succinct non-interactive arguments of knowledge (zk-SNARKs)',
    keywords: 'zk-SNARKs, polynomial commitments, prover complexity, arithmetic circuits',
    startYear: 2020,
    endYear: 2026,
    limit: 10,
  },
];

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onSearch,
  isLoading,
  sourceStatuses,
  optimizedQuery,
  expandedKeywords,
}) => {
  const [topic, setTopic] = useState('Cache contention aware CPU workload placement');
  const [keywords, setKeywords] = useState('LLC, cache contention, CPU scheduling, workload interference');
  const [startYear, setStartYear] = useState<number | ''>(2020);
  const [endYear, setEndYear] = useState<number | ''>(2026);
  const [limit, setLimit] = useState<number>(10);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && !keywords.trim()) return;

    onSearch({
      topic: topic.trim(),
      keywords: keywords.trim(),
      startYear: startYear === '' ? undefined : Number(startYear),
      endYear: endYear === '' ? undefined : Number(endYear),
      limit: Number(limit) || 10,
    });
  };

  const applyPreset = (preset: typeof PRESET_TOPICS[0]) => {
    setTopic(preset.topic);
    setKeywords(preset.keywords);
    setStartYear(preset.startYear);
    setEndYear(preset.endYear);
    setLimit(preset.limit);
    onSearch({
      topic: preset.topic,
      keywords: preset.keywords,
      startYear: preset.startYear,
      endYear: preset.endYear,
      limit: preset.limit,
    });
  };

  return (
    <div className="relative border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header Text */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Academic Search & Paper Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
            Discover & Synthesize <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300">Academic Literature</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Retrieve genuine papers from OpenAlex, arXiv, and Crossref. Generate 10-point deep technical summaries and multi-paper comparative matrices with Gemini.
          </p>
        </div>

        {/* Search Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-xl backdrop-blur-md"
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Topic Input */}
            <div className="lg:col-span-7">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-indigo-400" />
                Research Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Cache contention aware CPU workload placement"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            {/* Keywords Input */}
            <div className="lg:col-span-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-sky-400" />
                Key Terms & Concepts
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. LLC, cache contention, CPU scheduling"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Secondary Controls Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Year Range */}
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Years:</span>
                <input
                  type="number"
                  min="1990"
                  max="2030"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value ? Number(e.target.value) : '')}
                  placeholder="2020"
                  className="w-14 rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-center text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="text-slate-500">–</span>
                <input
                  type="number"
                  min="1990"
                  max="2030"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value ? Number(e.target.value) : '')}
                  placeholder="2026"
                  className="w-14 rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-center text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Number of papers */}
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span>Retrieve:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={5}>5 papers</option>
                  <option value={10}>10 papers</option>
                  <option value={15}>15 papers</option>
                  <option value={20}>20 papers</option>
                  <option value={25}>25 papers</option>
                </select>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all ${
                isLoading
                  ? 'opacity-70 cursor-wait'
                  : 'hover:from-indigo-500 hover:to-sky-400 hover:shadow-indigo-600/40 active:scale-[0.98] cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Searching Sources...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Find Papers</span>
                  <ArrowRight className="h-4 w-4 opacity-70" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preset Queries */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Try Topic Example:</span>
          {PRESET_TOPICS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {preset.topic.length > 32 ? preset.topic.slice(0, 32) + '...' : preset.topic}
            </button>
          ))}
        </div>

        {/* Source Status & AI Query Optimization feedback */}
        {(sourceStatuses || optimizedQuery || expandedKeywords) && (
          <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Sources Checked */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-slate-400">
                  <Database className="h-3.5 w-3.5 text-indigo-400" />
                  Academic Sources:
                </span>
                {sourceStatuses?.map((s) => (
                  <div
                    key={s.source}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
                      s.status === 'ok'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    {s.status === 'ok' ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-amber-400" />
                    )}
                    <span>{s.source}</span>
                    <span className="font-bold">({s.count})</span>
                  </div>
                ))}
              </div>

              {/* Optimized Query Info */}
              {optimizedQuery && (
                <div className="text-slate-400 truncate max-w-md">
                  <span className="text-slate-500">Query formulation: </span>
                  <span className="font-mono text-indigo-300">"{optimizedQuery}"</span>
                </div>
              )}
            </div>

            {/* Expanded Keywords */}
            {expandedKeywords && expandedKeywords.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-slate-800/60 pt-2 text-slate-400">
                <span className="text-slate-500 font-medium">Domain Synonyms:</span>
                {expandedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-800"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
