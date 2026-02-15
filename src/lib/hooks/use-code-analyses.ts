'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import {
  getCodeAnalyses,
  getCodeAnalysisById,
  deleteCodeAnalysis as deleteCodeAnalysisQuery,
} from '@/lib/supabase/queries/code-analyses';

export function useCodeAnalyses(serviceId: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.codeAnalyses.byService(serviceId),
    queryFn: () => getCodeAnalyses(client, serviceId),
    enabled: !!serviceId,
  });
}

export function useCodeAnalysis(id: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.codeAnalyses.detail(id),
    queryFn: () => getCodeAnalysisById(client, id),
    enabled: !!id,
  });
}

export function useDeleteCodeAnalysis(serviceId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCodeAnalysisQuery(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.codeAnalyses.byService(serviceId),
      });
    },
  });
}
