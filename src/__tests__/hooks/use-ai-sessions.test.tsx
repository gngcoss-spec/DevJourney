import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import {
  useAISessions,
  useCreateAISession,
  useDeleteAISession,
} from '@/lib/hooks/use-ai-sessions';
import type { AISession } from '@/types/database';

vi.mock('@/lib/supabase/queries/ai-sessions', () => ({
  getAISessions: vi.fn(),
  createAISession: vi.fn(),
  deleteAISession: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

import {
  getAISessions,
  createAISession,
  deleteAISession,
} from '@/lib/supabase/queries/ai-sessions';

describe('use-ai-sessions hooks', () => {
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

  describe('useAISessions', () => {
    it('should fetch AI sessions for a work item successfully', async () => {
      const mockSessions: AISession[] = [
        {
          id: 'session-1',
          work_item_id: 'wi-1',
          user_id: 'user-1',
          provider: 'chatgpt',
          session_url: 'https://chat.openai.com/share/abc',
          title: 'Auth discussion',
          summary: 'Discussed JWT vs session auth',
          key_decisions: 'Use JWT',
          created_at: '2026-02-11T00:00:00Z',
        },
      ];

      vi.mocked(getAISessions).mockResolvedValueOnce(mockSessions);

      const { result } = renderHook(() => useAISessions('wi-1'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSessions);
      expect(getAISessions).toHaveBeenCalledWith(expect.anything(), 'wi-1');
    });

    it('should not fetch when workItemId is empty', async () => {
      const { result } = renderHook(() => useAISessions(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(getAISessions).not.toHaveBeenCalled();
    });
  });

  describe('useCreateAISession', () => {
    it('should create AI session and invalidate queries', async () => {
      const mockCreated: AISession = {
        id: 'session-new',
        work_item_id: 'wi-1',
        user_id: 'user-1',
        provider: 'claude',
        session_url: null,
        title: 'New session',
        summary: null,
        key_decisions: null,
        created_at: '2026-02-12T00:00:00Z',
      };

      vi.mocked(createAISession).mockResolvedValueOnce(mockCreated);

      const { result } = renderHook(() => useCreateAISession('wi-1'), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({
        work_item_id: 'wi-1',
        title: 'New session',
        provider: 'claude',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCreated);
      expect(createAISession).toHaveBeenCalledWith(expect.anything(), {
        work_item_id: 'wi-1',
        title: 'New session',
        provider: 'claude',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['work-items', 'wi-1', 'ai-sessions'],
      });
    });

    it('should handle create error', async () => {
      vi.mocked(createAISession).mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useCreateAISession('wi-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ work_item_id: 'wi-1', title: 'New session' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Create failed'));
    });
  });

  describe('useDeleteAISession', () => {
    it('should delete AI session and invalidate queries', async () => {
      vi.mocked(deleteAISession).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteAISession('wi-1'), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate('session-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(deleteAISession).toHaveBeenCalledWith(expect.anything(), 'session-1');
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['work-items', 'wi-1', 'ai-sessions'],
      });
    });

    it('should handle delete error', async () => {
      vi.mocked(deleteAISession).mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useDeleteAISession('wi-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate('session-1');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Delete failed'));
    });
  });
});
