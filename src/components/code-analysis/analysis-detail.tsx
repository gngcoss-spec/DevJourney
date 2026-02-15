'use client';

import { useState } from 'react';
import { ArrowLeft, GitBranch, Star, GitFork, ListChecks, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FindingItem } from './finding-item';
import { useGenerateRefactorItems } from '@/lib/hooks/use-generate-refactor-items';
import { cn } from '@/lib/utils';
import type { CodeAnalysis, AnalysisFinding, FindingSeverity } from '@/types/database';

interface AnalysisDetailProps {
  analysis: CodeAnalysis;
  onBack: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

const severityOrder: FindingSeverity[] = ['critical', 'warning', 'info'];

export function AnalysisDetail({ analysis, onBack }: AnalysisDetailProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<FindingSeverity | 'all'>('all');
  const generateItems = useGenerateRefactorItems();

  const findings = analysis.findings || [];
  const summary = analysis.summary;

  const filteredFindings = filterSeverity === 'all'
    ? findings
    : findings.filter(f => f.severity === filterSeverity);

  // Sort by severity: critical > warning > info
  const sortedFindings = [...filteredFindings].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sortedFindings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedFindings.map(f => f.id)));
    }
  };

  const handleGenerate = () => {
    const selected = findings.filter(f => selectedIds.has(f.id));
    if (selected.length === 0) return;
    generateItems.mutate(
      { serviceId: analysis.service_id, findings: selected },
      {
        onSuccess: () => {
          setSelectedIds(new Set());
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-[hsl(var(--surface-elevated))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="size-4 text-[hsl(var(--text-tertiary))]" />
            <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
              {analysis.repo_owner}/{analysis.repo_name}
            </h2>
          </div>
          <p className="text-sm text-[hsl(var(--text-tertiary))]">{analysis.repo_url}</p>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-elevated))]">
            <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1">건강 점수</p>
            <div className="flex items-end gap-1">
              <span className={cn('text-2xl font-bold', getScoreColor(summary.health_score))}>
                {summary.health_score}
              </span>
              <span className="text-sm text-[hsl(var(--text-tertiary))] mb-0.5">/ 100</span>
            </div>
            <Progress value={summary.health_score} className="mt-2" />
          </div>
          <div className="p-4 rounded-xl border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-elevated))]">
            <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1">총 발견사항</p>
            <p className="text-2xl font-bold text-[hsl(var(--text-primary))]">{summary.total_findings}</p>
          </div>
          <div className="p-4 rounded-xl border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-elevated))]">
            <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1">Critical</p>
            <p className="text-2xl font-bold text-red-400">{summary.by_severity['critical'] || 0}</p>
          </div>
          <div className="p-4 rounded-xl border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-elevated))]">
            <p className="text-xs text-[hsl(var(--text-tertiary))] mb-1">Warning</p>
            <p className="text-2xl font-bold text-yellow-400">{summary.by_severity['warning'] || 0}</p>
          </div>
        </div>
      )}

      {/* Findings */}
      {findings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[hsl(var(--text-primary))]">발견사항</h3>
              {/* Severity filter */}
              <div className="flex gap-1">
                {(['all', ...severityOrder] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                      filterSeverity === sev
                        ? 'bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]'
                        : 'bg-[hsl(var(--surface-elevated))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'
                    )}
                  >
                    {sev === 'all' ? '전체' : sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] transition-colors"
              >
                {selectedIds.size === sortedFindings.length ? '전체 해제' : '전체 선택'}
              </button>
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={selectedIds.size === 0 || generateItems.isPending}
              >
                {generateItems.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <ListChecks className="size-3.5" />
                    선택 항목으로 작업 생성 ({selectedIds.size})
                  </>
                )}
              </Button>
            </div>
          </div>

          {generateItems.isSuccess && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-400">
                작업이 성공적으로 생성되었습니다. Work Items 탭에서 확인하세요.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {sortedFindings.map((finding) => (
              <FindingItem
                key={finding.id}
                finding={finding}
                selected={selectedIds.has(finding.id)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
