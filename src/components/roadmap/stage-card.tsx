'use client';

import { Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Stage, ServiceStage } from '@/types/database';
import { cn } from '@/lib/utils';

interface StageCardProps {
  stage: Stage | null;
  stageName: ServiceStage;
  currentStage: ServiceStage;
  onEdit: (stageName: ServiceStage, existing?: Stage) => void;
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
  completed: 'border-green-500/50 bg-green-500/5',
  current: 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30',
  upcoming: 'border-slate-700 bg-slate-900/30',
};

const dotStyles = {
  completed: 'bg-green-500',
  current: 'bg-blue-500 animate-pulse',
  upcoming: 'bg-slate-600',
};

export function StageCard({ stage, stageName, currentStage, onEdit }: StageCardProps) {
  const status = getStageStatus(stageName, currentStage);

  return (
    <div className={cn('border rounded-lg p-4 min-w-[200px] relative', statusStyles[status])}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded-full', dotStyles[status])} />
          <h3 className={cn(
            'text-sm font-semibold',
            status === 'upcoming' ? 'text-slate-500' : 'text-slate-200'
          )}>
            {stageLabels[stageName]}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {status === 'completed' && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
              완료
            </Badge>
          )}
          {status === 'current' && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
              진행 중
            </Badge>
          )}
          <button
            onClick={() => onEdit(stageName, stage || undefined)}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={`${stageLabels[stageName]} 편집`}
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>

      {stage && (
        <div className="space-y-2 mt-3">
          {(stage.start_date || stage.end_date) && (
            <p className="text-xs text-slate-500">
              {stage.start_date && <span>{stage.start_date}</span>}
              {stage.start_date && stage.end_date && <span> ~ </span>}
              {stage.end_date && <span>{stage.end_date}</span>}
            </p>
          )}
          {stage.summary && (
            <p className="text-sm text-slate-400">{stage.summary}</p>
          )}
          {stage.deliverables && stage.deliverables.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {stage.deliverables.map((d, idx) => (
                <Badge key={idx} variant="outline" className="text-xs text-slate-400 border-slate-700">
                  {d}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {!stage && (
        <p className="text-xs text-slate-600 mt-2">아직 기록이 없습니다</p>
      )}
    </div>
  );
}

export { STAGE_ORDER, stageLabels };
