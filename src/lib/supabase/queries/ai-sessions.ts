// @TASK P3-R2-T1 - AI Sessions Supabase query functions
// @SPEC docs/planning/TASKS.md#ai-sessions-queries
// @TEST src/__tests__/lib/queries/ai-sessions.test.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { getAuthUser } from './auth-helper';
import type { AISession, CreateAISessionInput } from '@/types/database';

/**
 * Fetch all AI sessions for a specific work item.
 * Ordered by created_at DESC (most recent first).
 * RLS handles user_id filtering automatically.
 */
export async function getAISessions(
  client: SupabaseClient,
  workItemId: string
): Promise<AISession[]> {
  const { data, error } = await client
    .from('ai_sessions')
    .select('*')
    .eq('work_item_id', workItemId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as AISession[];
}

/**
 * Create a new AI session.
 * Only `work_item_id` and `title` are required; other fields use DB defaults.
 * Automatically injects user_id from the authenticated session (RLS requirement).
 * Returns the created AI session record.
 */
export async function createAISession(
  client: SupabaseClient,
  data: CreateAISessionInput
): Promise<AISession> {
  const user = await getAuthUser(client);

  const { data: created, error } = await client
    .from('ai_sessions')
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as AISession;
}

/**
 * Delete an AI session by ID.
 * RLS ensures only the owner can delete their own AI sessions.
 */
export async function deleteAISession(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from('ai_sessions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
