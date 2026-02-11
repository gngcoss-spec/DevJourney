// @TASK P2-S1-T1 - Service card list for dashboard
// @SPEC docs/planning/TASKS.md#dashboard-ui

'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Service } from '@/types/database';

interface ServiceCardListProps {
  services: Service[];
}

function isServiceStalled(service: Service): boolean {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const lastActivity = new Date(service.last_activity_at);
  return lastActivity < sevenDaysAgo;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
    case 'stalled':
      return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
    case 'paused':
      return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return '오늘';
  if (diffInDays === 1) return '어제';
  if (diffInDays < 7) return `${diffInDays}일 전`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`;
  return date.toLocaleDateString('ko-KR');
}

export function ServiceCardList({ services }: ServiceCardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => {
        const isStalled = isServiceStalled(service);
        const displayStatus = isStalled ? 'stalled' : service.status;

        return (
          <Link key={service.id} href={`/services/${service.id}`}>
            <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg text-slate-50">{service.name}</CardTitle>
                  <Badge className={getStatusColor(displayStatus)}>
                    {displayStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">진행률</span>
                    <span className="text-sm font-semibold text-slate-50">
                      {service.progress}%
                    </span>
                  </div>
                  <Progress value={service.progress} className="h-2" />
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-slate-400">
                    현재 단계: <span className="text-slate-300">{service.current_stage}</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    마지막 활동: <span className="text-slate-300">{formatDate(service.last_activity_at)}</span>
                  </div>
                </div>

                {service.next_action && (
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-xs text-slate-400">다음 액션</p>
                    <p className="text-sm text-slate-200 mt-1">{service.next_action}</p>
                  </div>
                )}

                {isStalled && (
                  <Badge className="bg-yellow-500/10 text-yellow-500 mt-2">
                    ⚠️ 7일 이상 활동 없음
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
