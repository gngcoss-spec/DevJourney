import { SupabaseClient } from '@supabase/supabase-js';
import { getAuthUser } from './auth-helper';
import type { Decision, CreateDecisionInput, UpdateDecisionInput } from '@/types/database';

export async function getDecisions(
  client: SupabaseClient,
  serviceId: string
): Promise<Decision[]> {
  const { data, error } = await client
    .from('decisions')
    .select('*')
    .eq('service_id', serviceId)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('relation')) {
      return [];
    }
    throw new Error(error.message);
  }

  return data as Decision[];
}

export async function getDecisionById(
  client: SupabaseClient,
  id: string
): Promise<Decision | null> {
  const { data, error } = await client
    .from('decisions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  return data as Decision;
}

export async function createDecision(
  client: SupabaseClient,
  data: CreateDecisionInput
): Promise<Decision> {
  const user = await getAuthUser(client);

  const { data: created, error } = await client
    .from('decisions')
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as Decision;
}

export async function updateDecision(
  client: SupabaseClient,
  id: string,
  data: UpdateDecisionInput
): Promise<Decision> {
  const { data: updated, error } = await client
    .from('decisions')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updated as Decision;
}

export async function deleteDecision(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from('decisions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
