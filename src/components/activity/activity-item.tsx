'use client';

import { CheckSquare, GitBranch, FileText, File } from 'lucide-react';
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

const typeColors = {
  work_item: 'text-blue-400 bg-blue-500/10',
  decision: 'text-purple-400 bg-purple-500/10',
  dev_log: 'text-green-400 bg-green-500/10',
  document: 'text-orange-400 bg-orange-500/10',
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
      <div className={`p-1.5 rounded-lg flex-shrink-0 ${typeColors[activity.type]}`}>
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-300 truncate">{activity.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{typeLabels[activity.type]}</span>
          <span className="text-xs text-slate-600">{formatTime(activity.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
