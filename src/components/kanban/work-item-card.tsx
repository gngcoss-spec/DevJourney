// @TASK P3-S1-T1 - Work Item Card Component
// @SPEC docs/planning/TASKS.md#kanban-board-ui
// @TEST src/__tests__/pages/kanban-board.test.tsx

'use client';

import { cn } from '@/lib/utils';
import type { WorkItem } from '@/types/database';

interface WorkItemCardProps {
  workItem: WorkItem;
  onCardClick?: (workItemId: string) => void;
  allWorkItems?: WorkItem[];
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

function DueDateBadge({ dueDate }: { dueDate: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = `${String(due.getMonth() + 1).padStart(2, '0')}/${String(due.getDate()).padStart(2, '0')}`;

  if (diffDays < 0) {
    return (
      <span className="text-xs text-[hsl(var(--status-danger-text))] line-through">
        {formatted}
      </span>
    );
  }
  if (diffDays <= 3) {
    return (
      <span className="text-xs text-[hsl(var(--status-danger-text))]">
        {formatted}
      </span>
    );
  }
  return (
    <span className="text-xs text-[hsl(var(--text-quaternary))]">
      {formatted}
    </span>
  );
}

export function WorkItemCard({ workItem, onCardClick, allWorkItems }: WorkItemCardProps) {
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(workItem.id);
    }
  };

  // Sub-task count (only for parent items)
  const subTasks = allWorkItems?.filter((item) => item.parent_id === workItem.id) || [];
  const completedSubTasks = subTasks.filter((item) => item.status === 'done');

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

      {/* Type Badge + Story Points + Due Date */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border',
            typeBadgeStyles[workItem.type]
          )}
        >
          {workItem.type}
        </span>
        {workItem.story_points != null && workItem.story_points > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {workItem.story_points}pt
          </span>
        )}
        {workItem.due_date && (
          <DueDateBadge dueDate={workItem.due_date} />
        )}
      </div>

      {/* Labels */}
      {workItem.labels && workItem.labels.length > 0 && (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {workItem.labels.slice(0, 2).map((label, i) => (
            <span
              key={i}
              className="text-xs px-1.5 py-0.5 rounded bg-[hsl(var(--surface-raised))] text-[hsl(var(--text-tertiary))]"
            >
              {label}
            </span>
          ))}
          {workItem.labels.length > 2 && (
            <span className="text-xs text-[hsl(var(--text-quaternary))]">
              +{workItem.labels.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Sub-task count + Assignee */}
      <div className="flex items-center justify-between mt-2">
        <div>
          {!workItem.parent_id && subTasks.length > 0 && (
            <span className="text-xs text-[hsl(var(--text-tertiary))]">
              {completedSubTasks.length}/{subTasks.length} sub
            </span>
          )}
        </div>
        {workItem.assignee_name && (
          <div
            className="w-6 h-6 rounded-full bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))] text-xs flex items-center justify-center"
            title={workItem.assignee_name}
          >
            {workItem.assignee_name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
