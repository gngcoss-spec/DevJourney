// @TASK P2-S4-T1 - Service Overview Page Implementation
// @SPEC docs/planning/TASKS.md#service-overview
// @TEST src/__tests__/pages/service-overview.test.tsx

'use client';

import { useParams } from 'next/navigation';
import { useService } from '@/lib/hooks/use-services';
import { ServiceHeader } from '@/components/service/service-header';
import { ServiceTabs } from '@/components/service/service-tabs';
import { ServiceInfo } from '@/components/service/service-info';

export default function ServiceOverviewPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: service, isLoading, error } = useService(id);

  // Loading state
  if (isLoading) {
    return (
      <div data-testid="service-overview-skeleton" className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-800 rounded-lg" />
        <div className="h-12 bg-slate-800 rounded-lg" />
        <div className="h-64 bg-slate-800 rounded-lg" />
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <p className="text-red-400 text-lg font-medium">
            서비스를 불러오는 중 오류가 발생했습니다
          </p>
          <p className="text-slate-400 text-sm">
            {error instanceof Error ? error.message : '알 수 없는 오류'}
          </p>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="space-y-6">
      <ServiceHeader service={service} />
      <ServiceTabs serviceId={service.id} />
      <ServiceInfo service={service} />
    </div>
  );
}
