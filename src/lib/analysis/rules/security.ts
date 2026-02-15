import type { AnalysisInput, AnalysisFinding } from '../types';

export function checkSecurity(input: AnalysisInput): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  const { tree } = input;
  const paths = tree.map(e => e.path);

  // Check for .env files committed
  const envFiles = paths.filter(p =>
    p === '.env' || p === '.env.local' || p === '.env.production' ||
    (p.startsWith('.env') && !p.endsWith('.example') && !p.endsWith('.sample') && !p.endsWith('.template'))
  );
  if (envFiles.length > 0) {
    findings.push({
      id: 'sec-env-exposed',
      category: 'security',
      severity: 'critical',
      title: 'Environment files committed to repository',
      description: `Found committed environment files: ${envFiles.join(', ')}. These may contain secrets.`,
      file_path: envFiles[0],
      suggestion: 'Remove .env files from the repository and add them to .gitignore. Use .env.example for templates.',
    });
  }

  // Check for potential secret files
  const secretPatterns = [
    'credentials.json', 'service-account.json', 'gcp-key.json',
    '.pem', '.key', '.p12', '.pfx',
    'id_rsa', 'id_ed25519', 'id_ecdsa',
  ];
  const secretFiles = paths.filter(p => {
    const filename = p.split('/').pop() || '';
    return secretPatterns.some(pattern =>
      filename === pattern || filename.endsWith(pattern)
    );
  });
  if (secretFiles.length > 0) {
    findings.push({
      id: 'sec-secret-files',
      category: 'security',
      severity: 'critical',
      title: 'Potential secret files in repository',
      description: `Found files that may contain secrets: ${secretFiles.slice(0, 5).join(', ')}${secretFiles.length > 5 ? ` and ${secretFiles.length - 5} more` : ''}.`,
      file_path: secretFiles[0],
      suggestion: 'Remove secret files from the repository, rotate compromised credentials, and add patterns to .gitignore.',
    });
  }

  // Check for security headers or security-related config
  const hasSecurityConfig = paths.some(p =>
    p.includes('helmet') || p.includes('cors') || p.includes('csp') ||
    p === 'security.txt' || p === '.well-known/security.txt'
  );

  // Check .gitignore for env exclusion
  const gitignorePath = paths.find(p => p === '.gitignore');
  if (gitignorePath && !envFiles.length) {
    // gitignore exists and no env files found - good
  }

  return findings;
}
