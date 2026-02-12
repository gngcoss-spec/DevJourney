'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import {
  getServers,
  getServerById,
  createServer as createServerQuery,
  updateServer as updateServerQuery,
  deleteServer as deleteServerQuery,
} from '@/lib/supabase/queries/servers';
import type { CreateServerInput, UpdateServerInput } from '@/types/database';

export function useServers() {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.servers.all,
    queryFn: () => getServers(client),
  });
}

export function useServer(id: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.servers.detail(id),
    queryFn: () => getServerById(client, id),
    enabled: !!id,
  });
}

export function useCreateServer() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServerInput) => createServerQuery(client, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.servers.all });
    },
  });
}

export function useUpdateServer() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServerInput }) =>
      updateServerQuery(client, id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.servers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.servers.detail(variables.id) });
    },
  });
}

export function useDeleteServer() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteServerQuery(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.servers.all });
    },
  });
}
