import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getCodeAnalyses,
  getCodeAnalysisById,
  deleteCodeAnalysis,
} from '@/lib/supabase/queries/code-analyses';
import type { CodeAnalysis } from '@/types/database';

function createMockAnalysis(overrides: Partial<CodeAnalysis> = {}): CodeAnalysis {
  return {
    id: 'analysis-1',
    service_id: 'svc-1',
    user_id: 'user-1',
    repo_url: 'https://github.com/test/repo',
    repo_owner: 'test',
    repo_name: 'repo',
    status: 'completed',
    repo_info: null,
    findings: [],
    summary: { total_findings: 0, by_category: {}, by_severity: {}, health_score: 100 },
    error_message: null,
    analyzed_at: '2026-02-15T00:00:00Z',
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-02-15T00:00:00Z',
    ...overrides,
  };
}

function createMockClient(terminateWith: { data: unknown; error: unknown }) {
  const mock: Record<string, unknown> = {};

  mock.then = vi.fn((resolve: (value: unknown) => void) => resolve(terminateWith));
  mock.from = vi.fn(() => mock);
  mock.select = vi.fn(() => mock);
  mock.delete = vi.fn(() => mock);
  mock.eq = vi.fn(() => mock);
  mock.order = vi.fn(() => Promise.resolve(terminateWith));
  mock.single = vi.fn(() => Promise.resolve(terminateWith));

  return mock as unknown as SupabaseClient & {
    from: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };
}

describe('Code Analyses Query Functions', () => {
  describe('getCodeAnalyses', () => {
    it('should return all analyses for a service', async () => {
      const mockAnalyses = [
        createMockAnalysis({ id: 'a-1' }),
        createMockAnalysis({ id: 'a-2' }),
      ];
      const client = createMockClient({ data: mockAnalyses, error: null });

      const result = await getCodeAnalyses(client, 'svc-1');

      expect(client.from).toHaveBeenCalledWith('code_analyses');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.eq).toHaveBeenCalledWith('service_id', 'svc-1');
      expect(client.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockAnalyses);
    });

    it('should throw an error when query fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      await expect(getCodeAnalyses(client, 'svc-1')).rejects.toThrow('Database error');
    });

    it('should return empty array when no analyses exist', async () => {
      const client = createMockClient({ data: [], error: null });

      const result = await getCodeAnalyses(client, 'svc-1');

      expect(result).toEqual([]);
    });

    it('should return empty array for table not found error', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'relation not found', code: '42P01' },
      });

      const result = await getCodeAnalyses(client, 'svc-1');

      expect(result).toEqual([]);
    });
  });

  describe('getCodeAnalysisById', () => {
    it('should return a single analysis by id', async () => {
      const mockAnalysis = createMockAnalysis({ id: 'a-1' });
      const client = createMockClient({ data: mockAnalysis, error: null });

      const result = await getCodeAnalysisById(client, 'a-1');

      expect(client.from).toHaveBeenCalledWith('code_analyses');
      expect(client.eq).toHaveBeenCalledWith('id', 'a-1');
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(mockAnalysis);
    });

    it('should return null when not found (PGRST116)', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });

      const result = await getCodeAnalysisById(client, 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('deleteCodeAnalysis', () => {
    it('should delete an analysis by id', async () => {
      const client = createMockClient({ data: null, error: null });

      await deleteCodeAnalysis(client, 'a-1');

      expect(client.from).toHaveBeenCalledWith('code_analyses');
      expect(client.delete).toHaveBeenCalled();
      expect(client.eq).toHaveBeenCalledWith('id', 'a-1');
    });

    it('should throw an error when deletion fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Delete failed', code: '500' },
      });

      await expect(deleteCodeAnalysis(client, 'a-1')).rejects.toThrow('Delete failed');
    });
  });
});
