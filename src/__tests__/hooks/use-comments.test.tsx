import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import {
  useComments,
  useCreateComment,
  useCreateStatusChangeLog,
} from '@/lib/hooks/use-comments';
import type { WorkItemComment } from '@/types/database';

vi.mock('@/lib/supabase/queries/comments', () => ({
  getComments: vi.fn(),
  createComment: vi.fn(),
  createStatusChangeLog: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

import {
  getComments,
  createComment,
  createStatusChangeLog,
} from '@/lib/supabase/queries/comments';

const mockComment: WorkItemComment = {
  id: 'comment-1',
  work_item_id: 'wi-1',
  user_id: 'user-1',
  author_name: 'User',
  content: 'Test comment',
  comment_type: 'comment',
  metadata: {},
  created_at: '2026-02-13T00:00:00Z',
  updated_at: '2026-02-12T00:00:00Z',
  is_edited: false,
};

describe('use-comments hooks', () => {
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

  describe('useComments', () => {
    it('should fetch comments for a work item successfully', async () => {
      vi.mocked(getComments).mockResolvedValueOnce([mockComment]);

      const { result } = renderHook(() => useComments('wi-1'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([mockComment]);
      expect(getComments).toHaveBeenCalledWith(expect.anything(), 'wi-1');
    });

    it('should not fetch when workItemId is empty', async () => {
      const { result } = renderHook(() => useComments(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(getComments).not.toHaveBeenCalled();
    });
  });

  describe('useCreateComment', () => {
    it('should create comment and invalidate queries', async () => {
      const mockCreated: WorkItemComment = {
        ...mockComment,
        id: 'comment-new',
        content: 'New comment',
      };

      vi.mocked(createComment).mockResolvedValueOnce(mockCreated);

      const { result } = renderHook(() => useCreateComment('wi-1'), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({
        work_item_id: 'wi-1',
        author_name: 'User',
        content: 'New comment',
        comment_type: 'comment',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCreated);
      expect(createComment).toHaveBeenCalledWith(expect.anything(), {
        work_item_id: 'wi-1',
        author_name: 'User',
        content: 'New comment',
        comment_type: 'comment',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['work-items', 'wi-1', 'comments'],
      });
    });

    it('should handle create error', async () => {
      vi.mocked(createComment).mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useCreateComment('wi-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        work_item_id: 'wi-1',
        author_name: 'User',
        content: 'Fail',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Create failed'));
    });
  });

  describe('useCreateStatusChangeLog', () => {
    it('should create status change log and invalidate queries', async () => {
      const mockStatusComment: WorkItemComment = {
        ...mockComment,
        id: 'comment-status',
        author_name: 'System',
        content: 'Status changed from backlog to in-progress',
        comment_type: 'status_change',
        metadata: { from_status: 'backlog', to_status: 'in-progress' },
      };

      vi.mocked(createStatusChangeLog).mockResolvedValueOnce(mockStatusComment);

      const { result } = renderHook(() => useCreateStatusChangeLog('wi-1'), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({ fromStatus: 'backlog', toStatus: 'in-progress' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockStatusComment);
      expect(createStatusChangeLog).toHaveBeenCalledWith(
        expect.anything(),
        'wi-1',
        'backlog',
        'in-progress'
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['work-items', 'wi-1', 'comments'],
      });
    });

    it('should handle status change error', async () => {
      vi.mocked(createStatusChangeLog).mockRejectedValueOnce(new Error('Status change failed'));

      const { result } = renderHook(() => useCreateStatusChangeLog('wi-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ fromStatus: 'backlog', toStatus: 'done' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Status change failed'));
    });
  });
});
