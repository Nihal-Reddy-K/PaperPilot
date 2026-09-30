import React, { useEffect, useState } from 'react';

interface LoadingIndicatorProps {
  type: 'search' | 'analysis' | 'comparison' | 'gaps';
}

const SEARCH_STAGES = [
  'Searching academic sources...',
  'Finding relevant papers...',
  'Analyzing metadata and citations...',
];

const ANALYSIS_STAGES = [
  'Reading available paper content...',
  'Extracting methodology and benchmarks...',
  'Synthesizing key findings...',
];

const COMPARISON_STAGES = [
  'Reading cross-paper problem formulations...',
  'Comparing experimental setups & metrics...',
  'Synthesizing architectural trade-offs...',
];

const GAPS_STAGES = [
  'Analyzing literature boundary conditions...',
  'Detecting unaddressed assumptions...',
  'Formulating potential research directions...',
];

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ type }) => {
  const [stageIndex, setStageIndex] = useState(0);

  const stages =
    type === 'search'
      ? SEARCH_STAGES
      : type === 'analysis'
      ? ANALYSIS_STAGES
      : type === 'comparison'
      ? COMPARISON_STAGES
      : GAPS_STAGES;

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % stages.length);
    }, 2200);

    return () => clearInterval(timer);
  }, [stages.length]);

  return (
    <div className="py-20 flex flex-col items-center justify-center space-y-3 select-none">
      {/* Subtle Linear-style pulsating bar */}
      <div className="w-36 h-0.5 bg-neutral-900 overflow-hidden rounded-full">
        <div className="h-full bg-neutral-300 w-1/3 rounded-full animate-indeterminate" />
      </div>

      {/* Subtle dynamic stage text */}
      <p className="text-xs text-neutral-400 font-medium transition-all duration-300">
        {stages[stageIndex]}
      </p>
    </div>
  );
};
