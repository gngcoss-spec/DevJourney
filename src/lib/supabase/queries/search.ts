import { SupabaseClient } from '@supabase/supabase-js';

export type SearchResultType = 'service' | 'work_item' | 'decision' | 'dev_log' | 'document';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string | null;
  service_id: string | null;
  created_at: string;
}

export interface SearchResults {
  services: SearchResult[];
  workItems: SearchResult[];
  decisions: SearchResult[];
  devLogs: SearchResult[];
  documents: SearchResult[];
  total: number;
}

const EMPTY_RESULTS: SearchResults = {
  services: [],
  workItems: [],
  decisions: [],
  devLogs: [],
  documents: [],
  total: 0,
};

export async function globalSearch(
  client: SupabaseClient,
  query: string,
  limit: number = 5
): Promise<SearchResults> {
  if (query.length < 2) return EMPTY_RESULTS;

  const pattern = `%${query}%`;

  const [servicesResult, workItemsResult, decisionsResult, devLogsResult, documentsResult] =
    await Promise.all([
      client
        .from('services')
        .select('id, name, description, created_at')
        .or(`name.ilike.${pattern},description.ilike.${pattern},goal.ilike.${pattern}`)
        .order('created_at', { ascending: false })
        .limit(limit),
      client
        .from('work_items')
        .select('id, title, description, service_id, created_at')
        .or(`title.ilike.${pattern},description.ilike.${pattern}`)
        .order('created_at', { ascending: false })
        .limit(limit),
      client
        .from('decisions')
        .select('id, title, background, service_id, created_at')
        .or(`title.ilike.${pattern},background.ilike.${pattern}`)
        .order('created_at', { ascending: false })
        .limit(limit),
      client
        .from('dev_logs')
        .select('id, done, decided, deferred, next_action, service_id, created_at')
        .or(
          `done.ilike.${pattern},decided.ilike.${pattern},deferred.ilike.${pattern},next_action.ilike.${pattern}`
        )
        .order('created_at', { ascending: false })
        .limit(limit),
      client
        .from('documents')
        .select('id, title, description, service_id, created_at')
        .or(`title.ilike.${pattern},description.ilike.${pattern}`)
        .order('created_at', { ascending: false })
        .limit(limit),
    ]);

  const services: SearchResult[] = (servicesResult.data ?? []).map((item: any) => ({
    id: item.id,
    type: 'service' as const,
    title: item.name,
    description: item.description,
    service_id: item.id,
    created_at: item.created_at,
  }));

  const workItems: SearchResult[] = (workItemsResult.data ?? []).map((item: any) => ({
    id: item.id,
    type: 'work_item' as const,
    title: item.title,
    description: item.description,
    service_id: item.service_id,
    created_at: item.created_at,
  }));

  const decisions: SearchResult[] = (decisionsResult.data ?? []).map((item: any) => ({
    id: item.id,
    type: 'decision' as const,
    title: item.title,
    description: item.background,
    service_id: item.service_id,
    created_at: item.created_at,
  }));

  const devLogs: SearchResult[] = (devLogsResult.data ?? []).map((item: any) => ({
    id: item.id,
    type: 'dev_log' as const,
    title: item.done || item.decided || item.deferred || item.next_action || '개발 일지',
    description: null,
    service_id: item.service_id,
    created_at: item.created_at,
  }));

  const documents: SearchResult[] = (documentsResult.data ?? []).map((item: any) => ({
    id: item.id,
    type: 'document' as const,
    title: item.title,
    description: item.description,
    service_id: item.service_id,
    created_at: item.created_at,
  }));

  return {
    services,
    workItems,
    decisions,
    devLogs,
    documents,
    total: services.length + workItems.length + decisions.length + devLogs.length + documents.length,
  };
}
