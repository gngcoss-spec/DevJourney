// @TASK P3-S2-T1 - Work Items Filter Component
// @SPEC docs/planning/TASKS.md#work-items-list-ui
// @TEST src/__tests__/pages/work-items-list.test.tsx

'use client';

import type { WorkItemType, WorkItemPriority, WorkItemStatus } from '@/types/database';

interface WorkItemsFilterProps {
  statusFilter: WorkItemStatus | 'all';
  typeFilter: WorkItemType | 'all';
  priorityFilter: WorkItemPriority | 'all';
  onStatusChange: (status: WorkItemStatus | 'all') => void;
  onTypeChange: (type: WorkItemType | 'all') => void;
  onPriorityChange: (priority: WorkItemPriority | 'all') => void;
}

export function WorkItemsFilter({
  statusFilter,
  typeFilter,
  priorityFilter,
  onStatusChange,
  onTypeChange,
  onPriorityChange,
}: WorkItemsFilterProps) {
  return (
    <div className="flex items-center gap-3">
      {/* 상태 필터 */}
      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm text-[hsl(var(--text-tertiary))]">
          상태:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as WorkItemStatus | 'all')}
          className="h-8 rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-[hsl(var(--ring))] focus-visible:ring-[hsl(var(--ring)/0.5)] focus-visible:ring-[3px]"
        >
          <option value="all">전체</option>
          <option value="backlog">backlog</option>
          <option value="ready">ready</option>
          <option value="in-progress">in-progress</option>
          <option value="review">review</option>
          <option value="done">done</option>
        </select>
      </div>

      {/* 유형 필터 */}
      <div className="flex items-center gap-2">
        <label htmlFor="type-filter" className="text-sm text-[hsl(var(--text-tertiary))]">
          유형:
        </label>
        <select
          id="type-filter"
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value as WorkItemType | 'all')}
          className="h-8 rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-[hsl(var(--ring))] focus-visible:ring-[hsl(var(--ring)/0.5)] focus-visible:ring-[3px]"
        >
          <option value="all">전체</option>
          <option value="feature">feature</option>
          <option value="bug">bug</option>
          <option value="refactor">refactor</option>
          <option value="infra">infra</option>
          <option value="ai-prompt">ai-prompt</option>
        </select>
      </div>

      {/* 우선순위 필터 */}
      <div className="flex items-center gap-2">
        <label htmlFor="priority-filter" className="text-sm text-[hsl(var(--text-tertiary))]">
          우선순위:
        </label>
        <select
          id="priority-filter"
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as WorkItemPriority | 'all')}
          className="h-8 rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-[hsl(var(--ring))] focus-visible:ring-[hsl(var(--ring)/0.5)] focus-visible:ring-[3px]"
        >
          <option value="all">전체</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="urgent">urgent</option>
        </select>
      </div>
    </div>
  );
}
