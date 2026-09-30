export interface AcademicPaper {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  venue: string | null;
  abstract: string;
  doi: string | null;
  sourceUrl: string;
  pdfUrl: string | null;
  citationCount: number | null;
  relevanceScore: number; // 0 - 100
  source: 'OpenAlex' | 'arXiv' | 'Crossref' | 'Semantic Scholar';
  isOpenAccess: boolean;
  fieldsOfStudy?: string[];
}

export interface SearchSourceStatus {
  source: string;
  status: 'ok' | 'degraded' | 'error';
  count: number;
  message?: string;
}

export interface SearchRequest {
  topic: string;
  keywords: string;
  startYear?: number;
  endYear?: number;
  limit: number;
}

export interface SearchResponse {
  queryUsed: string;
  optimizedQuery: string;
  expandedKeywords: string[];
  papers: AcademicPaper[];
  sourceStatuses: SearchSourceStatus[];
  totalFound: number;
}

export interface TechnicalConcept {
  term: string;
  definition: string;
}

export interface PaperSummary {
  paperId: string;
  paperTitle: string;
  researchProblem: string;
  motivation: string;
  proposedApproach: string;
  methodology: string;
  datasetBenchmark: string;
  keyResults: string;
  limitations: string;
  futureWork: string;
  importantTechnicalConcepts: TechnicalConcept[];
  relevanceToUserTopic: string;
  generatedAt: string;
}

export interface MethodologyAspect {
  aspect: string;
  breakdown: {
    paperTitle: string;
    approach: string;
  }[];
}

export interface BenchmarkComparisonItem {
  paperTitle: string;
  workloadsOrDatasets: string;
  hardwareOrTestbed: string;
  reportedKeyMetrics: string;
}

export interface PaperComparison {
  paperIds: string[];
  paperTitles: string[];
  commonThemes: string[];
  keyDifferences: string[];
  methodologyComparison: MethodologyAspect[];
  benchmarkComparison: BenchmarkComparisonItem[];
  tradeoffSynthesis: string;
  researchGaps: string[];
  recommendations: string[];
  generatedAt: string;
}

export interface StructuredResearchGap {
  possibleGap: string;
  whyUnderexplored: string;
  evidenceFromLiterature: string;
  supportingPapers: string[];
  potentialResearchDirection: string;
}

export interface ResearchGapsResponse {
  topic: string;
  gaps: StructuredResearchGap[];
  analyzedPapersCount: number;
  disclaimer: string;
  generatedAt: string;
}

export interface SearchHistoryItem {
  id: string;
  topic: string;
  keywords: string;
  paperCount: number;
  date: string;
  timestamp: number;
  papers: AcademicPaper[];
  searchResponse?: SearchResponse;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
