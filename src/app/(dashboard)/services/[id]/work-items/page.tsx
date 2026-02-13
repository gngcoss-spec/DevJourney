'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkItems, useWorkItem } from '@/lib/hooks/use-work-items';
import { WorkItemsFilter } from '@/components/work-item/work-items-filter';
import { WorkItemsTable } from '@/components/work-item/work-items-table';
import { WorkItemModal } from '@/components/work-item/work-item-modal';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/common/page-loading';
import { PageError } from '@/components/common/page-error';
import { PageEmpty } from '@/components/common/page-empty';
import { ListTodo } from 'lucide-react';
import type { WorkItemType, WorkItemPriority, WorkItemStatus } from '@/types/database';

export default function WorkItemsPage() {
  const params = useParams();
  const serviceId = params.id as string;

  const { data: workItems, isLoading, isError, refetch } = useWorkItems(serviceId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<string | null>(null);
  const { data: selectedWorkItem } = useWorkItem(selectedWorkItemId || '');

  const handleCreateNew = () => {
    setSelectedWorkItemId(null);
    setIsModalOpen(true);
  };

  const handleRowClick = (workItemId: string) => {
    setSelectedWorkItemId(workItemId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWorkItemId(null);
  };

  const [statusFilter, setStatusFilter] = useState<WorkItemStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<WorkItemType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<WorkItemPriority | 'all'>('all');

  const filteredWorkItems = useMemo(() => {
    if (!workItems) return [];

    return workItems.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;

      return matchesStatus && matchesType && matchesPriority;
    });
  }, [workItems, statusFilter, typeFilter, priorityFilter]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Work Items</h1>
          <Button onClick={() => handleCreateNew()}>
            새 Work Item
          </Button>
        </div>
        <PageError message="Work Items를 불러오는 중 오류가 발생했습니다." onRetry={() => refetch()} />
        <WorkItemModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          serviceId={serviceId}
          workItem={selectedWorkItem || undefined}
        />
      </div>
    );
  }

  if (!workItems || workItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Work Items</h1>
          <Button onClick={() => handleCreateNew()}>
            새 Work Item
          </Button>
        </div>
        <PageEmpty
          icon={ListTodo}
          message="등록된 Work Item이 없습니다"
          description="새 Work Item을 생성하여 작업을 시작하세요"
          actionLabel="첫 Work Item 만들기"
          onAction={handleCreateNew}
        />
        <WorkItemModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          serviceId={serviceId}
          workItem={selectedWorkItem || undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Work Items</h1>
        <Button onClick={() => handleCreateNew()}>
          새 Work Item
        </Button>
      </div>

      <WorkItemsFilter
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        priorityFilter={priorityFilter}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        onPriorityChange={setPriorityFilter}
      />

      {filteredWorkItems.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
          <p className="text-[hsl(var(--text-tertiary))] text-lg">필터 조건에 맞는 Work Item이 없습니다</p>
          <p className="text-[hsl(var(--text-quaternary))] text-sm mt-2">
            다른 필터 조건을 선택해 보세요
          </p>
        </div>
      )}

      {filteredWorkItems.length > 0 && (
        <WorkItemsTable workItems={filteredWorkItems} onRowClick={handleRowClick} />
      )}

      <WorkItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        serviceId={serviceId}
        workItem={selectedWorkItem || undefined}
      />
    </div>
  );
}
