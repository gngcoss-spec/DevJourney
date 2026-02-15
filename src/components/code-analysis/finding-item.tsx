'use client';

import { cn } from '@/lib/utils';
import { FileCode, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import type { AnalysisFinding } from '@/types/database';

interface FindingItemProps {
  finding: AnalysisFinding;
  selected: boolean;
  onToggle: (id: string) => void;
}

const severityConfig = {
  critical: {
    label: 'Critical',
    icon: AlertOctagon,
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  info: {
    label: 'Info',
    icon: Info,
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
} as const;

const categoryLabels: Record<string, string> = {
  'project-structure': '프로젝트 구조',
  'dependencies': '의존성',
  'config-quality': '설정 품질',
  'code-patterns': '코드 패턴',
  'security': '보안',
  'documentation': '문서화',
  'testing': '테스트',
};

export function FindingItem({ finding, selected, onToggle }: FindingItemProps) {
  const severity = severityConfig[finding.severity];
  const SeverityIcon = severity.icon;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-colors',
        selected
          ? 'border-[hsl(var(--primary))]/50 bg-[hsl(var(--primary))]/5'
          : 'border-[hsl(var(--border-default))] bg-[hsl(var(--surface-elevated))]'
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(finding.id)}
          className="mt-1 size-4 rounded border-[hsl(var(--border-default))] accent-[hsl(var(--primary))]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', severity.className)}>
              <SeverityIcon className="size-3" />
              {severity.label}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[hsl(var(--surface-ground))] text-[hsl(var(--text-tertiary))]">
              {categoryLabels[finding.category] || finding.category}
            </span>
          </div>
          <h4 className="font-medium text-[hsl(var(--text-primary))] text-sm">
            {finding.title}
          </h4>
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
            {finding.description}
          </p>
          {finding.file_path && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-[hsl(var(--text-tertiary))]">
              <FileCode className="size-3" />
              {finding.file_path}
            </div>
          )}
          <p className="text-xs text-[hsl(var(--info))] mt-1.5">
            {finding.suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}
