'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import {
  getDecisions,
  getDecisionById,
  createDecision as createDecisionQuery,
  updateDecision as updateDecisionQuery,
  deleteDecision as deleteDecisionQuery,
} from '@/lib/supabase/queries/decisions';
import type { CreateDecisionInput, UpdateDecisionInput } from '@/types/database';

export function useDecisions(serviceId: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.decisions.byService(serviceId),
    queryFn: () => getDecisions(client, serviceId),
    enabled: !!serviceId,
  });
}

export function useDecision(id: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.decisions.detail(id),
    queryFn: () => getDecisionById(client, id),
    enabled: !!id,
  });
}

export function useCreateDecision() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDecisionInput) => createDecisionQuery(client, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.decisions.byService(variables.service_id),
      });
    },
  });
}

export function useUpdateDecision(serviceId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDecisionInput }) =>
      updateDecisionQuery(client, id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.decisions.byService(serviceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.decisions.detail(variables.id),
      });
    },
  });
}

export function useDeleteDecision(serviceId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDecisionQuery(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.decisions.byService(serviceId),
      });
    },
  });
}
