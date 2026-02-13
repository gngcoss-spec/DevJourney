import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { useGlobalSearch } from '@/lib/hooks/use-global-search';

vi.mock('@/lib/supabase/queries/search', () => ({
  globalSearch: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

import { globalSearch } from '@/lib/supabase/queries/search';

describe('useGlobalSearch', () => {
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
      },
    });
    vi.clearAllMocks();
  });

  it('should return null results initially', () => {
    const { result } = renderHook(() => useGlobalSearch(), {
      wrapper: createWrapper(),
    });

    expect(result.current.results).toBeNull();
    expect(result.current.inputValue).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  it('should not execute search for short queries', async () => {
    const { result } = renderHook(() => useGlobalSearch(50), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setInputValue('a');
    });

    // Wait for debounce
    await waitFor(() => {
      expect(result.current.inputValue).toBe('a');
    });

    // globalSearch should not be called
    expect(globalSearch).not.toHaveBeenCalled();
  });

  it('should debounce and execute search for valid queries', async () => {
    const mockResults = {
      services: [],
      workItems: [],
      decisions: [],
      devLogs: [],
      documents: [],
      total: 0,
    };
    (globalSearch as any).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useGlobalSearch(50), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setInputValue('test');
    });

    await waitFor(() => {
      expect(globalSearch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockResults);
    });
  });

  it('should return search results when query matches', async () => {
    const mockResults = {
      services: [{ id: 'svc-1', type: 'service', title: 'Test', description: null, service_id: 'svc-1', created_at: '2026-01-01' }],
      workItems: [],
      decisions: [],
      devLogs: [],
      documents: [],
      total: 1,
    };
    (globalSearch as any).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useGlobalSearch(50), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setInputValue('test');
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockResults);
      expect(result.current.results!.total).toBe(1);
    });
  });

  it('should reset input and results when reset is called', async () => {
    const mockResults = {
      services: [],
      workItems: [],
      decisions: [],
      devLogs: [],
      documents: [],
      total: 0,
    };
    (globalSearch as any).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useGlobalSearch(50), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setInputValue('test');
    });

    await waitFor(() => {
      expect(globalSearch).toHaveBeenCalled();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.inputValue).toBe('');
  });
});
