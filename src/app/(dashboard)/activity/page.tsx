'use client';

import { useState } from 'react';
import { useRecentActivities } from '@/lib/hooks/use-activity';
import { ActivityFeed } from '@/components/activity/activity-feed';
import { PageHeader } from '@/components/common/page-header';
import { PageLoading } from '@/components/common/page-loading';
import { FilterPills } from '@/components/common/filter-pills';
import type { ActivityItem } from '@/lib/supabase/queries/activity';

type ActivityType = 'all' | 'work_item' | 'decision' | 'dev_log' | 'document';

const filterOptions: { value: ActivityType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'work_item', label: '작업' },
  { value: 'decision', label: '의사결정' },
  { value: 'dev_log', label: '개발 일지' },
  { value: 'document', label: '문서' },
];

export default function ActivityPage() {
  const [filterType, setFilterType] = useState<ActivityType>('all');
  const { data: activities, isLoading, isError } = useRecentActivities();

  const filteredActivities = activities?.filter(
    (a: ActivityItem) => filterType === 'all' || a.type === filterType
  );

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-[hsl(var(--status-danger-text))]">에러가 발생했습니다</p>
          <p className="text-sm text-[hsl(var(--text-quaternary))] mt-2">활동 내역을 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="활동 내역" />

      <FilterPills
        options={filterOptions}
        value={filterType}
        onChange={setFilterType}
      />

      {!filteredActivities || filteredActivities.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <p className="text-[hsl(var(--text-tertiary))] text-lg">아직 활동 내역이 없습니다</p>
            <p className="text-sm text-[hsl(var(--text-quaternary))] mt-2">
              서비스에서 작업을 시작하면 활동이 기록됩니다.
            </p>
          </div>
        </div>
      ) : (
        <ActivityFeed activities={filteredActivities} />
      )}
    </div>
  );
}
