import { describe, it, expect } from 'vitest';
import { checkProjectStructure } from '@/lib/analysis/rules/project-structure';
import { checkDependencies } from '@/lib/analysis/rules/dependencies';
import { checkConfigQuality } from '@/lib/analysis/rules/config-quality';
import { checkCodePatterns } from '@/lib/analysis/rules/code-patterns';
import { checkSecurity } from '@/lib/analysis/rules/security';
import { checkDocumentation } from '@/lib/analysis/rules/documentation';
import { checkTesting } from '@/lib/analysis/rules/testing';
import type { AnalysisInput, RepoInfo } from '@/lib/analysis/types';

function createMockInput(overrides: Partial<AnalysisInput> = {}): AnalysisInput {
  return {
    repoInfo: {
      owner: 'test',
      repo: 'repo',
      default_branch: 'main',
      description: null,
      language: 'TypeScript',
      size: 1000,
      stars: 0,
      forks: 0,
      open_issues: 0,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      topics: [],
    },
    tree: [],
    fileContents: new Map(),
    ...overrides,
  };
}

describe('Project Structure Rules', () => {
  it('should warn when no src/ directory exists', () => {
    const input = createMockInput({
      tree: [{ path: 'index.js', type: 'blob' }],
    });
    const findings = checkProjectStructure(input);
    expect(findings.some(f => f.id === 'ps-no-src')).toBe(true);
  });

  it('should not warn when src/ directory exists', () => {
    const input = createMockInput({
      tree: [{ path: 'src/index.ts', type: 'blob' }],
    });
    const findings = checkProjectStructure(input);
    expect(findings.some(f => f.id === 'ps-no-src')).toBe(false);
  });

  it('should warn when no test files exist', () => {
    const input = createMockInput({
      tree: [{ path: 'src/index.ts', type: 'blob' }],
    });
    const findings = checkProjectStructure(input);
    expect(findings.some(f => f.id === 'ps-no-tests')).toBe(true);
  });

  it('should not warn when test files exist', () => {
    const input = createMockInput({
      tree: [
        { path: 'src/index.ts', type: 'blob' },
        { path: 'src/__tests__/index.test.ts', type: 'blob' },
      ],
    });
    const findings = checkProjectStructure(input);
    expect(findings.some(f => f.id === 'ps-no-tests')).toBe(false);
  });

  it('should detect deeply nested files', () => {
    const input = createMockInput({
      tree: [{ path: 'a/b/c/d/e/f/g/h.ts', type: 'blob' }],
    });
    const findings = checkProjectStructure(input);
    expect(findings.some(f => f.id === 'ps-deep-nesting')).toBe(true);
  });
});

describe('Dependencies Rules', () => {
  it('should warn when lockfile is missing', () => {
    const input = createMockInput({
      tree: [{ path: 'package.json', type: 'blob' }],
    });
    const findings = checkDependencies(input);
    expect(findings.some(f => f.id === 'dep-no-lockfile')).toBe(true);
  });

  it('should not warn when lockfile exists', () => {
    const input = createMockInput({
      tree: [
        { path: 'package.json', type: 'blob' },
        { path: 'package-lock.json', type: 'blob' },
      ],
    });
    const findings = checkDependencies(input);
    expect(findings.some(f => f.id === 'dep-no-lockfile')).toBe(false);
  });

  it('should detect dev dependencies in production', () => {
    const contents = new Map([
      ['package.json', JSON.stringify({
        dependencies: { 'eslint': '^8.0.0', 'react': '^18.0.0' },
        devDependencies: {},
      })],
    ]);
    const input = createMockInput({
      tree: [{ path: 'package.json', type: 'blob' }],
      fileContents: contents,
    });
    const findings = checkDependencies(input);
    expect(findings.some(f => f.id === 'dep-dev-in-prod')).toBe(true);
  });

  it('should detect invalid package.json', () => {
    const contents = new Map([['package.json', '{ invalid json']]);
    const input = createMockInput({
      tree: [{ path: 'package.json', type: 'blob' }],
      fileContents: contents,
    });
    const findings = checkDependencies(input);
    expect(findings.some(f => f.id === 'dep-invalid-pkg')).toBe(true);
  });
});

describe('Config Quality Rules', () => {
  it('should warn when .gitignore is missing', () => {
    const input = createMockInput({ tree: [] });
    const findings = checkConfigQuality(input);
    expect(findings.some(f => f.id === 'cfg-no-gitignore')).toBe(true);
  });

  it('should warn when TypeScript strict mode is not enabled', () => {
    const contents = new Map([['tsconfig.json', '{ "compilerOptions": {} }']]);
    const input = createMockInput({
      tree: [{ path: 'tsconfig.json', type: 'blob' }],
      fileContents: contents,
    });
    const findings = checkConfigQuality(input);
    expect(findings.some(f => f.id === 'cfg-no-strict')).toBe(true);
  });

  it('should not warn when strict mode is enabled', () => {
    const contents = new Map([['tsconfig.json', '{ "compilerOptions": { "strict": true } }']]);
    const input = createMockInput({
      tree: [{ path: 'tsconfig.json', type: 'blob' }],
      fileContents: contents,
    });
    const findings = checkConfigQuality(input);
    expect(findings.some(f => f.id === 'cfg-no-strict')).toBe(false);
  });
});

describe('Code Patterns Rules', () => {
  it('should detect mixed JS and TS files', () => {
    const input = createMockInput({
      tree: [
        { path: 'src/a.js', type: 'blob' },
        { path: 'src/b.js', type: 'blob' },
        { path: 'src/c.ts', type: 'blob' },
        { path: 'src/d.ts', type: 'blob' },
      ],
    });
    const findings = checkCodePatterns(input);
    expect(findings.some(f => f.id === 'cp-mixed-js-ts')).toBe(true);
  });

  it('should detect large files', () => {
    const input = createMockInput({
      tree: [{ path: 'src/big.ts', type: 'blob', size: 20000 }],
    });
    const findings = checkCodePatterns(input);
    expect(findings.some(f => f.id === 'cp-large-files')).toBe(true);
  });
});

describe('Security Rules', () => {
  it('should detect committed .env files', () => {
    const input = createMockInput({
      tree: [{ path: '.env', type: 'blob' }],
    });
    const findings = checkSecurity(input);
    expect(findings.some(f => f.id === 'sec-env-exposed')).toBe(true);
  });

  it('should not flag .env.example', () => {
    const input = createMockInput({
      tree: [{ path: '.env.example', type: 'blob' }],
    });
    const findings = checkSecurity(input);
    expect(findings.some(f => f.id === 'sec-env-exposed')).toBe(false);
  });

  it('should detect secret files', () => {
    const input = createMockInput({
      tree: [{ path: 'credentials.json', type: 'blob' }],
    });
    const findings = checkSecurity(input);
    expect(findings.some(f => f.id === 'sec-secret-files')).toBe(true);
  });
});

describe('Documentation Rules', () => {
  it('should warn when README is missing', () => {
    const input = createMockInput({ tree: [] });
    const findings = checkDocumentation(input);
    expect(findings.some(f => f.id === 'doc-no-readme')).toBe(true);
  });

  it('should not warn when README.md exists', () => {
    const input = createMockInput({
      tree: [{ path: 'README.md', type: 'blob' }],
    });
    const findings = checkDocumentation(input);
    expect(findings.some(f => f.id === 'doc-no-readme')).toBe(false);
  });

  it('should note missing LICENSE', () => {
    const input = createMockInput({ tree: [] });
    const findings = checkDocumentation(input);
    expect(findings.some(f => f.id === 'doc-no-license')).toBe(true);
  });
});

describe('Testing Rules', () => {
  it('should warn when no test framework is found', () => {
    const contents = new Map([
      ['package.json', JSON.stringify({ dependencies: { react: '^18' }, devDependencies: {} })],
    ]);
    const input = createMockInput({
      tree: [{ path: 'package.json', type: 'blob' }],
      fileContents: contents,
    });
    const findings = checkTesting(input);
    expect(findings.some(f => f.id === 'test-no-framework')).toBe(true);
  });

  it('should not warn when vitest is a dependency', () => {
    const contents = new Map([
      ['package.json', JSON.stringify({ dependencies: {}, devDependencies: { vitest: '^1.0' } })],
    ]);
    const input = createMockInput({
      tree: [{ path: 'package.json', type: 'blob' }],
      fileContents: contents,
    });
    const findings = checkTesting(input);
    expect(findings.some(f => f.id === 'test-no-framework')).toBe(false);
  });

  it('should detect missing CI configuration', () => {
    const input = createMockInput({ tree: [] });
    const findings = checkTesting(input);
    expect(findings.some(f => f.id === 'test-no-ci')).toBe(true);
  });

  it('should not warn about CI when GitHub Actions exist', () => {
    const input = createMockInput({
      tree: [{ path: '.github/workflows/ci.yml', type: 'blob' }],
    });
    const findings = checkTesting(input);
    expect(findings.some(f => f.id === 'test-no-ci')).toBe(false);
  });
});
