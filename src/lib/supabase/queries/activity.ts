import { SupabaseClient } from '@supabase/supabase-js';

export interface ActivityItem {
  id: string;
  type: 'work_item' | 'decision' | 'dev_log' | 'document';
  title: string;
  service_id?: string;
  created_at: string;
}

export async function getRecentActivities(
  client: SupabaseClient,
  limit: number = 30
): Promise<ActivityItem[]> {
  // Fetch from multiple tables in parallel
  const [workItemsResult, decisionsResult, devLogsResult, documentsResult] = await Promise.all([
    client
      .from('work_items')
      .select('id, title, service_id, created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    client
      .from('decisions')
      .select('id, title, service_id, created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    client
      .from('dev_logs')
      .select('id, done, service_id, created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    client
      .from('documents')
      .select('id, title, service_id, created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  const activities: ActivityItem[] = [];

  if (workItemsResult.data) {
    workItemsResult.data.forEach((item: any) => {
      activities.push({
        id: item.id,
        type: 'work_item',
        title: item.title,
        service_id: item.service_id,
        created_at: item.created_at,
      });
    });
  }

  if (decisionsResult.data) {
    decisionsResult.data.forEach((item: any) => {
      activities.push({
        id: item.id,
        type: 'decision',
        title: item.title,
        service_id: item.service_id,
        created_at: item.created_at,
      });
    });
  }

  if (devLogsResult.data) {
    devLogsResult.data.forEach((item: any) => {
      activities.push({
        id: item.id,
        type: 'dev_log',
        title: item.done || '개발 일지',
        service_id: item.service_id,
        created_at: item.created_at,
      });
    });
  }

  if (documentsResult.data) {
    documentsResult.data.forEach((item: any) => {
      activities.push({
        id: item.id,
        type: 'document',
        title: item.title,
        service_id: item.service_id,
        created_at: item.created_at,
      });
    });
  }

  // Sort by created_at DESC and limit
  activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return activities.slice(0, limit);
}
