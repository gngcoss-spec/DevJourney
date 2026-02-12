'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import { getRecentActivities } from '@/lib/supabase/queries/activity';

export function useRecentActivities(limit?: number) {
  const client = createClient();
  return useQuery({
    queryKey: queryKeys.activity.recent,
    queryFn: () => getRecentActivities(client, limit),
  });
}
