// @TASK P3-S2-T1 - Work Items Table Component
// @SPEC docs/planning/TASKS.md#work-items-list-ui
// @TEST src/__tests__/pages/work-items-list.test.tsx

'use client';

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { WorkItem, WorkItemType, WorkItemPriority, WorkItemStatus } from '@/types/database';

interface WorkItemsTableProps {
  workItems: WorkItem[];
  onRowClick?: (workItemId: string) => void;
}

// 유형별 뱃지 스타일 매핑 (WCAG AA 준수 색상 대비)
const typeStyles: Record<WorkItemType, string> = {
  feature: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  bug: 'bg-red-500/20 text-red-500 border-red-500/50',
  refactor: 'bg-green-500/20 text-green-500 border-green-500/50',
  infra: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
  'ai-prompt': 'bg-orange-500/20 text-orange-500 border-orange-500/50',
} as const;

// 우선순위별 뱃지 스타일 매핑
const priorityStyles: Record<WorkItemPriority, string> = {
  urgent: 'bg-red-500/20 text-red-500 border-red-500/50',
  high: 'bg-orange-500/20 text-orange-500 border-orange-500/50',
  medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
} as const;

// 상태별 뱃지 스타일 매핑
const statusStyles: Record<WorkItemStatus, string> = {
  backlog: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  ready: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  'in-progress': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  review: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
  done: 'bg-green-500/20 text-green-500 border-green-500/50',
} as const;

// 날짜 포맷 함수
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}개월 전`;
  return `${Math.floor(days / 365)}년 전`;
}

export const WorkItemsTable = memo(({ workItems, onRowClick }: WorkItemsTableProps) => {
  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden">
      <table className="w-full" aria-label="Work Items 목록">
        <caption className="sr-only">
          총 {workItems.length}개의 Work Item
        </caption>
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900">
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              제목
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              유형
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              우선순위
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              상태
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              생성일
            </th>
          </tr>
        </thead>
        <tbody className="bg-slate-950 divide-y divide-slate-800">
          {workItems.map((workItem) => (
            <tr
              key={workItem.id}
              onClick={() => onRowClick?.(workItem.id)}
              className={onRowClick ? 'hover:bg-slate-900/50 cursor-pointer transition-colors' : 'hover:bg-slate-900/50 transition-colors'}
            >
              <td className="px-6 py-4">
                <div className="text-slate-200 font-medium">
                  {workItem.title}
                </div>
                {workItem.description && (
                  <p className="text-sm text-slate-400 mt-1">{workItem.description}</p>
                )}
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant="outline"
                  className={typeStyles[workItem.type]}
                  aria-label={`유형: ${workItem.type}`}
                >
                  {workItem.type}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant="outline"
                  className={priorityStyles[workItem.priority]}
                  aria-label={`우선순위: ${workItem.priority}`}
                >
                  {workItem.priority}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant="outline"
                  className={statusStyles[workItem.status]}
                  aria-label={`상태: ${workItem.status}`}
                >
                  {workItem.status}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <time
                  dateTime={workItem.created_at}
                  className="text-sm text-slate-400"
                >
                  {formatDate(workItem.created_at)}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

WorkItemsTable.displayName = 'WorkItemsTable';
