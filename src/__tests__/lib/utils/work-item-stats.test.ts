import { describe, it, expect } from 'vitest';
import { computeWorkItemStats } from '@/lib/utils/work-item-stats';
import type { WorkItem } from '@/types/database';

function createMockWorkItem(overrides: Partial<WorkItem> = {}): WorkItem {
  return {
    id: 'wi-1',
    service_id: 'svc-1',
    user_id: 'user-1',
    title: 'Test Item',
    description: null,
    type: 'feature',
    priority: 'medium',
    status: 'backlog',
    problem: null,
    options_considered: null,
    decision_reason: null,
    result: null,
    assignee_name: null,
    due_date: null,
    labels: [],
    assignee_id: null,
    story_points: null,
    parent_id: null,
    sort_order: 0,
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-02-10T00:00:00Z',
    ...overrides,
  };
}

describe('computeWorkItemStats', () => {
  it('should return zero counts for empty array', () => {
    const stats = computeWorkItemStats([]);

    expect(stats.totalPoints).toBe(0);
    expect(stats.completedPoints).toBe(0);
    expect(stats.withDueDate).toBe(0);
    expect(stats.overdue).toBe(0);
    expect(stats.byStatus).toEqual({});
    expect(stats.byType).toEqual({});
    expect(stats.byPriority).toEqual({});
  });

  it('should count items by status', () => {
    const items = [
      createMockWorkItem({ id: 'wi-1', status: 'backlog' }),
      createMockWorkItem({ id: 'wi-2', status: 'backlog' }),
      createMockWorkItem({ id: 'wi-3', status: 'in-progress' }),
      createMockWorkItem({ id: 'wi-4', status: 'done' }),
    ];

    const stats = computeWorkItemStats(items);

    expect(stats.byStatus.backlog).toBe(2);
    expect(stats.byStatus['in-progress']).toBe(1);
    expect(stats.byStatus.done).toBe(1);
  });

  it('should count items by type', () => {
    const items = [
      createMockWorkItem({ id: 'wi-1', type: 'feature' }),
      createMockWorkItem({ id: 'wi-2', type: 'bug' }),
      createMockWorkItem({ id: 'wi-3', type: 'feature' }),
    ];

    const stats = computeWorkItemStats(items);

    expect(stats.byType.feature).toBe(2);
    expect(stats.byType.bug).toBe(1);
  });

  it('should count items by priority', () => {
    const items = [
      createMockWorkItem({ id: 'wi-1', priority: 'high' }),
      createMockWorkItem({ id: 'wi-2', priority: 'high' }),
      createMockWorkItem({ id: 'wi-3', priority: 'low' }),
    ];

    const stats = computeWorkItemStats(items);

    expect(stats.byPriority.high).toBe(2);
    expect(stats.byPriority.low).toBe(1);
  });

  it('should sum story points correctly', () => {
    const items = [
      createMockWorkItem({ id: 'wi-1', story_points: 5, status: 'backlog' }),
      createMockWorkItem({ id: 'wi-2', story_points: 3, status: 'done' }),
      createMockWorkItem({ id: 'wi-3', story_points: 8, status: 'done' }),
      createMockWorkItem({ id: 'wi-4', story_points: null, status: 'backlog' }),
    ];

    const stats = computeWorkItemStats(items);

    expect(stats.totalPoints).toBe(16);
    expect(stats.completedPoints).toBe(11);
  });

  it('should count items with due dates', () => {
    const items = [
      createMockWorkItem({ id: 'wi-1', due_date: '2026-03-01' }),
      createMockWorkItem({ id: 'wi-2', due_date: '2026-03-15' }),
      createMockWorkItem({ id: 'wi-3', due_date: null }),
    ];

    const stats = computeWorkItemStats(items);

    expect(stats.withDueDate).toBe(2);
  });

  it('should count overdue items (past due_date and not done)', () => {
    const items = [
      createMockWorkItem({ id: 'wi-1', due_date: '2020-01-01', status: 'backlog' }),
      createMockWorkItem({ id: 'wi-2', due_date: '2020-01-01', status: 'done' }),
      createMockWorkItem({ id: 'wi-3', due_date: '2099-12-31', status: 'backlog' }),
    ];

    const stats = computeWorkItemStats(items);

    expect(stats.overdue).toBe(1);
  });

  it('should handle items with zero story points', () => {
    const items = [
      createMockWorkItem({ id: 'wi-1', story_points: 0, status: 'backlog' }),
    ];

    const stats = computeWorkItemStats(items);

    // story_points 0 is falsy, so not counted
    expect(stats.totalPoints).toBe(0);
  });
});
