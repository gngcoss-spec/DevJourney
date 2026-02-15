import type { AnalysisInput, AnalysisFinding } from '../types';

export function checkProjectStructure(input: AnalysisInput): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  const { tree } = input;
  const paths = tree.map(e => e.path);

  // Check for src/ directory
  const hasSrc = paths.some(p => p.startsWith('src/') || p === 'src');
  if (!hasSrc) {
    findings.push({
      id: 'ps-no-src',
      category: 'project-structure',
      severity: 'warning',
      title: 'No src/ directory found',
      description: 'The project does not have a src/ directory. Organizing source code in a dedicated directory improves maintainability.',
      suggestion: 'Create a src/ directory and move source files into it.',
    });
  }

  // Check for test directory
  const hasTests = paths.some(p =>
    p.startsWith('test/') || p.startsWith('tests/') ||
    p.startsWith('__tests__/') || p.startsWith('spec/') ||
    p.includes('/test/') || p.includes('/tests/') ||
    p.includes('/__tests__/') || p.includes('.test.') || p.includes('.spec.')
  );
  if (!hasTests) {
    findings.push({
      id: 'ps-no-tests',
      category: 'project-structure',
      severity: 'warning',
      title: 'No test directory or test files found',
      description: 'No test directory (test/, tests/, __tests__/) or test files (.test.*, .spec.*) were found.',
      suggestion: 'Add a test directory and start writing unit tests for critical functionality.',
    });
  }

  // Check for deeply nested directories (more than 7 levels)
  const deepFiles = paths.filter(p => p.split('/').length > 7);
  if (deepFiles.length > 0) {
    findings.push({
      id: 'ps-deep-nesting',
      category: 'project-structure',
      severity: 'info',
      title: 'Deeply nested directory structure',
      description: `${deepFiles.length} file(s) are nested more than 7 levels deep, which can make navigation difficult.`,
      file_path: deepFiles[0],
      suggestion: 'Consider flattening the directory structure to reduce nesting complexity.',
    });
  }

  // Check for too many top-level files (more than 15)
  const topLevelFiles = tree.filter(e => e.type === 'blob' && !e.path.includes('/'));
  if (topLevelFiles.length > 15) {
    findings.push({
      id: 'ps-too-many-root-files',
      category: 'project-structure',
      severity: 'info',
      title: 'Too many files in root directory',
      description: `Found ${topLevelFiles.length} files in the root directory. This can make the project harder to navigate.`,
      suggestion: 'Move configuration and utility files into appropriate subdirectories.',
    });
  }

  return findings;
}
