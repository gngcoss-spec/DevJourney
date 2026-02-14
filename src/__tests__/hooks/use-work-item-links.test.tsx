import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import {
  useWorkItemLinks,
  useCreateWorkItemLink,
  useDeleteWorkItemLink,
} from '@/lib/hooks/use-work-item-links';
import type { WorkItemLink } from '@/types/database';

vi.mock('@/lib/supabase/queries/work-item-links', () => ({
  getWorkItemLinks: vi.fn(),
  createWorkItemLink: vi.fn(),
  deleteWorkItemLink: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

import {
  getWorkItemLinks,
  createWorkItemLink,
  deleteWorkItemLink,
} from '@/lib/supabase/queries/work-item-links';

const mockLink: WorkItemLink = {
  id: 'link-1',
  source_id: 'wi-1',
  target_id: 'wi-2',
  link_type: 'relates_to',
  user_id: 'user-1',
  created_at: '2026-02-12T00:00:00Z',
};

describe('use-work-item-links hooks', () => {
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

  describe('useWorkItemLinks', () => {
    it('should fetch links for a work item successfully', async () => {
      vi.mocked(getWorkItemLinks).mockResolvedValueOnce([mockLink]);

      const { result } = renderHook(() => useWorkItemLinks('wi-1'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([mockLink]);
      expect(getWorkItemLinks).toHaveBeenCalledWith(expect.anything(), 'wi-1');
    });

    it('should not fetch when workItemId is empty', async () => {
      const { result } = renderHook(() => useWorkItemLinks(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(getWorkItemLinks).not.toHaveBeenCalled();
    });
  });

  describe('useCreateWorkItemLink', () => {
    it('should create link and invalidate queries', async () => {
      const mockCreated: WorkItemLink = {
        ...mockLink,
        id: 'link-new',
        target_id: 'wi-3',
      };

      vi.mocked(createWorkItemLink).mockResolvedValueOnce(mockCreated);

      const { result } = renderHook(() => useCreateWorkItemLink('wi-1'), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({
        source_id: 'wi-1',
        target_id: 'wi-3',
        link_type: 'blocks',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCreated);
      expect(createWorkItemLink).toHaveBeenCalledWith(expect.anything(), {
        source_id: 'wi-1',
        target_id: 'wi-3',
        link_type: 'blocks',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['work-items', 'wi-1', 'links'],
      });
    });

    it('should handle create error', async () => {
      vi.mocked(createWorkItemLink).mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useCreateWorkItemLink('wi-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        source_id: 'wi-1',
        target_id: 'wi-2',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Create failed'));
    });
  });

  describe('useDeleteWorkItemLink', () => {
    it('should delete link and invalidate queries', async () => {
      vi.mocked(deleteWorkItemLink).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteWorkItemLink('wi-1'), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate('link-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(deleteWorkItemLink).toHaveBeenCalledWith(expect.anything(), 'link-1');
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['work-items', 'wi-1', 'links'],
      });
    });

    it('should handle delete error', async () => {
      vi.mocked(deleteWorkItemLink).mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useDeleteWorkItemLink('wi-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate('link-1');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Delete failed'));
    });
  });
});
