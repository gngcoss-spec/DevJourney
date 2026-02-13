// @TASK P3-S1-T1 - Work Item Card Component
// @SPEC docs/planning/TASKS.md#kanban-board-ui
// @TEST src/__tests__/pages/kanban-board.test.tsx

'use client';

import { cn } from '@/lib/utils';
import type { WorkItem } from '@/types/database';

interface WorkItemCardProps {
  workItem: WorkItem;
  onCardClick?: (workItemId: string) => void;
}

const typeBadgeStyles = {
  feature: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  bug: 'bg-red-500/10 text-red-400 border-red-500/20',
  refactor: 'bg-green-500/10 text-green-400 border-green-500/20',
  infra: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'ai-prompt': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const priorityDotStyles = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-[hsl(var(--text-quaternary))]',
};

export function WorkItemCard({ workItem, onCardClick }: WorkItemCardProps) {
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(workItem.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border-default))] rounded-lg p-4 cursor-pointer transition-all',
        'hover:border-[hsl(var(--border-hover))] hover:shadow-lg',
        onCardClick && 'cursor-pointer'
      )}
    >
      {/* Priority Dot + Title */}
      <div className="flex items-start gap-2 mb-3">
        <div
          data-testid={`priority-${workItem.priority}`}
          className={cn(
            'w-2 h-2 rounded-full mt-1.5 shrink-0',
            priorityDotStyles[workItem.priority]
          )}
          aria-label={`Priority: ${workItem.priority}`}
        />
        <h3 className="text-sm font-medium text-[hsl(var(--text-primary))] leading-snug">
          {workItem.title}
        </h3>
      </div>

      {/* Type Badge */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border',
            typeBadgeStyles[workItem.type]
          )}
        >
          {workItem.type}
        </span>
      </div>
    </div>
  );
}
