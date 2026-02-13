'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import type { Stage, ServiceStage } from '@/types/database';
import { cn } from '@/lib/utils';

interface StageCardProps {
  stage: Stage | null;
  stageName: ServiceStage;
  currentStage: ServiceStage;
  onEdit: (stageName: ServiceStage, existing?: Stage) => void;
  onDelete?: (stageName: ServiceStage) => void;
}

const STAGE_ORDER: ServiceStage[] = ['idea', 'planning', 'design', 'development', 'testing', 'launch', 'enhancement'];

const stageLabels: Record<ServiceStage, string> = {
  idea: 'Idea',
  planning: 'Planning',
  design: 'Design',
  development: 'Development',
  testing: 'Testing',
  launch: 'Launch',
  enhancement: 'Enhancement',
};

function getStageStatus(stageName: ServiceStage, currentStage: ServiceStage): 'completed' | 'current' | 'upcoming' {
  const stageIdx = STAGE_ORDER.indexOf(stageName);
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  if (stageIdx < currentIdx) return 'completed';
  if (stageIdx === currentIdx) return 'current';
  return 'upcoming';
}

const statusStyles = {
  completed: 'border-[hsl(var(--status-success-border))] bg-[hsl(var(--status-success-bg))]',
  current: 'border-[hsl(var(--primary))] bg-[hsl(var(--status-info-bg))] ring-1 ring-[hsl(var(--status-info-border))]',
  upcoming: 'border-[hsl(var(--border-default))] bg-[hsl(var(--surface-ground))]',
};

const dotStyles = {
  completed: 'bg-[hsl(var(--status-success-text))]',
  current: 'bg-[hsl(var(--primary))] animate-pulse',
  upcoming: 'bg-[hsl(var(--text-quaternary))]',
};

export function StageCard({ stage, stageName, currentStage, onEdit, onDelete }: StageCardProps) {
  const status = getStageStatus(stageName, currentStage);

  return (
    <div className={cn('border rounded-[var(--radius-lg)] p-4 min-w-[200px] relative', statusStyles[status])}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded-full', dotStyles[status])} />
          <h3 className={cn(
            'text-sm font-semibold',
            status === 'upcoming' ? 'text-[hsl(var(--text-quaternary))]' : 'text-[hsl(var(--text-secondary))]'
          )}>
            {stageLabels[stageName]}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {status === 'completed' && (
            <StatusBadge variant="success" className="text-xs">완료</StatusBadge>
          )}
          {status === 'current' && (
            <StatusBadge variant="info" className="text-xs">진행 중</StatusBadge>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit(stageName, stage || undefined)}
            aria-label={`${stageLabels[stageName]} 편집`}
          >
            <Pencil className="size-3" />
          </Button>
          {stage && onDelete && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(stageName)}
              aria-label={`${stageLabels[stageName]} 삭제`}
              className="text-[hsl(var(--status-danger-text))]"
            >
              <Trash2 className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {stage && (
        <div className="space-y-2 mt-3">
          {(stage.start_date || stage.end_date) && (
            <p className="text-xs text-[hsl(var(--text-quaternary))]">
              {stage.start_date && <span>{stage.start_date}</span>}
              {stage.start_date && stage.end_date && <span> ~ </span>}
              {stage.end_date && <span>{stage.end_date}</span>}
            </p>
          )}
          {stage.summary && (
            <p className="text-sm text-[hsl(var(--text-tertiary))]">{stage.summary}</p>
          )}
          {stage.deliverables && stage.deliverables.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {stage.deliverables.map((d, idx) => (
                <Badge key={idx} variant="outline" className="text-xs text-[hsl(var(--text-tertiary))] border-[hsl(var(--border-default))]">
                  {d}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {!stage && (
        <p className="text-xs text-[hsl(var(--text-quaternary))] mt-2">아직 기록이 없습니다</p>
      )}
    </div>
  );
}

export { STAGE_ORDER, stageLabels };
