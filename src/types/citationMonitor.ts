import type { AcademicPaper } from './paper.ts';

export interface CitationHistoryEntry {
  timestamp: number;
  count: number;
  delta?: number;
  sourceQuery?: string;
  note?: string;
}

export interface MonitoredPaper {
  id: string;
  paper: AcademicPaper;
  initialCitationCount: number;
  latestCitationCount: number;
  totalNewCitations: number;
  trackedSince: number;
  lastCheckedAt: number;
  lastDiscoveryAt?: number;
  history: CitationHistoryEntry[];
  status: 'active' | 'paused';
}

export interface CitationAlert {
  id: string;
  paperId: string;
  paperTitle: string;
  previousCount: number;
  newCount: number;
  delta: number;
  timestamp: number;
  searchTopic: string;
  read: boolean;
}
