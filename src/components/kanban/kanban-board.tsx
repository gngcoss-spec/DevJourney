// @TASK P3-S1-T1 - Kanban Board Container Component
// @SPEC docs/planning/TASKS.md#kanban-board-ui
// @TEST src/__tests__/pages/kanban-board.test.tsx

'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { KanbanColumn } from './kanban-column';
import { WorkItemCard } from './work-item-card';
import type { WorkItem, WorkItemStatus } from '@/types/database';

interface KanbanBoardProps {
  workItems: WorkItem[];
  onMoveItem?: (id: string, status: WorkItemStatus, position: number) => void;
  onQuickCreate?: (status: WorkItemStatus) => void;
  onCardClick?: (workItemId: string) => void;
}

const COLUMNS: Array<{ status: WorkItemStatus; title: string }> = [
  { status: 'backlog', title: 'Backlog' },
  { status: 'ready', title: 'Ready' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'review', title: 'Review' },
  { status: 'done', title: 'Done' },
];

export function KanbanBoard({
  workItems,
  onMoveItem,
  onQuickCreate,
  onCardClick,
}: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<WorkItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동 후 드래그 시작 (클릭과 구분)
      },
    })
  );

  // 상태별 아이템 그룹화
  const itemsByStatus = COLUMNS.reduce(
    (acc, column) => {
      acc[column.status] = workItems
        .filter((item) => item.status === column.status)
        .sort((a, b) => a.sort_order - b.sort_order);
      return acc;
    },
    {} as Record<WorkItemStatus, WorkItem[]>
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = workItems.find((item) => item.id === active.id);
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !onMoveItem) {
      setActiveItem(null);
      return;
    }

    const itemId = active.id as string;
    const newStatus = over.id as WorkItemStatus;

    // 같은 컬럼 내 이동이면 무시
    const item = workItems.find((item) => item.id === itemId);
    if (item?.status === newStatus) {
      setActiveItem(null);
      return;
    }

    // 새 컬럼의 마지막 위치로 이동
    const newColumnItems = itemsByStatus[newStatus] || [];
    const newPosition = newColumnItems.length;

    onMoveItem(itemId, newStatus, newPosition);
    setActiveItem(null);
  };

  const handleDragCancel = () => {
    setActiveItem(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            title={column.title}
            items={itemsByStatus[column.status]}
            onQuickCreate={onQuickCreate}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem ? (
          <div className="rotate-3 opacity-80">
            <WorkItemCard workItem={activeItem} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
