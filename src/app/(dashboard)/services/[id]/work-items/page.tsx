// @TASK P3-S2-T1 - Work Items List Page
// @SPEC docs/planning/TASKS.md#work-items-list-ui
// @TEST src/__tests__/pages/work-items-list.test.tsx

'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkItems, useWorkItem } from '@/lib/hooks/use-work-items';
import { WorkItemsFilter } from '@/components/work-item/work-items-filter';
import { WorkItemsTable } from '@/components/work-item/work-items-table';
import { WorkItemModal } from '@/components/work-item/work-item-modal';
import { Button } from '@/components/ui/button';
import type { WorkItemType, WorkItemPriority, WorkItemStatus } from '@/types/database';

export default function WorkItemsPage() {
  const params = useParams();
  const serviceId = params.id as string;

  const { data: workItems, isLoading, isError } = useWorkItems(serviceId);

  // 모달 상태
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

  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<WorkItemStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<WorkItemType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<WorkItemPriority | 'all'>('all');

  // 필터링된 Work Items (클라이언트 사이드)
  const filteredWorkItems = useMemo(() => {
    if (!workItems) return [];

    return workItems.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;

      return matchesStatus && matchesType && matchesPriority;
    });
  }, [workItems, statusFilter, typeFilter, priorityFilter]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400">로딩 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-400">Work Items를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  // 빈 상태 (Work Item이 없을 때)
  if (!workItems || workItems.length === 0) {
    return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Work Items</h1>
          <Button onClick={() => handleCreateNew()}>
            새 Work Item
          </Button>
        </div>

        {/* 빈 상태 메시지 */}
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <p className="text-slate-400 text-lg mb-4">등록된 Work Item이 없습니다</p>
          <p className="text-slate-500 text-sm mb-6">
            새 Work Item을 생성하여 작업을 시작하세요
          </p>
          <Button onClick={() => handleCreateNew()}>
            첫 Work Item 만들기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Work Items</h1>
        <Button onClick={() => handleCreateNew()}>
          새 Work Item
        </Button>
      </div>

      {/* 필터 */}
      <WorkItemsFilter
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        priorityFilter={priorityFilter}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        onPriorityChange={setPriorityFilter}
      />

      {/* 필터 결과 없음 */}
      {filteredWorkItems.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
          <p className="text-slate-400 text-lg">필터 조건에 맞는 Work Item이 없습니다</p>
          <p className="text-slate-500 text-sm mt-2">
            다른 필터 조건을 선택해 보세요
          </p>
        </div>
      )}

      {/* Work Items 테이블 */}
      {filteredWorkItems.length > 0 && (
        <WorkItemsTable workItems={filteredWorkItems} onRowClick={handleRowClick} />
      )}

      {/* Work Item 모달 */}
      <WorkItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        serviceId={serviceId}
        workItem={selectedWorkItem || undefined}
      />
    </div>
  );
}
