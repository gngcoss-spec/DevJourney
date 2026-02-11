// @TASK P2-R1-T2 - Services Supabase query functions
// @SPEC docs/planning/TASKS.md#services-queries
// @TEST src/__tests__/lib/queries/services.test.ts

import { SupabaseClient } from '@supabase/supabase-js';
import type { Service, CreateServiceInput, UpdateServiceInput } from '@/types/database';

/**
 * Fetch all services for the authenticated user.
 * Ordered by last_activity_at DESC (most recent first).
 * RLS handles user_id filtering automatically.
 */
export async function getServices(client: SupabaseClient): Promise<Service[]> {
  const { data, error } = await client
    .from('services')
    .select('*')
    .order('last_activity_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Service[];
}

/**
 * Fetch a single service by ID.
 * Returns null if the service is not found (PGRST116).
 * RLS handles user_id filtering automatically.
 */
export async function getServiceById(
  client: SupabaseClient,
  id: string
): Promise<Service | null> {
  const { data, error } = await client
    .from('services')
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

  return data as Service;
}

/**
 * Create a new service.
 * Only `name` is required; other fields use DB defaults.
 * Returns the created service record.
 */
export async function createService(
  client: SupabaseClient,
  data: CreateServiceInput
): Promise<Service> {
  const { data: created, error } = await client
    .from('services')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return created as Service;
}

/**
 * Update an existing service by ID.
 * Only provided fields are updated.
 * Returns the updated service record.
 */
export async function updateService(
  client: SupabaseClient,
  id: string,
  data: UpdateServiceInput
): Promise<Service> {
  const { data: updated, error } = await client
    .from('services')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return updated as Service;
}

/**
 * Delete a service by ID.
 * RLS ensures only the owner can delete their own services.
 */
export async function deleteService(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
