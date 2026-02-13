import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { globalSearch } from '@/lib/supabase/queries/search';

function createMockClient(results: {
  services: { data: unknown; error: unknown };
  work_items: { data: unknown; error: unknown };
  decisions: { data: unknown; error: unknown };
  dev_logs: { data: unknown; error: unknown };
  documents: { data: unknown; error: unknown };
}) {
  const tableMocks: Record<string, any> = {};

  for (const [table, result] of Object.entries(results)) {
    const chain: Record<string, unknown> = {};
    chain.select = vi.fn(() => chain);
    chain.or = vi.fn(() => chain);
    chain.order = vi.fn(() => chain);
    chain.limit = vi.fn(() => Promise.resolve(result));
    tableMocks[table] = chain;
  }

  const mock = {
    from: vi.fn((table: string) => tableMocks[table]),
  };

  return mock as unknown as SupabaseClient;
}

const emptyResults = {
  services: { data: [], error: null },
  work_items: { data: [], error: null },
  decisions: { data: [], error: null },
  dev_logs: { data: [], error: null },
  documents: { data: [], error: null },
};

describe('Search Query Functions', () => {
  describe('globalSearch', () => {
    it('should return empty results when query is less than 2 characters', async () => {
      const client = createMockClient(emptyResults);

      const result = await globalSearch(client, 'a');

      expect(result.total).toBe(0);
      expect(result.services).toEqual([]);
      expect(result.workItems).toEqual([]);
      expect(client.from).not.toHaveBeenCalled();
    });

    it('should return empty results for empty query string', async () => {
      const client = createMockClient(emptyResults);

      const result = await globalSearch(client, '');

      expect(result.total).toBe(0);
      expect(client.from).not.toHaveBeenCalled();
    });

    it('should query all 5 tables in parallel', async () => {
      const client = createMockClient(emptyResults);

      await globalSearch(client, 'test');

      expect(client.from).toHaveBeenCalledTimes(5);
      expect(client.from).toHaveBeenCalledWith('services');
      expect(client.from).toHaveBeenCalledWith('work_items');
      expect(client.from).toHaveBeenCalledWith('decisions');
      expect(client.from).toHaveBeenCalledWith('dev_logs');
      expect(client.from).toHaveBeenCalledWith('documents');
    });

    it('should group results by type correctly', async () => {
      const client = createMockClient({
        services: {
          data: [{ id: 'svc-1', name: 'Test Service', description: 'desc', created_at: '2026-01-01' }],
          error: null,
        },
        work_items: {
          data: [{ id: 'wi-1', title: 'Test Task', description: 'desc', service_id: 'svc-1', created_at: '2026-01-01' }],
          error: null,
        },
        decisions: {
          data: [{ id: 'dec-1', title: 'Test Decision', background: 'bg', service_id: 'svc-1', created_at: '2026-01-01' }],
          error: null,
        },
        dev_logs: {
          data: [{ id: 'log-1', done: 'Test done', decided: null, deferred: null, next_action: null, service_id: 'svc-1', created_at: '2026-01-01' }],
          error: null,
        },
        documents: {
          data: [{ id: 'doc-1', title: 'Test Doc', description: 'desc', service_id: 'svc-1', created_at: '2026-01-01' }],
          error: null,
        },
      });

      const result = await globalSearch(client, 'test');

      expect(result.services).toHaveLength(1);
      expect(result.workItems).toHaveLength(1);
      expect(result.decisions).toHaveLength(1);
      expect(result.devLogs).toHaveLength(1);
      expect(result.documents).toHaveLength(1);
      expect(result.total).toBe(5);
    });

    it('should handle null data gracefully', async () => {
      const client = createMockClient({
        services: { data: null, error: { message: 'Error' } },
        work_items: { data: null, error: { message: 'Error' } },
        decisions: { data: null, error: { message: 'Error' } },
        dev_logs: { data: null, error: { message: 'Error' } },
        documents: { data: [{ id: 'doc-1', title: 'Doc', description: null, service_id: 'svc-1', created_at: '2026-01-01' }], error: null },
      });

      const result = await globalSearch(client, 'test');

      expect(result.services).toEqual([]);
      expect(result.workItems).toEqual([]);
      expect(result.decisions).toEqual([]);
      expect(result.devLogs).toEqual([]);
      expect(result.documents).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should use ilike pattern with % wildcards', async () => {
      const client = createMockClient(emptyResults);

      await globalSearch(client, 'auth');

      // Verify .or() was called with proper ilike pattern on the services table
      const servicesChain = (client.from as any).mock.results[0].value;
      expect(servicesChain.or).toHaveBeenCalledWith(
        'name.ilike.%auth%,description.ilike.%auth%,goal.ilike.%auth%'
      );
    });

    it('should construct dev_log title from available fields', async () => {
      const client = createMockClient({
        ...emptyResults,
        dev_logs: {
          data: [
            { id: 'log-1', done: null, decided: 'Decided X', deferred: null, next_action: null, service_id: 'svc-1', created_at: '2026-01-01' },
            { id: 'log-2', done: null, decided: null, deferred: null, next_action: null, service_id: 'svc-1', created_at: '2026-01-02' },
          ],
          error: null,
        },
      });

      const result = await globalSearch(client, 'test');

      expect(result.devLogs[0].title).toBe('Decided X');
      expect(result.devLogs[1].title).toBe('개발 일지');
    });

    it('should pass limit parameter to each query', async () => {
      const client = createMockClient(emptyResults);

      await globalSearch(client, 'test', 10);

      // Check that .limit(10) was called on each table chain
      const tables = ['services', 'work_items', 'decisions', 'dev_logs', 'documents'];
      for (let i = 0; i < tables.length; i++) {
        const chain = (client.from as any).mock.results[i].value;
        expect(chain.limit).toHaveBeenCalledWith(10);
      }
    });
  });
});
