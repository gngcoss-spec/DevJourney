'use client';

import { useParams } from 'next/navigation';
import { useService } from '@/lib/hooks/use-services';
import { ServiceInfo } from '@/components/service/service-info';

export default function ServiceOverviewPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: service } = useService(id);

  if (!service) return null;

  return <ServiceInfo service={service} />;
}
