// @TASK P3-R3-T1 - Work item comments Supabase query functions
// @SPEC docs/planning/TASKS.md#work-item-comments-queries
// @TEST src/__tests__/lib/queries/comments.test.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { getAuthUser } from './auth-helper';
import type { WorkItemComment, CommentType } from '@/types/database';

/**
 * Input type for creating a new comment.
 * user_id is automatically set from the authenticated user.
 */
export interface CreateCommentInput {
  work_item_id: string;
  author_name: string;
  content: string;
  comment_type?: CommentType;
  metadata?: Record<string, unknown>;
}

/**
 * Fetch all comments for a work item.
 * Ordered by created_at ASC (oldest first).
 * RLS handles user_id filtering automatically.
 */
export async function getComments(
  client: SupabaseClient,
  workItemId: string
): Promise<WorkItemComment[]> {
  const { data, error } = await client
    .from('work_item_comments')
    .select('*')
    .eq('work_item_id', workItemId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as WorkItemComment[];
}

/**
 * Create a new comment on a work item.
 * Only `work_item_id`, `author_name`, and `content` are required.
 * Automatically injects user_id from the authenticated session (RLS requirement).
 * Returns the created comment record.
 */
export async function createComment(
  client: SupabaseClient,
  data: CreateCommentInput
): Promise<WorkItemComment> {
  const user = await getAuthUser(client);

  const { data: created, error } = await client
    .from('work_item_comments')
    .insert({
      work_item_id: data.work_item_id,
      user_id: user.id,
      author_name: data.author_name,
      content: data.content,
      comment_type: data.comment_type || 'comment',
      metadata: data.metadata || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as WorkItemComment;
}

/**
 * Create a status change log comment.
 * Automatically records the transition between two statuses.
 * Automatically injects user_id from the authenticated session (RLS requirement).
 * Returns the created comment record.
 */
export async function createStatusChangeLog(
  client: SupabaseClient,
  workItemId: string,
  fromStatus: string,
  toStatus: string
): Promise<WorkItemComment> {
  const user = await getAuthUser(client);

  const { data: created, error } = await client
    .from('work_item_comments')
    .insert({
      work_item_id: workItemId,
      user_id: user.id,
      author_name: 'System',
      content: `Status changed from ${fromStatus} to ${toStatus}`,
      comment_type: 'status_change',
      metadata: {
        from_status: fromStatus,
        to_status: toStatus,
      },
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as WorkItemComment;
}

/**
 * Update an existing comment's content.
 * Sets is_edited to true and updates updated_at timestamp.
 */
export async function updateComment(
  client: SupabaseClient,
  commentId: string,
  content: string
): Promise<WorkItemComment> {
  const { data, error } = await client
    .from('work_item_comments')
    .update({ content, is_edited: true, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as WorkItemComment;
}

/**
 * Delete a comment by ID.
 */
export async function deleteComment(
  client: SupabaseClient,
  commentId: string
): Promise<void> {
  const { error } = await client
    .from('work_item_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw new Error(error.message);
}
