// @TASK P4-R1-T1 - Dev Logs Supabase query functions
// @SPEC docs/planning/TASKS.md#dev-logs-queries
// @TEST src/__tests__/lib/queries/dev-logs.test.ts

import { SupabaseClient } from '@supabase/supabase-js';
import type { DevLog, CreateDevLogInput, UpdateDevLogInput } from '@/types/database';

/**
 * Fetch all dev logs for a given service.
 * Ordered by log_date DESC (most recent first).
 * RLS handles user_id filtering automatically.
 */
export async function getDevLogs(
  client: SupabaseClient,
  serviceId: string
): Promise<DevLog[]> {
  const { data, error } = await client
    .from('dev_logs')
    .select('*')
    .eq('service_id', serviceId)
    .order('log_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as DevLog[];
}

/**
 * Fetch all dev logs across all services.
 * Ordered by log_date DESC (most recent first).
 * Optionally limit results (default 20).
 * RLS handles user_id filtering automatically.
 */
export async function getAllDevLogs(
  client: SupabaseClient,
  limit: number = 20
): Promise<DevLog[]> {
  const { data, error } = await client
    .from('dev_logs')
    .select('*')
    .order('log_date', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data as DevLog[];
}

/**
 * Fetch a dev log for a specific service and date.
 * Returns null if not found (PGRST116).
 * RLS handles user_id filtering automatically.
 */
export async function getDevLogByDate(
  client: SupabaseClient,
  serviceId: string,
  date: string
): Promise<DevLog | null> {
  const { data, error } = await client
    .from('dev_logs')
    .select('*')
    .eq('service_id', serviceId)
    .eq('log_date', date)
    .single();

  if (error) {
    // PGRST116: "Row not found" - return null instead of throwing
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  return data as DevLog;
}

/**
 * Create a new dev log.
 * Requires `service_id`; other fields use DB defaults or are optional.
 * Returns the created dev log record.
 */
export async function createDevLog(
  client: SupabaseClient,
  data: CreateDevLogInput
): Promise<DevLog> {
  const { data: created, error } = await client
    .from('dev_logs')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as DevLog;
}

/**
 * Update an existing dev log by ID.
 * Only provided fields are updated.
 * Returns the updated dev log record.
 */
export async function updateDevLog(
  client: SupabaseClient,
  id: string,
  data: UpdateDevLogInput
): Promise<DevLog> {
  const { data: updated, error } = await client
    .from('dev_logs')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updated as DevLog;
}
