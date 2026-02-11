// @TASK P2-S4-T1 - Service Header Component
// @SPEC docs/planning/TASKS.md#service-overview
// @TEST src/__tests__/pages/service-overview.test.tsx

'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Service, ServiceStatus } from '@/types/database';

interface ServiceHeaderProps {
  service: Service;
}

const statusConfig: Record<ServiceStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  },
  stalled: {
    label: 'Stalled',
    className: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  },
  paused: {
    label: 'Paused',
    className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  },
};

export function ServiceHeader({ service }: ServiceHeaderProps) {
  const statusInfo = statusConfig[service.status];

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">{service.name}</h1>
        <div className="flex items-center gap-3">
          <Badge className={statusInfo.className}>
            {statusInfo.label}
          </Badge>
          <span className="text-sm text-slate-400 capitalize">
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
