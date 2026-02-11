// @TASK P4-R1-T1 - Dev Logs TanStack Query hooks
// @SPEC docs/planning/TASKS.md#dev-logs-hooks
// @TEST src/__tests__/hooks/use-dev-logs.test.tsx

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import {
  getDevLogs,
  getAllDevLogs,
  getDevLogByDate,
  createDevLog as createDevLogQuery,
  updateDevLog as updateDevLogQuery,
} from '@/lib/supabase/queries/dev-logs';
import type { CreateDevLogInput, UpdateDevLogInput, DevLog } from '@/types/database';

/**
 * Fetch all dev logs for a specific service.
 * Uses TanStack Query for caching and automatic refetching.
 * Query is disabled when serviceId is empty.
 */
export function useDevLogs(serviceId: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.devLogs.byService(serviceId),
    queryFn: () => getDevLogs(client, serviceId),
    enabled: !!serviceId,
  });
}

/**
 * Fetch all dev logs across all services.
 * Optionally limits results (default 20).
 */
export function useAllDevLogs(limit?: number) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.devLogs.all,
    queryFn: () => getAllDevLogs(client, limit),
  });
}

/**
 * Fetch a dev log for a specific service and date.
 * Returns null if not found.
 * Query is disabled when serviceId or date is empty.
 */
export function useDevLogByDate(serviceId: string, date: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.devLogs.byDate(serviceId, date),
    queryFn: () => getDevLogByDate(client, serviceId, date),
    enabled: !!serviceId && !!date,
  });
}

/**
 * Create a new dev log.
 * Invalidates all dev logs queries for the service on success.
 */
export function useCreateDevLog() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDevLogInput) => createDevLogQuery(client, data),
    onSuccess: (_data, variables) => {
      // Invalidate all dev logs for the service
      queryClient.invalidateQueries({
        queryKey: queryKeys.devLogs.byService(variables.service_id),
      });
      // Also invalidate the global all dev logs
      queryClient.invalidateQueries({
        queryKey: queryKeys.devLogs.all,
      });
    },
  });
}

/**
 * Update an existing dev log.
 * Invalidates relevant dev logs queries on success.
 */
export function useUpdateDevLog(serviceId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDevLogInput;
    }) => updateDevLogQuery(client, id, data),
    onSuccess: () => {
      // Invalidate all dev logs for the service
      queryClient.invalidateQueries({
        queryKey: queryKeys.devLogs.byService(serviceId),
      });
      // Also invalidate the global all dev logs
      queryClient.invalidateQueries({
        queryKey: queryKeys.devLogs.all,
      });
    },
  });
}
