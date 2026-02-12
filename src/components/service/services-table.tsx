'use client';

import { memo } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/common/status-badge';
import type { Service, ServiceStatus } from '@/types/database';

interface ServicesTableProps {
  services: Service[];
}

const statusVariants: Record<ServiceStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  stalled: 'warning',
  paused: 'danger',
};

const statusLabels: Record<ServiceStatus, string> = {
  active: '진행 중',
  stalled: '지연됨',
  paused: '일시중지',
} as const;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}개월 전`;
  return `${Math.floor(days / 365)}년 전`;
}

const ProgressBar = memo(({ progress }: { progress: number }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 bg-[hsl(var(--surface-raised))] rounded-full h-2 max-w-[100px]"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`진행률 ${progress}%`}
      >
        <div
          className="bg-[hsl(var(--primary))] h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm text-[hsl(var(--text-tertiary))] min-w-[3ch]">{progress}%</span>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

export function ServicesTable({ services }: ServicesTableProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--border-default))] overflow-hidden">
      <table className="w-full" aria-label="서비스 목록">
        <caption className="sr-only">
          총 {services.length}개의 서비스
        </caption>
        <thead>
          <tr className="border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-raised))]">
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider">서비스명</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider">상태</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider">현재 단계</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider">진행률</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider">다음 액션</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider">마지막 활동</th>
          </tr>
        </thead>
        <tbody className="bg-[hsl(var(--surface-ground))] divide-y divide-[hsl(var(--border-default))]">
          {services.map((service) => (
            <tr key={service.id} className="hover:bg-[hsl(var(--surface-raised))] transition-colors">
              <td className="px-6 py-4">
                <Link
                  href={`/services/${service.id}`}
                  className="text-[hsl(var(--text-secondary))] font-medium hover:text-[hsl(var(--text-primary))] transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface-ground))] rounded"
                >
                  {service.name}
                </Link>
                {service.description && (
                  <p className="text-sm text-[hsl(var(--text-tertiary))] mt-1">{service.description}</p>
                )}
              </td>
              <td className="px-6 py-4">
                <StatusBadge
                  variant={statusVariants[service.status]}
                  aria-label={`상태: ${statusLabels[service.status]}`}
                >
                  {service.status}
                </StatusBadge>
              </td>
              <td className="px-6 py-4">
                <span className="text-[hsl(var(--text-secondary))]">{service.current_stage}</span>
              </td>
              <td className="px-6 py-4">
                <ProgressBar progress={service.progress} />
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-[hsl(var(--text-secondary))]">
                  {service.next_action || '-'}
                </span>
              </td>
              <td className="px-6 py-4">
                <time dateTime={service.last_activity_at} className="text-sm text-[hsl(var(--text-tertiary))]">
                  {formatDate(service.last_activity_at)}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
