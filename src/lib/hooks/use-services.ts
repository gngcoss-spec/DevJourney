// @TASK P2-R1-T3 - Services TanStack Query hooks
// @SPEC docs/planning/TASKS.md#services-hooks
// @TEST src/__tests__/hooks/use-services.test.tsx

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import {
  getServices,
  getServiceById,
  createService as createServiceQuery,
  updateService as updateServiceQuery,
  deleteService as deleteServiceQuery,
} from '@/lib/supabase/queries/services';
import type { CreateServiceInput, UpdateServiceInput } from '@/types/database';

/**
 * Fetch all services for the authenticated user.
 * Uses TanStack Query for caching and automatic refetching.
 */
export function useServices() {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.services.all,
    queryFn: () => getServices(client),
  });
}

/**
 * Fetch a single service by ID.
 * Query is disabled when id is empty.
 */
export function useService(id: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn: () => getServiceById(client, id),
    enabled: !!id,
  });
}

/**
 * Create a new service.
 * Invalidates all services query on success.
 */
export function useCreateService() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceInput) => createServiceQuery(client, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
}

/**
 * Update an existing service.
 * Invalidates both all services and specific service queries on success.
 */
export function useUpdateService() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceInput }) =>
      updateServiceQuery(client, id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.services.detail(variables.id) });
    },
  });
}

/**
 * Delete a service by ID.
 * Invalidates all services query on success.
 */
export function useDeleteService() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteServiceQuery(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
}
