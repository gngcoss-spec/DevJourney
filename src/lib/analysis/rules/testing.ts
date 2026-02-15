import type { AnalysisInput, AnalysisFinding } from '../types';

export function checkTesting(input: AnalysisInput): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  const { tree, fileContents } = input;
  const paths = tree.map(e => e.path);
  const blobs = tree.filter(e => e.type === 'blob');

  // Check for test framework
  const pkgContent = fileContents.get('package.json');
  let hasTestFramework = false;
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      hasTestFramework = !!(
        allDeps['jest'] || allDeps['vitest'] || allDeps['mocha'] ||
        allDeps['ava'] || allDeps['tape'] || allDeps['cypress'] ||
        allDeps['playwright'] || allDeps['@playwright/test']
      );
    } catch {
      // skip
    }
  }

  if (!hasTestFramework && pkgContent) {
    findings.push({
      id: 'test-no-framework',
      category: 'testing',
      severity: 'warning',
      title: 'No test framework detected',
      description: 'No testing framework (Jest, Vitest, Mocha, etc.) was found in dependencies.',
      file_path: 'package.json',
      suggestion: 'Add a test framework like Vitest or Jest to enable automated testing.',
    });
  }

  // Check for CI configuration
  const hasCi = paths.some(p =>
    p.startsWith('.github/workflows/') ||
    p === '.gitlab-ci.yml' ||
    p === '.circleci/config.yml' ||
    p === 'Jenkinsfile' ||
    p === '.travis.yml' ||
    p === 'azure-pipelines.yml'
  );
  if (!hasCi) {
    findings.push({
      id: 'test-no-ci',
      category: 'testing',
      severity: 'info',
      title: 'No CI/CD configuration found',
      description: 'No continuous integration configuration was detected (GitHub Actions, GitLab CI, etc.).',
      suggestion: 'Add CI/CD configuration to automate testing and deployment.',
    });
  }

  // Check test file ratio
  const sourceFiles = blobs.filter(e =>
    (e.path.endsWith('.ts') || e.path.endsWith('.tsx') || e.path.endsWith('.js') || e.path.endsWith('.jsx')) &&
    !e.path.includes('node_modules') &&
    !e.path.endsWith('.config.ts') && !e.path.endsWith('.config.js') &&
    !e.path.endsWith('.config.mjs') && !e.path.endsWith('.config.cjs') &&
    !e.path.endsWith('.d.ts')
  );
  const testFiles = sourceFiles.filter(e =>
    e.path.includes('.test.') || e.path.includes('.spec.') ||
    e.path.includes('__tests__/') || e.path.includes('/test/')
  );
  const nonTestFiles = sourceFiles.filter(e =>
    !e.path.includes('.test.') && !e.path.includes('.spec.') &&
    !e.path.includes('__tests__/') && !e.path.includes('/test/')
  );

  if (nonTestFiles.length > 10 && testFiles.length === 0) {
    findings.push({
      id: 'test-no-tests',
      category: 'testing',
      severity: 'warning',
      title: 'No test files found',
      description: `Found ${nonTestFiles.length} source files but no test files.`,
      suggestion: 'Start adding tests for critical business logic and utilities.',
    });
  } else if (nonTestFiles.length > 10 && testFiles.length > 0) {
    const ratio = testFiles.length / nonTestFiles.length;
    if (ratio < 0.1) {
      findings.push({
        id: 'test-low-ratio',
        category: 'testing',
        severity: 'info',
        title: 'Low test coverage ratio',
        description: `Only ${testFiles.length} test files for ${nonTestFiles.length} source files (${(ratio * 100).toFixed(1)}% ratio).`,
        suggestion: 'Aim for better test coverage by adding tests for key modules.',
      });
    }
  }

  return findings;
}
