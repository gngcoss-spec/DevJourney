// @TASK P3-R1-T3 - Work Items TanStack Query hooks
// @SPEC docs/planning/TASKS.md#work-items-hooks
// @TEST src/__tests__/hooks/use-work-items.test.tsx

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import {
  getWorkItems,
  getWorkItemById,
  createWorkItem as createWorkItemQuery,
  updateWorkItem as updateWorkItemQuery,
  updateWorkItemPosition,
  deleteWorkItem as deleteWorkItemQuery,
} from '@/lib/supabase/queries/work-items';
import type {
  CreateWorkItemInput,
  UpdateWorkItemInput,
  WorkItem,
  WorkItemStatus,
} from '@/types/database';

/**
 * Fetch all work items for a specific service.
 * Uses TanStack Query for caching and automatic refetching.
 * Query is disabled when serviceId is empty.
 */
export function useWorkItems(serviceId: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.workItems.all(serviceId),
    queryFn: () => getWorkItems(client, serviceId),
    enabled: !!serviceId,
  });
}

/**
 * Fetch a single work item by ID.
 * Query is disabled when id is empty.
 */
export function useWorkItem(id: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.workItems.detail(id),
    queryFn: () => getWorkItemById(client, id),
    enabled: !!id,
  });
}

/**
 * Create a new work item.
 * Invalidates work items query for the related service on success.
 */
export function useCreateWorkItem() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkItemInput) => createWorkItemQuery(client, data),
    onSuccess: (_data, variables) => {
      // Invalidate work items for the service
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.all(variables.service_id),
      });
    },
  });
}

/**
 * Update an existing work item.
 * Invalidates both all work items (for the service) and specific work item queries on success.
 */
export function useUpdateWorkItem() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      serviceId: string;
      data: UpdateWorkItemInput;
    }) => updateWorkItemQuery(client, id, data),
    onSuccess: (_data, variables) => {
      // Invalidate work items for the service
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.all(variables.serviceId),
      });
      // Invalidate specific work item
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.detail(variables.id),
      });
    },
  });
}

/**
 * Move a work item to a different status/position (Kanban drag-and-drop).
 * Uses optimistic updates for instant UI feedback.
 * Rolls back on error and syncs with server on success.
 */
export function useMoveWorkItem(serviceId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      position,
    }: {
      id: string;
      status: WorkItemStatus;
      position: number;
    }) => updateWorkItemPosition(client, id, status, position),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.workItems.all(serviceId),
      });

      // Snapshot previous value
      const previousItems = queryClient.getQueryData<WorkItem[]>(
        queryKeys.workItems.all(serviceId)
      );

      // Optimistically update to the new value
      queryClient.setQueryData<WorkItem[]>(
        queryKeys.workItems.all(serviceId),
        (old) => {
          if (!old) return old;
          return old.map((item) =>
            item.id === newData.id
              ? { ...item, status: newData.status, sort_order: newData.position }
              : item
          );
        }
      );

      // Return context with previous value
      return { previousItems };
    },
    onError: (_err, _newData, context) => {
      // Rollback to previous value on error
      if (context?.previousItems) {
        queryClient.setQueryData(
          queryKeys.workItems.all(serviceId),
          context.previousItems
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to sync with server
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.all(serviceId),
      });
    },
  });
}

/**
 * Delete a work item.
 * Invalidates work items query for the related service on success.
 */
export function useDeleteWorkItem(serviceId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorkItemQuery(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.all(serviceId),
      });
    },
  });
}
