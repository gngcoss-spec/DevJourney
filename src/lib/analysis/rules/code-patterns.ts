import type { AnalysisInput, AnalysisFinding } from '../types';

export function checkCodePatterns(input: AnalysisInput): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  const { tree } = input;
  const blobs = tree.filter(e => e.type === 'blob');

  // Check for mixed JS/TS
  const jsFiles = blobs.filter(e => e.path.endsWith('.js') || e.path.endsWith('.jsx'));
  const tsFiles = blobs.filter(e => e.path.endsWith('.ts') || e.path.endsWith('.tsx'));

  // Exclude config files from the count
  const srcJsFiles = jsFiles.filter(e =>
    !e.path.includes('node_modules') &&
    !e.path.endsWith('.config.js') &&
    !e.path.endsWith('.config.mjs') &&
    !e.path.endsWith('.config.cjs') &&
    !e.path.startsWith('.')
  );
  const srcTsFiles = tsFiles.filter(e => !e.path.includes('node_modules'));

  if (srcJsFiles.length > 0 && srcTsFiles.length > 0) {
    const ratio = srcJsFiles.length / (srcJsFiles.length + srcTsFiles.length);
    if (ratio > 0.1 && ratio < 0.9) {
      findings.push({
        id: 'cp-mixed-js-ts',
        category: 'code-patterns',
        severity: 'warning',
        title: 'Mixed JavaScript and TypeScript files',
        description: `Found ${srcJsFiles.length} JS files and ${srcTsFiles.length} TS files. Mixing languages increases maintenance complexity.`,
        suggestion: 'Consider migrating all files to TypeScript for consistent type safety.',
      });
    }
  }

  // Check for large files (>500 lines estimated by size > 15KB)
  const largeFiles = blobs.filter(e =>
    e.size && e.size > 15000 &&
    (e.path.endsWith('.ts') || e.path.endsWith('.tsx') || e.path.endsWith('.js') || e.path.endsWith('.jsx'))
  );
  if (largeFiles.length > 0) {
    findings.push({
      id: 'cp-large-files',
      category: 'code-patterns',
      severity: 'info',
      title: 'Large source files detected',
      description: `${largeFiles.length} file(s) exceed 15KB, which may indicate they need to be split.`,
      file_path: largeFiles[0].path,
      suggestion: 'Break large files into smaller, focused modules for better readability and maintainability.',
    });
  }

  // Check for naming inconsistencies (mixed kebab-case and camelCase in same directory)
  const dirFiles = new Map<string, string[]>();
  blobs.forEach(e => {
    const parts = e.path.split('/');
    if (parts.length > 1) {
      const dir = parts.slice(0, -1).join('/');
      const filename = parts[parts.length - 1];
      if (!dirFiles.has(dir)) dirFiles.set(dir, []);
      dirFiles.get(dir)!.push(filename);
    }
  });

  let inconsistentDirs = 0;
  dirFiles.forEach((files) => {
    const sourceFiles = files.filter(f =>
      f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx')
    );
    if (sourceFiles.length < 3) return;
    const hasKebab = sourceFiles.some(f => f.includes('-'));
    const hasCamel = sourceFiles.some(f => /[a-z][A-Z]/.test(f.replace(/\.[^.]+$/, '')));
    if (hasKebab && hasCamel) inconsistentDirs++;
  });

  if (inconsistentDirs > 0) {
    findings.push({
      id: 'cp-naming-inconsistent',
      category: 'code-patterns',
      severity: 'info',
      title: 'Inconsistent file naming conventions',
      description: `${inconsistentDirs} director(ies) have mixed naming conventions (kebab-case and camelCase).`,
      suggestion: 'Adopt a consistent file naming convention across the project.',
    });
  }

  return findings;
}
