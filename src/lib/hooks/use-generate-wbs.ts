'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import { generateWBS, type GenerateWBSResult } from '@/lib/wbs/generate-wbs';

/**
 * Hook to generate a full WBS for a service.
 * On success, invalidates stages, work items, decisions, and documents queries
 * so all related views refresh automatically.
 */
export function useGenerateWBS() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation<GenerateWBSResult, Error, string>({
    mutationFn: (serviceId: string) => generateWBS(client, serviceId),
    onSuccess: (_data, serviceId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stages.byService(serviceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workItems.all(serviceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.byService(serviceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.byService(serviceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.services.detail(serviceId) });
    },
  });
}
