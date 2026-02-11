// @TASK P3-S1-T1 - Kanban Board Page
// @SPEC docs/planning/TASKS.md#kanban-board-ui
// @TEST src/__tests__/pages/kanban-board.test.tsx

'use client';

import { useParams } from 'next/navigation';
import { useWorkItems, useMoveWorkItem } from '@/lib/hooks/use-work-items';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import type { WorkItemStatus } from '@/types/database';

export default function KanbanBoardPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: workItems, isLoading, error } = useWorkItems(id);
  const { mutate: moveWorkItem } = useMoveWorkItem(id);

  // Loading state
  if (isLoading) {
    return (
      <div data-testid="kanban-skeleton" className="flex gap-4 overflow-x-auto animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="min-w-[280px] max-w-[280px] bg-slate-800 rounded-lg h-[600px]"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <p className="text-red-400 text-lg font-medium">
            작업 항목을 불러오는 중 오류가 발생했습니다
          </p>
          <p className="text-slate-400 text-sm">
            {error instanceof Error ? error.message : '알 수 없는 오류'}
          </p>
        </div>
      </div>
    );
  }

  // Success state (빈 배열도 보드를 렌더링)
  const handleMoveItem = (itemId: string, status: WorkItemStatus, position: number) => {
    moveWorkItem({ id: itemId, status, position });
  };

  const handleQuickCreate = (status: WorkItemStatus) => {
    // TODO: P3-S3-T1에서 모달 열기
    console.log('Quick create for status:', status);
  };

  const handleCardClick = (workItemId: string) => {
    // TODO: P3-S3-T1에서 상세 모달 열기
    console.log('Card clicked:', workItemId);
  };

  const isEmpty = !workItems || workItems.length === 0;

  return (
    <div className="space-y-4">
      {isEmpty && (
        <div className="mb-4 text-center">
          <p className="text-slate-400 text-sm">
            작업 항목이 없습니다. "+" 버튼으로 새로운 작업 항목을 추가해보세요.
          </p>
        </div>
      )}
      <KanbanBoard
        workItems={workItems || []}
        onMoveItem={handleMoveItem}
        onQuickCreate={handleQuickCreate}
        onCardClick={handleCardClick}
      />
    </div>
  );
}
