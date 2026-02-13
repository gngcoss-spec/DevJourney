'use client';

import { useParams } from 'next/navigation';
import { useService } from '@/lib/hooks/use-services';
import { ServiceHeader } from '@/components/service/service-header';
import { ServiceTabs } from '@/components/service/service-tabs';
import { PageLoading } from '@/components/common/page-loading';
import { PageError } from '@/components/common/page-error';

export default function ServiceDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const serviceId = params.id as string;
  const { data: service, isLoading, error, refetch } = useService(serviceId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageLoading />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="space-y-6">
        <PageError
          message="서비스를 불러오는 중 오류가 발생했습니다"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ServiceHeader service={service} />
      <ServiceTabs serviceId={service.id} />
      {children}
    </div>
  );
}
