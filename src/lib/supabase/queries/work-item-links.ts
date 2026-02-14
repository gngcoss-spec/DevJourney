import { SupabaseClient } from '@supabase/supabase-js';
import { getAuthUser } from './auth-helper';
import type { WorkItemLink, CreateWorkItemLinkInput } from '@/types/database';

export async function getWorkItemLinks(
  client: SupabaseClient,
  workItemId: string
): Promise<WorkItemLink[]> {
  const { data, error } = await client
    .from('work_item_links')
    .select('*')
    .or(`source_id.eq.${workItemId},target_id.eq.${workItemId}`)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data as WorkItemLink[];
}

export async function createWorkItemLink(
  client: SupabaseClient,
  input: CreateWorkItemLinkInput
): Promise<WorkItemLink> {
  const user = await getAuthUser(client);

  const { data, error } = await client
    .from('work_item_links')
    .insert({
      source_id: input.source_id,
      target_id: input.target_id,
      link_type: input.link_type || 'relates_to',
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as WorkItemLink;
}

export async function deleteWorkItemLink(
  client: SupabaseClient,
  linkId: string
): Promise<void> {
  const { error } = await client
    .from('work_item_links')
    .delete()
    .eq('id', linkId);

  if (error) throw new Error(error.message);
}
