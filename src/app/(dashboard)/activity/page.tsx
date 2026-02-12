'use client';

import { useState } from 'react';
import { useRecentActivities } from '@/lib/hooks/use-activity';
import { ActivityFeed } from '@/components/activity/activity-feed';
import type { ActivityItem } from '@/lib/supabase/queries/activity';

type ActivityType = 'all' | 'work_item' | 'decision' | 'dev_log' | 'document';

const filterLabels: Record<ActivityType, string> = {
  all: '전체',
  work_item: '작업',
  decision: '의사결정',
  dev_log: '개발 일지',
  document: '문서',
};

export default function ActivityPage() {
  const [filterType, setFilterType] = useState<ActivityType>('all');
  const { data: activities, isLoading, isError } = useRecentActivities();

  const filteredActivities = activities?.filter(
    (a: ActivityItem) => filterType === 'all' || a.type === filterType
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-slate-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-red-400">에러가 발생했습니다</p>
          <p className="text-sm text-slate-500 mt-2">활동 내역을 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-50">활동 내역</h1>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.keys(filterLabels) as ActivityType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterType === type
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            {filterLabels[type]}
          </button>
        ))}
      </div>

      {!filteredActivities || filteredActivities.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <p className="text-slate-400 text-lg">아직 활동 내역이 없습니다</p>
            <p className="text-sm text-slate-500 mt-2">
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
