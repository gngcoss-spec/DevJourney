import type { AnalysisInput, AnalysisFinding } from '../types';

export function checkConfigQuality(input: AnalysisInput): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  const { tree, fileContents } = input;
  const paths = tree.map(e => e.path);

  // Check for .gitignore
  if (!paths.includes('.gitignore')) {
    findings.push({
      id: 'cfg-no-gitignore',
      category: 'config-quality',
      severity: 'warning',
      title: 'No .gitignore file',
      description: 'The project is missing a .gitignore file. This may lead to committing unwanted files.',
      suggestion: 'Add a .gitignore file appropriate for your project type.',
    });
  }

  // Check TypeScript strict mode
  const tsConfigContent = fileContents.get('tsconfig.json');
  if (tsConfigContent) {
    try {
      // Simple check - JSON.parse won't work with comments, so use regex
      const hasStrict = tsConfigContent.includes('"strict"') && tsConfigContent.includes('true');
      if (!hasStrict) {
        findings.push({
          id: 'cfg-no-strict',
          category: 'config-quality',
          severity: 'warning',
          title: 'TypeScript strict mode not enabled',
          description: 'The tsconfig.json does not have "strict": true. Strict mode catches more potential errors.',
          file_path: 'tsconfig.json',
          suggestion: 'Enable "strict": true in tsconfig.json compilerOptions.',
        });
      }
    } catch {
      // tsconfig can have comments, skip parse errors
    }
  }

  // Check for linter config
  const hasLintConfig = paths.some(p =>
    p === '.eslintrc' || p === '.eslintrc.js' || p === '.eslintrc.json' ||
    p === '.eslintrc.yml' || p === '.eslintrc.yaml' || p === '.eslintrc.cjs' ||
    p === 'eslint.config.js' || p === 'eslint.config.mjs' || p === 'eslint.config.ts' ||
    p === '.biome.json' || p === 'biome.json' ||
    p === '.oxlintrc.json'
  );
  if (!hasLintConfig) {
    // Also check package.json for eslintConfig
    const pkgContent = fileContents.get('package.json');
    const hasEslintInPkg = pkgContent?.includes('"eslintConfig"');
    if (!hasEslintInPkg) {
      findings.push({
        id: 'cfg-no-linter',
        category: 'config-quality',
        severity: 'info',
        title: 'No linter configuration found',
        description: 'No ESLint, Biome, or OxLint configuration file was detected.',
        suggestion: 'Add a linter to enforce code quality standards.',
      });
    }
  }

  // Check for formatter config
  const hasFormatter = paths.some(p =>
    p === '.prettierrc' || p === '.prettierrc.js' || p === '.prettierrc.json' ||
    p === '.prettierrc.yml' || p === '.prettierrc.yaml' || p === '.prettierrc.cjs' ||
    p === 'prettier.config.js' || p === 'prettier.config.mjs' ||
    p === '.biome.json' || p === 'biome.json' ||
    p === '.editorconfig'
  );
  if (!hasFormatter) {
    findings.push({
      id: 'cfg-no-formatter',
      category: 'config-quality',
      severity: 'info',
      title: 'No code formatter configuration',
      description: 'No Prettier, Biome, or EditorConfig file was found.',
      suggestion: 'Add a code formatter for consistent code style across the team.',
    });
  }

  return findings;
}
