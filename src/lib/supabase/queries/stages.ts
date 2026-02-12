import { SupabaseClient } from '@supabase/supabase-js';
import { getAuthUser } from './auth-helper';
import type { Stage, CreateStageInput, UpdateStageInput } from '@/types/database';

export async function getStages(
  client: SupabaseClient,
  serviceId: string
): Promise<Stage[]> {
  const { data, error } = await client
    .from('stages')
    .select('*')
    .eq('service_id', serviceId)
    .order('created_at', { ascending: true });

  if (error) {
    // 테이블 미존재 시 빈 배열 반환 (PostgREST schema cache / PostgreSQL 42P01)
    if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('relation')) {
      return [];
    }
    throw new Error(error.message);
  }

  return data as Stage[];
}

export async function getStageById(
  client: SupabaseClient,
  id: string
): Promise<Stage | null> {
  const { data, error } = await client
    .from('stages')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  return data as Stage;
}

export async function createStage(
  client: SupabaseClient,
  data: CreateStageInput
): Promise<Stage> {
  const user = await getAuthUser(client);

  const { data: created, error } = await client
    .from('stages')
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as Stage;
}

export async function updateStage(
  client: SupabaseClient,
  id: string,
  data: UpdateStageInput
): Promise<Stage> {
  const { data: updated, error } = await client
    .from('stages')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updated as Stage;
}

export async function deleteStage(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from('stages')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
