'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import {
  getDocuments,
  getDocumentById,
  createDocument as createDocumentQuery,
  updateDocument as updateDocumentQuery,
  deleteDocument as deleteDocumentQuery,
} from '@/lib/supabase/queries/documents';
import type { CreateDocumentInput, UpdateDocumentInput } from '@/types/database';

export function useDocuments(serviceId: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.documents.byService(serviceId),
    queryFn: () => getDocuments(client, serviceId),
    enabled: !!serviceId,
  });
}

export function useDocument(id: string) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => getDocumentById(client, id),
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentInput) => createDocumentQuery(client, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.byService(variables.service_id),
      });
    },
  });
}

export function useUpdateDocument(serviceId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentInput }) =>
      updateDocumentQuery(client, id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.byService(serviceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.detail(variables.id),
      });
    },
  });
}

export function useDeleteDocument(serviceId: string) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDocumentQuery(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.byService(serviceId),
      });
    },
  });
}
