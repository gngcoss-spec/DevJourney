'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import {
  getComments,
  createComment as createCommentQuery,
  createStatusChangeLog as createStatusChangeLogQuery,
  updateComment as updateCommentQuery,
  deleteComment as deleteCommentQuery,
} from '@/lib/supabase/queries/comments';
import type { CreateCommentInput } from '@/lib/supabase/queries/comments';

export function useComments(workItemId: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.workItems.comments(workItemId),
    queryFn: () => getComments(client, workItemId),
    enabled: !!workItemId,
  });
}

export function useCreateComment(workItemId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentInput) => createCommentQuery(client, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.comments(workItemId),
      });
    },
  });
}

export function useCreateStatusChangeLog(workItemId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fromStatus, toStatus }: { fromStatus: string; toStatus: string }) =>
      createStatusChangeLogQuery(client, workItemId, fromStatus, toStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.comments(workItemId),
      });
    },
  });
}

export function useUpdateComment(workItemId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateCommentQuery(client, commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.comments(workItemId),
      });
    },
  });
}

export function useDeleteComment(workItemId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteCommentQuery(client, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workItems.comments(workItemId),
      });
    },
  });
}
