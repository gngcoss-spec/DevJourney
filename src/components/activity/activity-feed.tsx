'use client';

import { ActivityItemComponent } from '@/components/activity/activity-item';
import type { ActivityItem } from '@/lib/supabase/queries/activity';

interface ActivityFeedProps {
  activities: ActivityItem[];
}

function groupByDate(activities: ActivityItem[]): Map<string, ActivityItem[]> {
  const groups = new Map<string, ActivityItem[]>();
  activities.forEach((activity) => {
    const date = new Date(activity.created_at).toLocaleDateString('ko-KR');
    const existing = groups.get(date) || [];
    existing.push(activity);
    groups.set(date, existing);
  });
  return groups;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const grouped = groupByDate(activities);

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([date, items]) => (
        <div key={date}>
          <h3 className="text-xs font-medium text-slate-500 mb-2 sticky top-0 bg-slate-950 py-1">
            {date}
          </h3>
          <div className="border-l-2 border-slate-800 pl-4 space-y-1">
            {items.map((activity) => (
              <ActivityItemComponent key={`${activity.type}-${activity.id}`} activity={activity} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
