import type { AnalysisInput, AnalysisFinding } from '../types';

export function checkDependencies(input: AnalysisInput): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  const { tree, fileContents } = input;
  const paths = tree.map(e => e.path);

  const hasPackageJson = paths.includes('package.json');
  const hasLockfile = paths.some(p =>
    p === 'package-lock.json' || p === 'yarn.lock' || p === 'pnpm-lock.yaml' || p === 'bun.lockb'
  );

  // No lockfile
  if (hasPackageJson && !hasLockfile) {
    findings.push({
      id: 'dep-no-lockfile',
      category: 'dependencies',
      severity: 'warning',
      title: 'No lockfile found',
      description: 'The project has a package.json but no lockfile (package-lock.json, yarn.lock, pnpm-lock.yaml).',
      file_path: 'package.json',
      suggestion: 'Run npm install, yarn install, or pnpm install to generate a lockfile for reproducible builds.',
    });
  }

  // Parse package.json for dependency analysis
  const pkgContent = fileContents.get('package.json');
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent);
      const deps = Object.keys(pkg.dependencies || {});
      const devDeps = Object.keys(pkg.devDependencies || {});

      // Check for devDependencies in production dependencies
      const devInProd = deps.filter(d =>
        d.includes('eslint') || d.includes('prettier') || d.includes('jest') ||
        d.includes('vitest') || d.includes('typescript') || d.includes('@types/') ||
        d.includes('webpack') || d.includes('rollup') || d.includes('vite') ||
        d.includes('nodemon') || d.includes('ts-node')
      );
      if (devInProd.length > 0) {
        findings.push({
          id: 'dep-dev-in-prod',
          category: 'dependencies',
          severity: 'warning',
          title: 'Dev dependencies in production',
          description: `The following packages are likely development tools but are listed in dependencies: ${devInProd.join(', ')}.`,
          file_path: 'package.json',
          suggestion: 'Move these packages to devDependencies to reduce production bundle size.',
        });
      }

      // Check for very large number of dependencies
      if (deps.length > 30) {
        findings.push({
          id: 'dep-too-many',
          category: 'dependencies',
          severity: 'info',
          title: 'Large number of dependencies',
          description: `The project has ${deps.length} production dependencies. This may increase bundle size and security surface.`,
          file_path: 'package.json',
          suggestion: 'Review dependencies and remove unused ones. Consider using bundler tree-shaking.',
        });
      }

      // No scripts defined
      if (!pkg.scripts || Object.keys(pkg.scripts).length === 0) {
        findings.push({
          id: 'dep-no-scripts',
          category: 'dependencies',
          severity: 'info',
          title: 'No npm scripts defined',
          description: 'No scripts are defined in package.json.',
          file_path: 'package.json',
          suggestion: 'Add common scripts like "dev", "build", "test", and "lint" for standardized workflows.',
        });
      }
    } catch {
      findings.push({
        id: 'dep-invalid-pkg',
        category: 'dependencies',
        severity: 'critical',
        title: 'Invalid package.json',
        description: 'The package.json file contains invalid JSON and cannot be parsed.',
        file_path: 'package.json',
        suggestion: 'Fix the JSON syntax errors in package.json.',
      });
    }
  }

  return findings;
}
