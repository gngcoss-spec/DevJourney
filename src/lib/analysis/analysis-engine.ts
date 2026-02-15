import type { AnalysisInput, AnalysisResult, AnalysisFinding, AnalysisSummary, RepoInfo, TreeEntry } from './types';
import { fetchRepoInfo, fetchRepoTree, fetchFileContent } from './github-api';
import { checkProjectStructure } from './rules/project-structure';
import { checkDependencies } from './rules/dependencies';
import { checkConfigQuality } from './rules/config-quality';
import { checkCodePatterns } from './rules/code-patterns';
import { checkSecurity } from './rules/security';
import { checkDocumentation } from './rules/documentation';
import { checkTesting } from './rules/testing';

const KEY_FILES = [
  'package.json',
  'tsconfig.json',
  '.gitignore',
  '.eslintrc.json',
  '.eslintrc.js',
  'eslint.config.js',
  'eslint.config.mjs',
  '.prettierrc',
  '.prettierrc.json',
  'biome.json',
  '.biome.json',
  'README.md',
  'readme.md',
];

const MAX_FILE_SIZE = 100_000; // 100KB max per file

async function fetchKeyFiles(
  owner: string,
  repo: string,
  tree: TreeEntry[]
): Promise<Map<string, string>> {
  const fileContents = new Map<string, string>();
  const paths = tree.map(e => e.path);

  const filesToFetch = KEY_FILES.filter(f => paths.includes(f));

  const results = await Promise.allSettled(
    filesToFetch.map(async (path) => {
      const entry = tree.find(e => e.path === path);
      if (entry?.size && entry.size > MAX_FILE_SIZE) return;
      const content = await fetchFileContent(owner, repo, path);
      return { path, content };
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      fileContents.set(result.value.path, result.value.content);
    }
  }

  return fileContents;
}

function computeSummary(findings: AnalysisFinding[]): AnalysisSummary {
  const byCategory: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};

  for (const f of findings) {
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
    bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
  }

  // Health score: start at 100, deduct per finding by severity
  const criticalCount = bySeverity['critical'] || 0;
  const warningCount = bySeverity['warning'] || 0;
  const infoCount = bySeverity['info'] || 0;

  let score = 100 - (criticalCount * 15) - (warningCount * 8) - (infoCount * 3);
  score = Math.max(0, Math.min(100, score));

  return {
    total_findings: findings.length,
    by_category: byCategory,
    by_severity: bySeverity,
    health_score: score,
  };
}

export async function analyzeRepo(
  owner: string,
  repo: string
): Promise<AnalysisResult> {
  // Fetch repo info
  const repoInfo: RepoInfo = await fetchRepoInfo(owner, repo);

  // Fetch file tree
  const tree: TreeEntry[] = await fetchRepoTree(owner, repo, repoInfo.default_branch);

  // Fetch key file contents
  const fileContents = await fetchKeyFiles(owner, repo, tree);

  // Build analysis input
  const input: AnalysisInput = { repoInfo, tree, fileContents };

  // Run all rule modules
  const findings: AnalysisFinding[] = [
    ...checkProjectStructure(input),
    ...checkDependencies(input),
    ...checkConfigQuality(input),
    ...checkCodePatterns(input),
    ...checkSecurity(input),
    ...checkDocumentation(input),
    ...checkTesting(input),
  ];

  // Compute summary
  const summary = computeSummary(findings);

  return { findings, summary };
}
