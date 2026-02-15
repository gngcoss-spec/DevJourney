'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import type { CodeAnalysis } from '@/types/database';

interface AnalyzeRepoInput {
  repo_url: string;
  service_id: string;
}

export function useAnalyzeRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AnalyzeRepoInput): Promise<CodeAnalysis> => {
      const client = createClient();
      const { data: { session } } = await client.auth.getSession();

      const res = await fetch('/api/analyze-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(errorData.error || 'Analysis failed');
      }

      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.codeAnalyses.byService(variables.service_id),
      });
    },
  });
}
