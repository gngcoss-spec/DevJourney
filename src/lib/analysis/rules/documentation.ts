import type { AnalysisInput, AnalysisFinding } from '../types';

export function checkDocumentation(input: AnalysisInput): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  const { tree } = input;
  const paths = tree.map(e => e.path);

  // Check for README
  const hasReadme = paths.some(p =>
    p.toLowerCase() === 'readme.md' || p.toLowerCase() === 'readme' ||
    p.toLowerCase() === 'readme.txt' || p.toLowerCase() === 'readme.rst'
  );
  if (!hasReadme) {
    findings.push({
      id: 'doc-no-readme',
      category: 'documentation',
      severity: 'warning',
      title: 'No README file',
      description: 'The project is missing a README file. A README is essential for project documentation.',
      suggestion: 'Add a README.md with project description, setup instructions, and usage examples.',
    });
  }

  // Check for LICENSE
  const hasLicense = paths.some(p =>
    p.toLowerCase() === 'license' || p.toLowerCase() === 'license.md' ||
    p.toLowerCase() === 'license.txt' || p.toLowerCase() === 'licence' ||
    p.toLowerCase() === 'licence.md' || p.toLowerCase() === 'copying'
  );
  if (!hasLicense) {
    findings.push({
      id: 'doc-no-license',
      category: 'documentation',
      severity: 'info',
      title: 'No LICENSE file',
      description: 'The project does not include a LICENSE file. Without a license, the code is under default copyright.',
      suggestion: 'Add an appropriate open source license (MIT, Apache-2.0, etc.) or a proprietary license.',
    });
  }

  // Check for CONTRIBUTING guide
  const hasContributing = paths.some(p =>
    p.toLowerCase() === 'contributing.md' || p.toLowerCase() === 'contributing'
  );

  // Check for CHANGELOG
  const hasChangelog = paths.some(p =>
    p.toLowerCase() === 'changelog.md' || p.toLowerCase() === 'changelog' ||
    p.toLowerCase() === 'changes.md' || p.toLowerCase() === 'history.md'
  );

  // Check for docs/ directory
  const hasDocs = paths.some(p => p.startsWith('docs/') || p.startsWith('doc/'));

  // Only report missing docs for projects that seem established
  const fileCount = tree.filter(e => e.type === 'blob').length;
  if (fileCount > 20 && !hasDocs && !hasContributing && !hasChangelog) {
    findings.push({
      id: 'doc-minimal',
      category: 'documentation',
      severity: 'info',
      title: 'Minimal documentation',
      description: 'The project has no docs/ directory, CONTRIBUTING guide, or CHANGELOG. For a project of this size, more documentation would help contributors.',
      suggestion: 'Consider adding a docs/ directory with guides, a CONTRIBUTING.md, and a CHANGELOG.md.',
    });
  }

  return findings;
}
