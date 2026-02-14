// @TASK P3-R1-T3 - Work Items TanStack Query hooks tests
// @SPEC docs/planning/TASKS.md#work-items-hooks
// @TEST src/__tests__/hooks/use-work-items.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import {
  useWorkItems,
  useWorkItem,
  useCreateWorkItem,
  useUpdateWorkItem,
  useMoveWorkItem,
  useDeleteWorkItem,
} from '@/lib/hooks/use-work-items';
import type { WorkItem } from '@/types/database';

// Mock Supabase query functions
vi.mock('@/lib/supabase/queries/work-items', () => ({
  getWorkItems: vi.fn(),
  getWorkItemById: vi.fn(),
  createWorkItem: vi.fn(),
  updateWorkItem: vi.fn(),
  updateWorkItemPosition: vi.fn(),
  deleteWorkItem: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

// Import mocked functions
import {
  getWorkItems,
  getWorkItemById,
  createWorkItem,
  updateWorkItem,
  updateWorkItemPosition,
  deleteWorkItem,
} from '@/lib/supabase/queries/work-items';

describe('use-work-items hooks', () => {
  let queryClient: QueryClient;

  // Helper to create wrapper with QueryClientProvider
  function createWrapper() {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  beforeEach(() => {
    // Reset query client before each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe('useWorkItems', () => {
    it('should fetch all work items for a service successfully', async () => {
      const mockWorkItems: WorkItem[] = [
        {
          id: 'wi-1',
          service_id: 'service-1',
          user_id: 'user-1',
          title: 'Implement Auth',
          description: 'Add JWT authentication',
          type: 'feature',
          priority: 'high',
          status: 'in-progress',
          problem: null,
          options_considered: null,
          decision_reason: null,
          result: null,
          assignee_name: 'John Doe',
          due_date: null,
          labels: [],
          assignee_id: null,
          story_points: null,
          parent_id: null,
          sort_order: 0,
          created_at: '2026-02-11T00:00:00Z',
          updated_at: '2026-02-11T00:00:00Z',
        },
        {
          id: 'wi-2',
          service_id: 'service-1',
          user_id: 'user-1',
          title: 'Fix login bug',
          description: null,
          type: 'bug',
          priority: 'urgent',
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
          sort_order: 1,
          created_at: '2026-02-10T00:00:00Z',
          updated_at: '2026-02-10T00:00:00Z',
        },
      ];

      vi.mocked(getWorkItems).mockResolvedValueOnce(mockWorkItems);

      const { result } = renderHook(() => useWorkItems('service-1'), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockWorkItems);
      expect(getWorkItems).toHaveBeenCalledWith(expect.anything(), 'service-1');
    });

    it('should handle fetch error', async () => {
      vi.mocked(getWorkItems).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useWorkItems('service-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Network error'));
    });

    it('should not fetch when serviceId is empty', async () => {
      const { result } = renderHook(() => useWorkItems(''), {
        wrapper: createWrapper(),
      });

      // Query should be disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(getWorkItems).not.toHaveBeenCalled();
    });
  });

  describe('useWorkItem', () => {
    it('should fetch single work item by id successfully', async () => {
      const mockWorkItem: WorkItem = {
        id: 'wi-1',
        service_id: 'service-1',
        user_id: 'user-1',
        title: 'Implement Auth',
        description: 'Add JWT authentication',
        type: 'feature',
        priority: 'high',
        status: 'in-progress',
        problem: 'No auth system',
        options_considered: 'JWT vs Session',
        decision_reason: 'JWT is stateless',
        result: 'Implemented successfully',
        assignee_name: 'John Doe',
        due_date: null,
        labels: [],
        assignee_id: null,
        story_points: null,
        parent_id: null,
        sort_order: 0,
        created_at: '2026-02-11T00:00:00Z',
        updated_at: '2026-02-11T00:00:00Z',
      };

      vi.mocked(getWorkItemById).mockResolvedValueOnce(mockWorkItem);

      const { result } = renderHook(() => useWorkItem('wi-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockWorkItem);
      expect(getWorkItemById).toHaveBeenCalledWith(expect.anything(), 'wi-1');
    });

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useWorkItem(''), {
        wrapper: createWrapper(),
      });

      // Query should be disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(getWorkItemById).not.toHaveBeenCalled();
    });

    it('should return null for not found work item', async () => {
      vi.mocked(getWorkItemById).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useWorkItem('nonexistent'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeNull();
    });
  });

  describe('useCreateWorkItem', () => {
    it('should create work item and invalidate queries', async () => {
      const mockCreated: WorkItem = {
        id: 'wi-new',
        service_id: 'service-1',
        user_id: 'user-1',
        title: 'New Task',
        description: 'Task description',
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
        sort_order: 0,
        created_at: '2026-02-12T00:00:00Z',
        updated_at: '2026-02-12T00:00:00Z',
      };

      vi.mocked(createWorkItem).mockResolvedValueOnce(mockCreated);

      const { result } = renderHook(() => useCreateWorkItem(), {
        wrapper: createWrapper(),
      });

      // Spy on invalidateQueries
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      // Trigger mutation
      result.current.mutate({
        service_id: 'service-1',
        title: 'New Task',
        description: 'Task description',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCreated);
      expect(createWorkItem).toHaveBeenCalledWith(expect.anything(), {
        service_id: 'service-1',
        title: 'New Task',
        description: 'Task description',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['work-items', 'service-1'],
      });
    });

    it('should handle create error', async () => {
      vi.mocked(createWorkItem).mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useCreateWorkItem(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ service_id: 'service-1', title: 'New Task' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Create failed'));
    });
  });

  describe('useUpdateWorkItem', () => {
    it('should update work item and invalidate queries', async () => {
      const mockUpdated: WorkItem = {
        id: 'wi-1',
        service_id: 'service-1',
        user_id: 'user-1',
        title: 'Updated Task',
        description: 'Updated description',
        type: 'feature',
        priority: 'high',
        status: 'done',
        problem: null,
        options_considered: null,
        decision_reason: null,
        result: 'Completed',
        assignee_name: 'John Doe',
        due_date: null,
        labels: [],
        assignee_id: null,
        sort_order: 0,
        created_at: '2026-02-11T00:00:00Z',
        updated_at: '2026-02-12T00:00:00Z',
      };

      vi.mocked(updateWorkItem).mockResolvedValueOnce(mockUpdated);

      const { result } = renderHook(() => useUpdateWorkItem(), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({
        id: 'wi-1',
        serviceId: 'service-1',
        data: { title: 'Updated Task', status: 'done' },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockUpdated);
      expect(updateWorkItem).toHaveBeenCalledWith(expect.anything(), 'wi-1', {
        title: 'Updated Task',
        status: 'done',
      });
      // Should invalidate both all work items and specific work item
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['work-items', 'service-1'],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['work-items', 'detail', 'wi-1'],
      });
    });

    it('should handle update error', async () => {
      vi.mocked(updateWorkItem).mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useUpdateWorkItem(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: 'wi-1',
        serviceId: 'service-1',
        data: { title: 'Updated' },
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Update failed'));
    });
  });

  describe('useMoveWorkItem', () => {
    it('should update work item position with optimistic update', async () => {
      const initialWorkItems: WorkItem[] = [
        {
          id: 'wi-1',
          service_id: 'service-1',
          user_id: 'user-1',
          title: 'Task 1',
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
          sort_order: 0,
          created_at: '2026-02-11T00:00:00Z',
          updated_at: '2026-02-11T00:00:00Z',
        },
        {
          id: 'wi-2',
          service_id: 'service-1',
          user_id: 'user-1',
          title: 'Task 2',
          description: null,
          type: 'bug',
          priority: 'high',
          status: 'backlog',
          problem: null,
          options_considered: null,
          decision_reason: null,
          result: null,
          assignee_name: null,
          due_date: null,
          labels: [],
          assignee_id: null,
          sort_order: 1,
          created_at: '2026-02-11T00:00:00Z',
          updated_at: '2026-02-11T00:00:00Z',
        },
      ];

      const updatedWorkItem: WorkItem = {
        ...initialWorkItems[0],
        status: 'in-progress',
        sort_order: 5,
      };

      // Pre-populate query cache
      queryClient.setQueryData(['work-items', 'service-1'], initialWorkItems);

      vi.mocked(updateWorkItemPosition).mockResolvedValueOnce(updatedWorkItem);

      const { result } = renderHook(() => useMoveWorkItem('service-1'), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      // Trigger mutation
      result.current.mutate({
        id: 'wi-1',
        status: 'in-progress',
        position: 5,
      });

      // Check optimistic update happened after onMutate
      await waitFor(() => {
        const cachedData = queryClient.getQueryData<WorkItem[]>(['work-items', 'service-1']);
        expect(cachedData).toBeDefined();
        const movedItem = cachedData?.find((item) => item.id === 'wi-1');
        expect(movedItem?.status).toBe('in-progress');
        expect(movedItem?.sort_order).toBe(5);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(updateWorkItemPosition).toHaveBeenCalledWith(
        expect.anything(),
        'wi-1',
        'in-progress',
        5
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['work-items', 'service-1'],
      });
    });

    it('should rollback on error', async () => {
      const initialWorkItems: WorkItem[] = [
        {
          id: 'wi-1',
          service_id: 'service-1',
          user_id: 'user-1',
          title: 'Task 1',
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
          sort_order: 0,
          created_at: '2026-02-11T00:00:00Z',
          updated_at: '2026-02-11T00:00:00Z',
        },
      ];

      // Pre-populate query cache
      queryClient.setQueryData(['work-items', 'service-1'], initialWorkItems);

      vi.mocked(updateWorkItemPosition).mockRejectedValueOnce(
        new Error('Position update failed')
      );

      const { result } = renderHook(() => useMoveWorkItem('service-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: 'wi-1',
        status: 'in-progress',
        position: 5,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // Should rollback to initial data
      const cachedData = queryClient.getQueryData<WorkItem[]>(['work-items', 'service-1']);
      expect(cachedData).toEqual(initialWorkItems);
      expect(result.current.error).toEqual(new Error('Position update failed'));
    });
  });

  describe('useDeleteWorkItem', () => {
    it('should delete work item and invalidate queries', async () => {
      vi.mocked(deleteWorkItem).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteWorkItem('service-1'), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate('wi-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(deleteWorkItem).toHaveBeenCalledWith(expect.anything(), 'wi-1');
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['work-items', 'service-1'],
      });
    });

    it('should handle delete error', async () => {
      vi.mocked(deleteWorkItem).mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useDeleteWorkItem('service-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate('wi-1');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Delete failed'));
    });
  });
});
