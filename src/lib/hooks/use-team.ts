'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember as createTeamMemberQuery,
  updateTeamMember as updateTeamMemberQuery,
  deleteTeamMember as deleteTeamMemberQuery,
} from '@/lib/supabase/queries/team';
import type { CreateTeamMemberInput, UpdateTeamMemberInput } from '@/types/database';

export function useTeamMembers() {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.team.all,
    queryFn: () => getTeamMembers(client),
  });
}

export function useTeamMember(id: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.team.detail(id),
    queryFn: () => getTeamMemberById(client, id),
    enabled: !!id,
  });
}

export function useCreateTeamMember() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamMemberInput) => createTeamMemberQuery(client, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
}

export function useUpdateTeamMember() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamMemberInput }) =>
      updateTeamMemberQuery(client, id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.detail(variables.id) });
    },
  });
}

export function useDeleteTeamMember() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTeamMemberQuery(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
}
