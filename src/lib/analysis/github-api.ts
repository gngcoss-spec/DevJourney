import type { RepoInfo, TreeEntry } from './types';

const GITHUB_API = 'https://api.github.com';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  // process.env.GITHUB_TOKEN for server-side only
  if (typeof process !== 'undefined' && process.env?.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } {
  // Support formats:
  // https://github.com/owner/repo
  // https://github.com/owner/repo.git
  // https://github.com/owner/repo/tree/branch
  // github.com/owner/repo
  const cleaned = url.replace(/\.git$/, '').replace(/\/$/, '');
  const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL format');
  }
  return { owner: match[1], repo: match[2] };
}

export async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers: getHeaders() });
  if (!res.ok) {
    if (res.status === 404) throw new Error('Repository not found');
    throw new Error(`GitHub API error: ${res.status}`);
  }
  const data = await res.json();
  return {
    owner,
    repo,
    default_branch: data.default_branch,
    description: data.description,
    language: data.language,
    size: data.size,
    stars: data.stargazers_count,
    forks: data.forks_count,
    open_issues: data.open_issues_count,
    created_at: data.created_at,
    updated_at: data.updated_at,
    topics: data.topics || [],
  };
}

export async function fetchRepoTree(owner: string, repo: string, branch: string): Promise<TreeEntry[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: getHeaders() }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch repository tree: ${res.status}`);
  }
  const data = await res.json();
  if (data.truncated) {
    // Large repos may have truncated trees; we still work with what we have
    console.warn('Repository tree was truncated due to size');
  }
  return (data.tree || []).map((entry: { path: string; type: string; size?: number }) => ({
    path: entry.path,
    type: entry.type as 'blob' | 'tree',
    size: entry.size,
  }));
}

export async function fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { headers: getHeaders() }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch file: ${path}`);
  }
  const data = await res.json();
  if (data.encoding === 'base64' && data.content) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  return data.content || '';
}
