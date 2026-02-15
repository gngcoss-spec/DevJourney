'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import { createWorkItem } from '@/lib/supabase/queries/work-items';
import type { AnalysisFinding } from '@/types/database';

interface GenerateInput {
  serviceId: string;
  findings: AnalysisFinding[];
}

export function useGenerateRefactorItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, findings }: GenerateInput) => {
      const client = createClient();
      const results = [];

      for (const finding of findings) {
        const priority = finding.severity === 'critical' ? 'high'
          : finding.severity === 'warning' ? 'medium'
          : 'low';

        const description = [
          finding.description,
          '',
          `**Category**: ${finding.category}`,
          `**Suggestion**: ${finding.suggestion}`,
          finding.file_path ? `**File**: ${finding.file_path}` : '',
        ].filter(Boolean).join('\n');

        const item = await createWorkItem(client, {
          service_id: serviceId,
          title: `[Refactor] ${finding.title}`,
          description,
          type: 'refactor',
          priority,
          status: 'backlog',
        });
        results.push(item);
      }

      return results;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.all(variables.serviceId),
      });
    },
  });
}
