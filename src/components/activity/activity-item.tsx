'use client';

import { CheckSquare, GitBranch, FileText, File } from 'lucide-react';
import { IconWrapper } from '@/components/common/icon-wrapper';
import type { ActivityItem } from '@/lib/supabase/queries/activity';

interface ActivityItemProps {
  activity: ActivityItem;
}

const typeIcons = {
  work_item: CheckSquare,
  decision: GitBranch,
  dev_log: FileText,
  document: File,
};

const typeLabels = {
  work_item: '작업',
  decision: '의사결정',
  dev_log: '개발 일지',
  document: '문서',
};

const typeColors: Record<string, 'blue' | 'purple' | 'green' | 'orange'> = {
  work_item: 'blue',
  decision: 'purple',
  dev_log: 'green',
  document: 'orange',
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export function ActivityItemComponent({ activity }: ActivityItemProps) {
  const Icon = typeIcons[activity.type];

  return (
    <div className="flex items-start gap-3 py-3">
      <IconWrapper icon={Icon} color={typeColors[activity.type]} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[hsl(var(--text-secondary))] truncate">{activity.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-caption">{typeLabels[activity.type]}</span>
          <span className="text-xs text-[hsl(var(--text-quaternary))]">{formatTime(activity.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
