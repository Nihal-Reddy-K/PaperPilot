import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  Plus,
  X,
  Calendar,
  Layers,
  Filter,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import type { SearchRequest } from '../types/paper.ts';

interface SearchComposerProps {
  onSearch: (params: SearchRequest) => void;
  isLoading: boolean;
  compact?: boolean;
  initialTopic?: string;
  initialKeywords?: string;
}

const PRESET_TOPICS = [
  {
    topic: 'Cache contention aware CPU workload placement',
    keywords: 'LLC, cache contention, CPU scheduling, workload interference',
  },
  {
    topic: 'KV cache compression in long-context Large Language Models',
    keywords: 'KV cache, attention quantization, context window, token eviction',
  },
  {
    topic: 'Differential privacy in decentralized federated learning',
    keywords: 'differential privacy, federated learning, gradient leakage',
  },
  {
    topic: 'Zero-Knowledge succinct non-interactive arguments (zk-SNARKs)',
    keywords: 'zk-SNARKs, polynomial commitments, prover complexity',
  },
];

export const SearchComposer: React.FC<SearchComposerProps> = ({
  onSearch,
  isLoading,
  compact = false,
  initialTopic = '',
  initialKeywords = '',
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [keywords, setKeywords] = useState(initialKeywords);
  const [showKeywordInput, setShowKeywordInput] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [startYear, setStartYear] = useState<number | ''>(2020);
  const [endYear, setEndYear] = useState<number | ''>(2026);
  const [limit, setLimit] = useState<number>(10);
  const [showFilters, setShowFilters] = useState(false);

  // Sync if initialTopic changes
  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialKeywords) setKeywords(initialKeywords);
  }, [initialTopic, initialKeywords]);

  const keywordList = keywords
    ? keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [];

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const updated = [...keywordList, newKeyword.trim()].join(', ');
    setKeywords(updated);
    setNewKeyword('');
    setShowKeywordInput(false);
  };

  const handleRemoveKeyword = (index: number) => {
    const updated = keywordList.filter((_, i) => i !== index).join(', ');
    setKeywords(updated);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() && !keywords.trim()) return;

    onSearch({
      topic: topic.trim(),
      keywords: keywords.trim(),
      startYear: startYear === '' ? undefined : Number(startYear),
      endYear: endYear === '' ? undefined : Number(endYear),
      limit: Number(limit) || 10,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (compact) {
    return (
      <div className="w-full border-b border-neutral-850 bg-neutral-950/80 backdrop-blur-md px-4 py-3 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative rounded-lg border border-neutral-800 bg-neutral-900/90 focus-within:border-neutral-600 transition-colors">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Search academic research..."
              className="w-full bg-transparent px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-400" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => handleSubmit()}
            disabled={isLoading || !topic.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-950 hover:bg-white disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
            <span>Search</span>
          </button>
        </div>

        {/* Compact filters expansion */}
        {showFilters && (
          <div className="max-w-4xl mx-auto mt-2.5 pt-2.5 border-t border-neutral-850 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Years:</span>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value ? Number(e.target.value) : '')}
                className="w-16 rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-center text-xs text-neutral-200"
              />
              <span className="text-neutral-600">–</span>
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value ? Number(e.target.value) : '')}
                className="w-16 rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-center text-xs text-neutral-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Retrieve:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="rounded border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs text-neutral-200"
              >
                <option value={5}>5 papers</option>
                <option value={10}>10 papers</option>
                <option value={15}>15 papers</option>
                <option value={20}>20 papers</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
              <span className="text-neutral-500">Keywords:</span>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. LLC, scheduling, contention"
                className="flex-1 rounded border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs text-neutral-200 placeholder-neutral-600"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Center Hero Search Composer (like Perplexity / ChatGPT)
  return (
    <div className="w-full max-w-2xl mx-auto my-auto px-4 py-12 flex flex-col items-center">
      {/* Centered Brand Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-100">
          PaperPilot
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Find, understand, and connect academic research.
        </p>
      </div>

      {/* Main Search Composer Box */}
      <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm hover:border-neutral-750 focus-within:border-neutral-700 transition-colors">
        {/* Label */}
        <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-2">
          What are you researching?
        </label>

        {/* Textarea Input */}
        <textarea
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Cache contention aware CPU workload placement"
          className="w-full resize-none bg-transparent text-sm sm:text-base text-neutral-100 placeholder-neutral-500 focus:outline-none leading-relaxed"
          autoFocus
        />

        {/* Keyword Tags Pill Area */}
        <div className="mt-3 pt-3 border-t border-neutral-850/80 flex flex-wrap items-center gap-2">
          {keywordList.map((kw, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md border border-neutral-750 bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200"
            >
              <span>{kw}</span>
              <button
                type="button"
                onClick={() => handleRemoveKeyword(idx)}
                className="text-neutral-400 hover:text-neutral-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {showKeywordInput ? (
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  } else if (e.key === 'Escape') {
                    setShowKeywordInput(false);
                  }
                }}
                placeholder="Add keyword..."
                className="h-6 w-32 rounded border border-neutral-700 bg-neutral-950 px-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="text-xs text-neutral-300 hover:text-white px-1"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowKeywordInput(true)}
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-neutral-700/80 px-2 py-0.5 text-xs text-neutral-400 hover:border-neutral-600 hover:text-neutral-200 transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>Add keywords</span>
            </button>
          )}
        </div>

        {/* Bottom Options & Search Action Row */}
        <div className="mt-4 pt-3 border-t border-neutral-850 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Controls: Year & Count */}
          <div className="flex flex-wrap items-center gap-3 text-neutral-400">
            {/* Year Range */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-neutral-500" />
              <input
                type="number"
                min="1990"
                max="2030"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value ? Number(e.target.value) : '')}
                placeholder="2020"
                className="w-14 rounded border border-neutral-800 bg-neutral-950 px-1 py-0.5 text-center text-xs text-neutral-200"
              />
              <span className="text-neutral-600">–</span>
              <input
                type="number"
                min="1990"
                max="2030"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value ? Number(e.target.value) : '')}
                placeholder="2026"
                className="w-14 rounded border border-neutral-800 bg-neutral-950 px-1 py-0.5 text-center text-xs text-neutral-200"
              />
            </div>

            {/* Papers Limit */}
            <div className="flex items-center gap-1.5 border-l border-neutral-800 pl-3">
              <Layers className="h-3.5 w-3.5 text-neutral-500" />
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="rounded border border-neutral-800 bg-neutral-950 px-1.5 py-0.5 text-xs text-neutral-200"
              >
                <option value={5}>5 papers</option>
                <option value={10}>10 papers</option>
                <option value={15}>15 papers</option>
                <option value={20}>20 papers</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isLoading || (!topic.trim() && !keywords.trim())}
            className="flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-white disabled:opacity-50 transition-all cursor-pointer shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <span>Search</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Research Inquiries */}
      <div className="mt-8 w-full max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-2.5">
          Example Research Topics
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_TOPICS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTopic(item.topic);
                setKeywords(item.keywords);
                onSearch({
                  topic: item.topic,
                  keywords: item.keywords,
                  startYear: startYear === '' ? undefined : Number(startYear),
                  endYear: endYear === '' ? undefined : Number(endYear),
                  limit,
                });
              }}
              className="text-left rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-2.5 hover:border-neutral-700 hover:bg-neutral-900 transition-colors"
            >
              <p className="text-xs font-medium text-neutral-200 line-clamp-1">
                {item.topic}
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-500 line-clamp-1">
                {item.keywords}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
