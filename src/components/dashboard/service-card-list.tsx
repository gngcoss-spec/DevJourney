'use client';

import Link from 'next/link';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { StatusBadge } from '@/components/common/status-badge';
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

function getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'active': return 'success';
    case 'stalled': return 'warning';
    case 'paused': return 'danger';
    default: return 'neutral';
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
    <BentoGrid columns={3}>
      {services.map((service) => {
        const isStalled = isServiceStalled(service);
        const displayStatus = isStalled ? 'stalled' : service.status;

        return (
          <Link key={service.id} href={`/services/${service.id}`}>
            <BentoCard interactive glow="blue" className="h-full">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">{service.name}</h3>
                <StatusBadge variant={getStatusVariant(displayStatus)}>
                  {displayStatus}
                </StatusBadge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-caption">진행률</span>
                    <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">
                      {service.progress}%
                    </span>
                  </div>
                  <Progress value={service.progress} className="h-2" />
                </div>

                <div className="space-y-1">
                  <div className="text-body">
                    현재 단계: <span className="text-[hsl(var(--text-primary))]">{service.current_stage}</span>
                  </div>
                  <div className="text-body">
                    마지막 활동: <span className="text-[hsl(var(--text-primary))]">{formatDate(service.last_activity_at)}</span>
                  </div>
                </div>

                {service.next_action && (
                  <div className="pt-2 border-t border-[hsl(var(--border-default))]">
                    <p className="text-caption">다음 액션</p>
                    <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">{service.next_action}</p>
                  </div>
                )}

                {isStalled && (
                  <StatusBadge variant="warning" className="mt-2">
                    7일 이상 활동 없음
                  </StatusBadge>
                )}
              </div>
            </BentoCard>
          </Link>
        );
      })}
    </BentoGrid>
  );
}
