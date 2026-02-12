import { SupabaseClient } from '@supabase/supabase-js';
import { getAuthUser } from './auth-helper';
import type { Server, CreateServerInput, UpdateServerInput } from '@/types/database';

export async function getServers(client: SupabaseClient): Promise<Server[]> {
  const { data, error } = await client
    .from('servers')
    .select('*')
    .order('last_activity_at', { ascending: false });

  if (error) {
    if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('relation')) {
      return [];
    }
    throw new Error(error.message);
  }

  return data as Server[];
}

export async function getServerById(
  client: SupabaseClient,
  id: string
): Promise<Server | null> {
  const { data, error } = await client
    .from('servers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  return data as Server;
}

export async function createServer(
  client: SupabaseClient,
  data: CreateServerInput
): Promise<Server> {
  const user = await getAuthUser(client);

  const { data: created, error } = await client
    .from('servers')
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as Server;
}

export async function updateServer(
  client: SupabaseClient,
  id: string,
  data: UpdateServerInput
): Promise<Server> {
  const { data: updated, error } = await client
    .from('servers')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updated as Server;
}

export async function deleteServer(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from('servers')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
