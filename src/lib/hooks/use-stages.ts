'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import {
  getStages,
  getStageById,
  createStage as createStageQuery,
  updateStage as updateStageQuery,
  deleteStage as deleteStageQuery,
} from '@/lib/supabase/queries/stages';
import type { CreateStageInput, UpdateStageInput } from '@/types/database';

export function useStages(serviceId: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.stages.byService(serviceId),
    queryFn: () => getStages(client, serviceId),
    enabled: !!serviceId,
  });
}

export function useStage(id: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.stages.detail(id),
    queryFn: () => getStageById(client, id),
    enabled: !!id,
  });
}

export function useCreateStage() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStageInput) => createStageQuery(client, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.stages.byService(variables.service_id),
      });
    },
  });
}

export function useUpdateStage(serviceId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStageInput }) =>
      updateStageQuery(client, id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.stages.byService(serviceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stages.detail(variables.id),
      });
    },
  });
}

export function useDeleteStage(serviceId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStageQuery(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.stages.byService(serviceId),
      });
    },
  });
}
