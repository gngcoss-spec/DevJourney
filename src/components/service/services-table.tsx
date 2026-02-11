// @TASK P2-S2-T1 - Services Table Component
// @SPEC docs/planning/02-trd.md#services-목록-화면
// @TEST src/__tests__/pages/services-list.test.tsx

'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Service, ServiceStatus } from '@/types/database';

interface ServicesTableProps {
  services: Service[];
}

// 상태별 뱃지 스타일 매핑 (WCAG AA 준수 색상 대비)
const statusStyles: Record<ServiceStatus, string> = {
  active: 'bg-green-500/20 text-green-500 border-green-500/50',
  stalled: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  paused: 'bg-red-500/20 text-red-500 border-red-500/50',
} as const;

// 상태 한글 레이블 (접근성 개선)
const statusLabels: Record<ServiceStatus, string> = {
  active: '진행 중',
  stalled: '지연됨',
  paused: '일시중지',
} as const;

// 날짜 포맷 함수
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

// 진행률 바 컴포넌트 (성능 최적화를 위한 메모이제이션)
const ProgressBar = memo(({ progress }: { progress: number }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 bg-slate-800 rounded-full h-2 max-w-[100px]"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`진행률 ${progress}%`}
      >
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-sm text-slate-400 min-w-[3ch]">{progress}%</span>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

export function ServicesTable({ services }: ServicesTableProps) {
  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden">
      <table className="w-full" aria-label="서비스 목록">
        <caption className="sr-only">
          총 {services.length}개의 서비스
        </caption>
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900">
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              서비스명
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              상태
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              현재 단계
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              진행률
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              마지막 활동
            </th>
          </tr>
        </thead>
        <tbody className="bg-slate-950 divide-y divide-slate-800">
          {services.map((service) => (
            <tr
              key={service.id}
              className="hover:bg-slate-900/50 transition-colors"
            >
              <td className="px-6 py-4">
                <Link
                  href={`/services/${service.id}`}
                  className="text-slate-200 font-medium hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded"
                >
                  {service.name}
                </Link>
                {service.description && (
                  <p className="text-sm text-slate-400 mt-1">{service.description}</p>
                )}
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant="outline"
                  className={statusStyles[service.status]}
                  aria-label={`상태: ${statusLabels[service.status]}`}
                >
                  {service.status}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <span className="text-slate-300">{service.current_stage}</span>
              </td>
              <td className="px-6 py-4">
                <ProgressBar progress={service.progress} />
              </td>
              <td className="px-6 py-4">
                <time
                  dateTime={service.last_activity_at}
                  className="text-sm text-slate-400"
                >
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
