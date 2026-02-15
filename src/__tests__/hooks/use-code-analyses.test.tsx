import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import {
  useCodeAnalyses,
  useCodeAnalysis,
  useDeleteCodeAnalysis,
} from '@/lib/hooks/use-code-analyses';
import type { CodeAnalysis } from '@/types/database';

vi.mock('@/lib/supabase/queries/code-analyses', () => ({
  getCodeAnalyses: vi.fn(),
  getCodeAnalysisById: vi.fn(),
  deleteCodeAnalysis: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

import {
  getCodeAnalyses,
  getCodeAnalysisById,
  deleteCodeAnalysis,
} from '@/lib/supabase/queries/code-analyses';

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

describe('use-code-analyses hooks', () => {
  let queryClient: QueryClient;

  function createWrapper() {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe('useCodeAnalyses', () => {
    it('should fetch analyses for a service', async () => {
      const mockData = [createMockAnalysis({ id: 'a-1' }), createMockAnalysis({ id: 'a-2' })];
      vi.mocked(getCodeAnalyses).mockResolvedValue(mockData);

      const { result } = renderHook(() => useCodeAnalyses('svc-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(getCodeAnalyses).toHaveBeenCalled();
    });

    it('should handle error', async () => {
      vi.mocked(getCodeAnalyses).mockRejectedValue(new Error('fetch error'));

      const { result } = renderHook(() => useCodeAnalyses('svc-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('fetch error');
    });

    it('should not fetch when serviceId is empty', () => {
      const { result } = renderHook(() => useCodeAnalyses(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(getCodeAnalyses).not.toHaveBeenCalled();
    });
  });

  describe('useCodeAnalysis', () => {
    it('should fetch a single analysis', async () => {
      const mockData = createMockAnalysis();
      vi.mocked(getCodeAnalysisById).mockResolvedValue(mockData);

      const { result } = renderHook(() => useCodeAnalysis('analysis-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useDeleteCodeAnalysis', () => {
    it('should delete an analysis', async () => {
      vi.mocked(deleteCodeAnalysis).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteCodeAnalysis('svc-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate('analysis-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(deleteCodeAnalysis).toHaveBeenCalled();
    });
  });
});
