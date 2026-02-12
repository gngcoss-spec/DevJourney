import { SupabaseClient } from '@supabase/supabase-js';
import { getAuthUser } from './auth-helper';
import type { TeamMember, CreateTeamMemberInput, UpdateTeamMemberInput } from '@/types/database';

export async function getTeamMembers(client: SupabaseClient): Promise<TeamMember[]> {
  const { data, error } = await client
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('relation')) {
      return [];
    }
    throw new Error(error.message);
  }

  return data as TeamMember[];
}

export async function getTeamMemberById(
  client: SupabaseClient,
  id: string
): Promise<TeamMember | null> {
  const { data, error } = await client
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  return data as TeamMember;
}

export async function createTeamMember(
  client: SupabaseClient,
  data: CreateTeamMemberInput
): Promise<TeamMember> {
  const user = await getAuthUser(client);

  const { data: created, error } = await client
    .from('team_members')
    .insert({ ...data, user_id: user.id, invited_by: user.id })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as TeamMember;
}

export async function updateTeamMember(
  client: SupabaseClient,
  id: string,
  data: UpdateTeamMemberInput
): Promise<TeamMember> {
  const { data: updated, error } = await client
    .from('team_members')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updated as TeamMember;
}

export async function deleteTeamMember(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
