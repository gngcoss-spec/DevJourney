'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import {
  getAISessions,
  createAISession as createAISessionQuery,
  deleteAISession as deleteAISessionQuery,
} from '@/lib/supabase/queries/ai-sessions';
import type { CreateAISessionInput } from '@/types/database';

export function useAISessions(workItemId: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.workItems.aiSessions(workItemId),
    queryFn: () => getAISessions(client, workItemId),
    enabled: !!workItemId,
  });
}

export function useCreateAISession(workItemId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAISessionInput) => createAISessionQuery(client, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.aiSessions(workItemId),
      });
    },
  });
}

export function useDeleteAISession(workItemId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAISessionQuery(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.aiSessions(workItemId),
      });
    },
  });
}
