'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import {
  getWorkItemLinks,
  createWorkItemLink as createWorkItemLinkQuery,
  deleteWorkItemLink as deleteWorkItemLinkQuery,
} from '@/lib/supabase/queries/work-item-links';
import type { CreateWorkItemLinkInput } from '@/types/database';

export function useWorkItemLinks(workItemId: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.workItems.links(workItemId),
    queryFn: () => getWorkItemLinks(client, workItemId),
    enabled: !!workItemId,
  });
}

export function useCreateWorkItemLink(workItemId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkItemLinkInput) => createWorkItemLinkQuery(client, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.links(workItemId),
      });
    },
  });
}

export function useDeleteWorkItemLink(workItemId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => deleteWorkItemLinkQuery(client, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.links(workItemId),
      });
    },
  });
}
