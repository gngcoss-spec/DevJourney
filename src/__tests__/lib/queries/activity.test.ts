import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { getRecentActivities } from '@/lib/supabase/queries/activity';

function createMockClient(results: {
  work_items: { data: unknown; error: unknown };
  decisions: { data: unknown; error: unknown };
  dev_logs: { data: unknown; error: unknown };
  documents: { data: unknown; error: unknown };
}) {
  const tableMocks: Record<string, any> = {};

  for (const [table, result] of Object.entries(results)) {
    const chain: Record<string, unknown> = {};
    chain.select = vi.fn(() => chain);
    chain.order = vi.fn(() => chain);
    chain.limit = vi.fn(() => Promise.resolve(result));
    tableMocks[table] = chain;
  }

  const mock = {
    from: vi.fn((table: string) => tableMocks[table] || tableMocks['work_items']),
  };

  return mock as unknown as SupabaseClient;
}

describe('Activity Query Functions', () => {
  describe('getRecentActivities', () => {
    it('should aggregate activities from multiple tables', async () => {
      const client = createMockClient({
        work_items: {
          data: [{ id: 'wi-1', title: 'Task 1', service_id: 'svc-1', created_at: '2026-02-12T10:00:00Z' }],
          error: null,
        },
        decisions: {
          data: [{ id: 'dec-1', title: 'Decision 1', service_id: 'svc-1', created_at: '2026-02-12T09:00:00Z' }],
          error: null,
        },
        dev_logs: {
          data: [{ id: 'log-1', done: 'Log entry', service_id: 'svc-1', created_at: '2026-02-12T08:00:00Z' }],
          error: null,
        },
        documents: {
          data: [{ id: 'doc-1', title: 'Doc 1', service_id: 'svc-1', created_at: '2026-02-12T07:00:00Z' }],
          error: null,
        },
      });

      const result = await getRecentActivities(client);

      expect(result).toHaveLength(4);
      // Should be sorted by created_at DESC
      expect(result[0].type).toBe('work_item');
      expect(result[1].type).toBe('decision');
      expect(result[2].type).toBe('dev_log');
      expect(result[3].type).toBe('document');
    });

    it('should return empty array when no activities exist', async () => {
      const client = createMockClient({
        work_items: { data: [], error: null },
        decisions: { data: [], error: null },
        dev_logs: { data: [], error: null },
        documents: { data: [], error: null },
      });

      const result = await getRecentActivities(client);

      expect(result).toEqual([]);
    });

    it('should handle null data from tables gracefully', async () => {
      const client = createMockClient({
        work_items: { data: null, error: { message: 'Error' } },
        decisions: { data: null, error: { message: 'Error' } },
        dev_logs: { data: [{ id: 'log-1', done: 'Only log', service_id: 'svc-1', created_at: '2026-02-12T00:00:00Z' }], error: null },
        documents: { data: null, error: { message: 'Error' } },
      });

      const result = await getRecentActivities(client);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('dev_log');
    });

    it('should sort all activities by created_at DESC', async () => {
      const client = createMockClient({
        work_items: {
          data: [{ id: 'wi-1', title: 'Late item', service_id: 'svc-1', created_at: '2026-02-12T23:00:00Z' }],
          error: null,
        },
        decisions: {
          data: [{ id: 'dec-1', title: 'Early decision', service_id: 'svc-1', created_at: '2026-02-12T01:00:00Z' }],
          error: null,
        },
        dev_logs: { data: [], error: null },
        documents: {
          data: [{ id: 'doc-1', title: 'Mid doc', service_id: 'svc-1', created_at: '2026-02-12T12:00:00Z' }],
          error: null,
        },
      });

      const result = await getRecentActivities(client);

      expect(result[0].title).toBe('Late item');
      expect(result[1].title).toBe('Mid doc');
      expect(result[2].title).toBe('Early decision');
    });

    it('should respect the limit parameter', async () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: `wi-${i}`, title: `Item ${i}`, service_id: 'svc-1',
        created_at: `2026-02-${String(12 - i).padStart(2, '0')}T00:00:00Z`,
      }));

      const client = createMockClient({
        work_items: { data: items, error: null },
        decisions: { data: [], error: null },
        dev_logs: { data: [], error: null },
        documents: { data: [], error: null },
      });

      const result = await getRecentActivities(client, 5);

      expect(result).toHaveLength(5);
    });
  });
});
