'use client';

import Link from 'next/link';
import { useAllDevLogs } from '@/lib/hooks/use-dev-logs';
import { useServices } from '@/lib/hooks/use-services';
import type { DevLog, Service } from '@/types/database';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function truncateText(text: string | null, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function IntegratedLogTab() {
  const { data: devLogs, isLoading: logsLoading, isError: logsError } = useAllDevLogs(20);
  const { data: services, isLoading: servicesLoading, isError: servicesError } = useServices();

  const isLoading = logsLoading || servicesLoading;
  const isError = logsError || servicesError;

  const serviceMap = new Map<string, Service>(
    services?.map(s => [s.id, s]) || []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--text-primary))] mx-auto mb-4" />
          <p className="text-[hsl(var(--text-tertiary))]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-[hsl(var(--status-danger-text))]">데이터를 불러오는데 실패했습니다.</p>
        </div>
      </div>
    );
  }

  if (!devLogs || devLogs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-[hsl(var(--text-tertiary))]">아직 개발 일지가 없습니다</p>
          <p className="text-sm text-[hsl(var(--text-quaternary))] mt-2">
            서비스별 Dev Logs 페이지에서 일지를 작성해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {devLogs.map((log: DevLog) => {
        const service = serviceMap.get(log.service_id);
        const serviceName = service?.name || 'Unknown Service';

        return (
          <Link
            key={log.id}
            href={`/services/${log.service_id}/dev-logs`}
            className="block"
          >
            <div className="bento-glass-hover p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-caption">
                    {formatDate(log.log_date)}
                  </span>
                  <span className="text-sm font-medium text-[hsl(var(--status-info-text))]">
                    {serviceName}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {log.done && (
                  <div>
                    <p className="text-caption mb-1">오늘 한 것</p>
                    <p className="text-body truncate">
                      {truncateText(log.done)}
                    </p>
                  </div>
                )}

                {log.next_action && (
                  <div>
                    <p className="text-caption mb-1">다음 액션</p>
                    <p className="text-body truncate">
                      {truncateText(log.next_action)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
