import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { useGenerateWBS } from '@/lib/hooks/use-generate-wbs';

vi.mock('@/lib/wbs/generate-wbs', () => ({
  generateWBS: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

import { generateWBS } from '@/lib/wbs/generate-wbs';

describe('useGenerateWBS', () => {
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

  it('should call generateWBS and invalidate related queries on success', async () => {
    const mockResult = { stages: 7, workItems: 25, decisions: 6, documents: 8 };
    vi.mocked(generateWBS).mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useGenerateWBS(), {
      wrapper: createWrapper(),
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    result.current.mutate('svc-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResult);
    expect(generateWBS).toHaveBeenCalledWith(expect.anything(), 'svc-1');

    // Should invalidate stages, work items, decisions, documents, and service detail
    expect(invalidateSpy).toHaveBeenCalledTimes(5);
  });

  it('should handle generation error', async () => {
    vi.mocked(generateWBS).mockRejectedValueOnce(new Error('WBS failed'));

    const { result } = renderHook(() => useGenerateWBS(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('svc-1');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(new Error('WBS failed'));
  });
});
