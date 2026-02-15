'use client';

import { GitBranch, Trash2, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CodeAnalysis } from '@/types/database';

interface AnalysisCardProps {
  analysis: CodeAnalysis;
  onClick: (analysis: CodeAnalysis) => void;
  onDelete: (id: string) => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-500/10 border-green-500/20';
  if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

function StatusIcon({ status }: { status: CodeAnalysis['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="size-4 text-green-400" />;
    case 'failed':
      return <XCircle className="size-4 text-red-400" />;
    case 'running':
      return <Loader2 className="size-4 text-blue-400 animate-spin" />;
    default:
      return <AlertTriangle className="size-4 text-yellow-400" />;
  }
}

export function AnalysisCard({ analysis, onClick, onDelete }: AnalysisCardProps) {
  const score = analysis.summary?.health_score;
  const totalFindings = analysis.summary?.total_findings ?? 0;

  return (
    <div
      className="group relative p-4 rounded-xl border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-elevated))] hover:border-[hsl(var(--border-hover))] transition-colors cursor-pointer"
      onClick={() => onClick(analysis)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(analysis); }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <GitBranch className="size-4 text-[hsl(var(--text-tertiary))] shrink-0" />
          <span className="font-medium text-[hsl(var(--text-primary))] truncate">
            {analysis.repo_owner}/{analysis.repo_name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusIcon status={analysis.status} />
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(analysis.id); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-[hsl(var(--text-tertiary))] hover:text-red-400 transition-all"
            aria-label="삭제"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {analysis.status === 'completed' && score !== undefined && (
        <div className="mt-3 flex items-center gap-4">
          <div className={cn('px-3 py-1.5 rounded-lg border', getScoreBg(score))}>
            <span className={cn('text-lg font-bold', getScoreColor(score))}>{score}</span>
            <span className="text-xs text-[hsl(var(--text-tertiary))] ml-1">/ 100</span>
          </div>
          <div className="text-sm text-[hsl(var(--text-secondary))]">
            {totalFindings}개 발견사항
          </div>
        </div>
      )}

      {analysis.status === 'failed' && analysis.error_message && (
        <p className="mt-2 text-xs text-red-400 truncate">{analysis.error_message}</p>
      )}

      {analysis.status === 'running' && (
        <p className="mt-2 text-xs text-blue-400">분석 진행 중...</p>
      )}

      <div className="mt-2 text-xs text-[hsl(var(--text-tertiary))]">
        {new Date(analysis.created_at).toLocaleDateString('ko-KR')}
      </div>
    </div>
  );
}
