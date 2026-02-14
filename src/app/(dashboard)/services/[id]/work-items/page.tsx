'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkItems, useWorkItem } from '@/lib/hooks/use-work-items';
import { WorkItemsFilter } from '@/components/work-item/work-items-filter';
import { WorkItemsTable } from '@/components/work-item/work-items-table';
import { WorkItemModal } from '@/components/work-item/work-item-modal';
import { WorkItemCharts } from '@/components/work-item/work-item-charts';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/common/page-loading';
import { PageError } from '@/components/common/page-error';
import { PageEmpty } from '@/components/common/page-empty';
import { ListTodo, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { computeWorkItemStats } from '@/lib/utils/work-item-stats';
import type { WorkItemType, WorkItemPriority, WorkItemStatus } from '@/types/database';

export default function WorkItemsPage() {
  const params = useParams();
  const serviceId = params.id as string;

  const { data: workItems, isLoading, isError, refetch } = useWorkItems(serviceId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<string | null>(null);
  const { data: selectedWorkItem } = useWorkItem(selectedWorkItemId || '');
  const [showStats, setShowStats] = useState(false);

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
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [storyPointsFilter, setStoryPointsFilter] = useState<string>('all');

  const availableLabels = useMemo(() => {
    if (!workItems) return [];
    return [...new Set(workItems.flatMap((i) => i.labels || []))];
  }, [workItems]);

  const filteredWorkItems = useMemo(() => {
    if (!workItems) return [];

    return workItems.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      const matchesLabel = labelFilter === 'all' || item.labels?.includes(labelFilter);
      const matchesStoryPoints = storyPointsFilter === 'all'
        || (storyPointsFilter === 'none' && !item.story_points)
        || (storyPointsFilter === '1-3' && item.story_points != null && item.story_points >= 1 && item.story_points <= 3)
        || (storyPointsFilter === '5-8' && item.story_points != null && item.story_points >= 5 && item.story_points <= 8)
        || (storyPointsFilter === '13+' && item.story_points != null && item.story_points >= 13);

      return matchesStatus && matchesType && matchesPriority && matchesLabel && matchesStoryPoints;
    });
  }, [workItems, statusFilter, typeFilter, priorityFilter, labelFilter, storyPointsFilter]);

  // Sort: parents first, then sub-tasks grouped under their parent
  const sortedWorkItems = useMemo(() => {
    const parents = filteredWorkItems.filter((item) => !item.parent_id);
    const children = filteredWorkItems.filter((item) => item.parent_id);
    const result = [];
    for (const parent of parents) {
      result.push(parent);
      const subs = children.filter((c) => c.parent_id === parent.id);
      result.push(...subs);
    }
    // Add orphan sub-tasks (parent filtered out)
    const placed = new Set(result.map((r) => r.id));
    for (const child of children) {
      if (!placed.has(child.id)) result.push(child);
    }
    return result;
  }, [filteredWorkItems]);

  const stats = useMemo(() => {
    if (!workItems) return null;
    return computeWorkItemStats(workItems);
  }, [workItems]);

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            통계
            {showStats ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
          <Button onClick={() => handleCreateNew()}>
            새 Work Item
          </Button>
        </div>
      </div>

      {showStats && stats && (
        <WorkItemCharts stats={stats} />
      )}

      <WorkItemsFilter
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        priorityFilter={priorityFilter}
        labelFilter={labelFilter}
        storyPointsFilter={storyPointsFilter}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        onPriorityChange={setPriorityFilter}
        onLabelChange={setLabelFilter}
        onStoryPointsChange={setStoryPointsFilter}
        availableLabels={availableLabels}
      />

      {sortedWorkItems.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
          <p className="text-[hsl(var(--text-tertiary))] text-lg">필터 조건에 맞는 Work Item이 없습니다</p>
          <p className="text-[hsl(var(--text-quaternary))] text-sm mt-2">
            다른 필터 조건을 선택해 보세요
          </p>
        </div>
      )}

      {sortedWorkItems.length > 0 && (
        <WorkItemsTable workItems={sortedWorkItems} onRowClick={handleRowClick} />
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
