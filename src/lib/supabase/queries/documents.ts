import { SupabaseClient } from '@supabase/supabase-js';
import { getAuthUser } from './auth-helper';
import type { Document, CreateDocumentInput, UpdateDocumentInput } from '@/types/database';

export async function getDocuments(
  client: SupabaseClient,
  serviceId: string
): Promise<Document[]> {
  const { data, error } = await client
    .from('documents')
    .select('*')
    .eq('service_id', serviceId)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('relation')) {
      return [];
    }
    throw new Error(error.message);
  }

  return data as Document[];
}

export async function getDocumentById(
  client: SupabaseClient,
  id: string
): Promise<Document | null> {
  const { data, error } = await client
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  return data as Document;
}

export async function createDocument(
  client: SupabaseClient,
  data: CreateDocumentInput
): Promise<Document> {
  const user = await getAuthUser(client);

  const { data: created, error } = await client
    .from('documents')
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as Document;
}

export async function updateDocument(
  client: SupabaseClient,
  id: string,
  data: UpdateDocumentInput
): Promise<Document> {
  const { data: updated, error } = await client
    .from('documents')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updated as Document;
}

export async function deleteDocument(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
