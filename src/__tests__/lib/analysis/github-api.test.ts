import { describe, it, expect } from 'vitest';
import { parseGitHubUrl } from '@/lib/analysis/github-api';

describe('parseGitHubUrl', () => {
  it('should parse standard GitHub URL', () => {
    const result = parseGitHubUrl('https://github.com/facebook/react');
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  it('should parse URL with .git suffix', () => {
    const result = parseGitHubUrl('https://github.com/facebook/react.git');
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  it('should parse URL with branch path', () => {
    const result = parseGitHubUrl('https://github.com/facebook/react/tree/main');
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  it('should parse URL without protocol', () => {
    const result = parseGitHubUrl('github.com/vercel/next.js');
    expect(result).toEqual({ owner: 'vercel', repo: 'next.js' });
  });

  it('should parse URL with trailing slash', () => {
    const result = parseGitHubUrl('https://github.com/facebook/react/');
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  it('should throw for invalid URL', () => {
    expect(() => parseGitHubUrl('https://gitlab.com/owner/repo')).toThrow('Invalid GitHub URL format');
  });

  it('should throw for empty string', () => {
    expect(() => parseGitHubUrl('')).toThrow('Invalid GitHub URL format');
  });

  it('should throw for URL without repo', () => {
    expect(() => parseGitHubUrl('https://github.com/owner')).toThrow('Invalid GitHub URL format');
  });
});
