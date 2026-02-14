// @TASK P3-S1-T1 - Kanban Column Component
// @SPEC docs/planning/TASKS.md#kanban-board-ui
// @TEST src/__tests__/pages/kanban-board.test.tsx

'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkItemCard } from './work-item-card';
import type { WorkItem, WorkItemStatus } from '@/types/database';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  status: WorkItemStatus;
  title: string;
  items: WorkItem[];
  allWorkItems?: WorkItem[];
  onQuickCreate?: (status: WorkItemStatus) => void;
  onCardClick?: (workItemId: string) => void;
}

const statusDotStyles: Record<WorkItemStatus, string> = {
  backlog: 'bg-[hsl(var(--text-quaternary))]',
  ready: 'bg-blue-500',
  'in-progress': 'bg-yellow-500',
  review: 'bg-purple-500',
  done: 'bg-green-500',
};

export function KanbanColumn({
  status,
  title,
  items,
  allWorkItems,
  onQuickCreate,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const handleQuickCreate = () => {
    if (onQuickCreate) {
      onQuickCreate(status);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-[280px] max-w-[280px] bg-[hsl(var(--surface-raised))] rounded-lg border border-[hsl(var(--border-default))]',
        isOver && 'border-blue-500 bg-[hsl(var(--surface-elevated))]/50'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border-default))]">
        <div className="flex items-center gap-2">
          <div
            className={cn('w-2 h-2 rounded-full', statusDotStyles[status])}
            aria-hidden="true"
          />
          <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">{title}</h2>
          <span className="text-xs text-[hsl(var(--text-tertiary))] bg-[hsl(var(--surface-elevated))] px-1.5 py-0.5 rounded">
            {items.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleQuickCreate}
          aria-label={`Add work item to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Cards List */}
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
          {items.map((item) => (
            <WorkItemCard key={item.id} workItem={item} onCardClick={onCardClick} allWorkItems={allWorkItems} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
