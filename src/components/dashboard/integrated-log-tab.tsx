'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAllDevLogs } from '@/lib/hooks/use-dev-logs';
import { useServices } from '@/lib/hooks/use-services';
import { FilterPills } from '@/components/common/filter-pills';
import type { DevLog, Service } from '@/types/database';

type ViewMode = 'by-date' | 'by-project';

const viewModeOptions: { value: ViewMode; label: string }[] = [
  { value: 'by-date', label: '일자별' },
  { value: 'by-project', label: '프로젝트별' },
];

const fieldConfig = [
  { key: 'done' as const, label: '오늘 한 것', color: 'var(--status-success-text)' },
  { key: 'decided' as const, label: '확정한 것', color: 'var(--status-info-text)' },
  { key: 'deferred' as const, label: '보류한 것', color: 'var(--status-warning-text)' },
  { key: 'next_action' as const, label: '다음 액션', color: 'var(--status-purple-text)' },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function getRelativeDate(dateString: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString + 'T00:00:00');
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 0) return `${Math.abs(diffDays)}일 후`;
  if (diffDays <= 30) return `${diffDays}일 전`;
  return '';
}

function truncateText(text: string | null, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function LogFields({ log }: { log: DevLog }) {
  return (
    <div className="space-y-2">
      {fieldConfig.map(({ key, label, color }) => {
        const value = log[key];
        if (!value) return null;
        return (
          <div key={key}>
            <p className="text-xs font-medium mb-0.5" style={{ color: `hsl(${color})` }}>
              {label}
            </p>
            <p className="text-body truncate">
              {truncateText(value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function DateDisplay({ dateString }: { dateString: string }) {
  const relative = getRelativeDate(dateString);
  return (
    <span className="text-caption">
      {formatDate(dateString)}
      {relative && (
        <span className="ml-1.5 text-[hsl(var(--text-quaternary))]">({relative})</span>
      )}
    </span>
  );
}

function CollapsibleSection({
  serviceId,
  serviceName,
  logs,
  defaultOpen = true,
}: {
  serviceId: string;
  serviceName: string;
  logs: DevLog[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 mb-3 group w-full text-left"
      >
        <svg
          className={`size-4 text-[hsl(var(--text-tertiary))] transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--text-secondary))] transition-colors">
          {serviceName}
        </h3>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info-text))]">
          {logs.length}개
        </span>
      </button>
      {isOpen && (
        <div className="space-y-2 ml-3 md:ml-6">
          {logs.map((log) => (
            <Link
              key={log.id}
              href={`/services/${serviceId}/dev-logs`}
              className="block"
            >
              <div className="bento-glass-hover p-4">
                <div className="mb-2">
                  <DateDisplay dateString={log.log_date} />
                </div>
                <LogFields log={log} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function IntegratedLogTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('by-date');
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

  const groupedByProject = devLogs.reduce<Map<string, DevLog[]>>((acc, log) => {
    const group = acc.get(log.service_id) || [];
    group.push(log);
    acc.set(log.service_id, group);
    return acc;
  }, new Map());

  const sortedGroups = [...groupedByProject.entries()].sort((a, b) => {
    const aLatest = a[1][0]?.log_date || '';
    const bLatest = b[1][0]?.log_date || '';
    return bLatest.localeCompare(aLatest);
  });

  return (
    <div className="space-y-4">
      <FilterPills
        options={viewModeOptions}
        value={viewMode}
        onChange={setViewMode}
      />

      {viewMode === 'by-date' ? (
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
                      <DateDisplay dateString={log.log_date} />
                      <span className="text-sm font-medium text-[hsl(var(--status-info-text))]">
                        {serviceName}
                      </span>
                    </div>
                  </div>
                  <LogFields log={log} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-xs text-[hsl(var(--text-quaternary))]">
            총 {devLogs.length}개 로그 · {sortedGroups.length}개 서비스
          </p>
          {sortedGroups.map(([serviceId, logs]) => {
            const service = serviceMap.get(serviceId);
            const serviceName = service?.name || 'Unknown Service';

            return (
              <CollapsibleSection
                key={serviceId}
                serviceId={serviceId}
                serviceName={serviceName}
                logs={logs}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
