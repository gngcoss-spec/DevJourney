'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useWorkItems, useMoveWorkItem, useWorkItem } from '@/lib/hooks/use-work-items';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { WorkItemModal } from '@/components/work-item/work-item-modal';
import { PageLoading } from '@/components/common/page-loading';
import { PageError } from '@/components/common/page-error';
import type { WorkItemStatus } from '@/types/database';

export default function KanbanBoardPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: workItems, isLoading, error, refetch } = useWorkItems(id);
  const { mutate: moveWorkItem } = useMoveWorkItem(id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<WorkItemStatus>('backlog');
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<string | null>(null);
  const { data: selectedWorkItem } = useWorkItem(selectedWorkItemId || '');

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

  if (error) {
    return (
      <PageError
        message="작업 항목을 불러오는 중 오류가 발생했습니다"
        onRetry={() => refetch()}
      />
    );
  }

  const handleMoveItem = (itemId: string, status: WorkItemStatus, position: number) => {
    moveWorkItem({ id: itemId, status, position });
  };

  const handleQuickCreate = (status: WorkItemStatus) => {
    setDefaultStatus(status);
    setSelectedWorkItemId(null);
    setIsModalOpen(true);
  };

  const handleCardClick = (workItemId: string) => {
    setSelectedWorkItemId(workItemId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWorkItemId(null);
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

      <WorkItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        serviceId={id}
        workItem={selectedWorkItem || undefined}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
