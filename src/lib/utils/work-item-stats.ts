import type { WorkItem, WorkItemStatus, WorkItemType, WorkItemPriority } from '@/types/database';

export interface WorkItemStats {
  byStatus: Record<WorkItemStatus, number>;
  byType: Record<WorkItemType, number>;
  byPriority: Record<WorkItemPriority, number>;
  totalPoints: number;
  completedPoints: number;
  withDueDate: number;
  overdue: number;
}

function countBy<K extends string>(items: WorkItem[], key: keyof WorkItem): Record<K, number> {
  const result = {} as Record<K, number>;
  for (const item of items) {
    const val = item[key] as unknown as K;
    result[val] = (result[val] || 0) + 1;
  }
  return result;
}

export function computeWorkItemStats(workItems: WorkItem[]): WorkItemStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalPoints = 0;
  let completedPoints = 0;
  let withDueDate = 0;
  let overdue = 0;

  for (const item of workItems) {
    if (item.story_points) {
      totalPoints += item.story_points;
      if (item.status === 'done') {
        completedPoints += item.story_points;
      }
    }
    if (item.due_date) {
      withDueDate++;
      const due = new Date(item.due_date + 'T00:00:00');
      if (due < today && item.status !== 'done') {
        overdue++;
      }
    }
  }

  return {
    byStatus: countBy<WorkItemStatus>(workItems, 'status'),
    byType: countBy<WorkItemType>(workItems, 'type'),
    byPriority: countBy<WorkItemPriority>(workItems, 'priority'),
    totalPoints,
    completedPoints,
    withDueDate,
    overdue,
  };
}
