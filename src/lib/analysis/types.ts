export interface RepoInfo {
  owner: string;
  repo: string;
  default_branch: string;
  description: string | null;
  language: string | null;
  size: number;
  stars: number;
  forks: number;
  open_issues: number;
  created_at: string;
  updated_at: string;
  topics: string[];
}

export interface TreeEntry {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
}

export interface AnalysisInput {
  repoInfo: RepoInfo;
  tree: TreeEntry[];
  fileContents: Map<string, string>;
}

export type FindingCategory =
  | 'project-structure'
  | 'dependencies'
  | 'config-quality'
  | 'code-patterns'
  | 'security'
  | 'documentation'
  | 'testing';

export type FindingSeverity = 'info' | 'warning' | 'critical';

export interface AnalysisFinding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  file_path?: string;
  suggestion: string;
}

export interface AnalysisSummary {
  total_findings: number;
  by_category: Record<string, number>;
  by_severity: Record<string, number>;
  health_score: number;
}

export interface AnalysisResult {
  findings: AnalysisFinding[];
  summary: AnalysisSummary;
}

export type RuleModule = (input: AnalysisInput) => AnalysisFinding[];
