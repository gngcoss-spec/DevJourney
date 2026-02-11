// @TASK P3-R1-T2 - Work Items Supabase query functions
// @SPEC docs/planning/TASKS.md#work-items-queries
// @TEST src/__tests__/lib/queries/work-items.test.ts

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  WorkItem,
  CreateWorkItemInput,
  UpdateWorkItemInput,
  WorkItemStatus,
} from '@/types/database';

/**
 * Fetch all work items for a given service.
 * Ordered by sort_order ASC (position in Kanban board).
 * RLS handles user_id filtering automatically.
 */
export async function getWorkItems(
  client: SupabaseClient,
  serviceId: string
): Promise<WorkItem[]> {
  const { data, error } = await client
    .from('work_items')
    .select('*')
    .eq('service_id', serviceId)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as WorkItem[];
}

/**
 * Fetch work items filtered by service and status (Kanban column).
 * Ordered by sort_order ASC for correct card ordering within a column.
 * RLS handles user_id filtering automatically.
 */
export async function getWorkItemsByStatus(
  client: SupabaseClient,
  serviceId: string,
  status: WorkItemStatus
): Promise<WorkItem[]> {
  const { data, error } = await client
    .from('work_items')
    .select('*')
    .eq('service_id', serviceId)
    .eq('status', status)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as WorkItem[];
}

/**
 * Fetch a single work item by ID.
 * Returns null if the work item is not found (PGRST116).
 * RLS handles user_id filtering automatically.
 */
export async function getWorkItemById(
  client: SupabaseClient,
  id: string
): Promise<WorkItem | null> {
  const { data, error } = await client
    .from('work_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // PGRST116: "Row not found" - return null instead of throwing
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  return data as WorkItem;
}

/**
 * Create a new work item.
 * Requires `service_id` and `title`; other fields use DB defaults.
 * Returns the created work item record.
 */
export async function createWorkItem(
  client: SupabaseClient,
  data: CreateWorkItemInput
): Promise<WorkItem> {
  const { data: created, error } = await client
    .from('work_items')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as WorkItem;
}

/**
 * Update an existing work item by ID.
 * Only provided fields are updated.
 * Returns the updated work item record.
 */
export async function updateWorkItem(
  client: SupabaseClient,
  id: string,
  data: UpdateWorkItemInput
): Promise<WorkItem> {
  const { data: updated, error } = await client
    .from('work_items')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updated as WorkItem;
}

/**
 * Update work item position for Kanban drag-and-drop.
 * Updates both status (column) and sort_order (position within column) simultaneously.
 * Returns the updated work item record.
 */
export async function updateWorkItemPosition(
  client: SupabaseClient,
  id: string,
  status: WorkItemStatus,
  position: number
): Promise<WorkItem> {
  const { data: updated, error } = await client
    .from('work_items')
    .update({ status, sort_order: position })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updated as WorkItem;
}

/**
 * Delete a work item by ID.
 * RLS ensures only the owner can delete their own work items.
 */
export async function deleteWorkItem(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from('work_items')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
