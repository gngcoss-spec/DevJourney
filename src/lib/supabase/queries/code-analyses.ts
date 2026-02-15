import { SupabaseClient } from '@supabase/supabase-js';
import type { CodeAnalysis } from '@/types/database';

export async function getCodeAnalyses(
  client: SupabaseClient,
  serviceId: string
): Promise<CodeAnalysis[]> {
  const { data, error } = await client
    .from('code_analyses')
    .select('*')
    .eq('service_id', serviceId)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('relation')) {
      return [];
    }
    throw new Error(error.message);
  }

  return data as CodeAnalysis[];
}

export async function getCodeAnalysisById(
  client: SupabaseClient,
  id: string
): Promise<CodeAnalysis | null> {
  const { data, error } = await client
    .from('code_analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  return data as CodeAnalysis;
}

export async function deleteCodeAnalysis(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from('code_analyses')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
