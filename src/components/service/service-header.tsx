'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import type { Service, ServiceStatus } from '@/types/database';

interface ServiceHeaderProps {
  service: Service;
}

const statusVariants: Record<ServiceStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  stalled: 'warning',
  paused: 'danger',
};

const statusLabels: Record<ServiceStatus, string> = {
  active: 'Active',
  stalled: 'Stalled',
  paused: 'Paused',
};

export function ServiceHeader({ service }: ServiceHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <h1 className="text-heading">{service.name}</h1>
        <div className="flex items-center gap-3">
          <StatusBadge variant={statusVariants[service.status]}>
            {statusLabels[service.status]}
          </StatusBadge>
          <span className="text-caption capitalize">
            Stage: {service.current_stage}
          </span>
        </div>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href={`/services/${service.id}/edit`}>
          편집
        </Link>
      </Button>
    </div>
  );
}
