'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/common/status-badge';
import type { Server, ServerStatus, RiskLevel } from '@/types/database';

interface ServerCardProps {
  server: Server;
}

const statusVariants: Record<ServerStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  maintenance: 'warning',
  offline: 'danger',
};

const statusLabels: Record<ServerStatus, string> = {
  active: 'Active',
  maintenance: 'Maintenance',
  offline: 'Offline',
};

const riskVariants: Record<RiskLevel, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

export function ServerCard({ server }: ServerCardProps) {
  return (
    <Link
      href={`/servers/${server.id}`}
      className="block bento-glass-hover p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-[hsl(var(--text-secondary))]">{server.name}</h3>
        <StatusBadge variant={statusVariants[server.status]}>
          {statusLabels[server.status]}
        </StatusBadge>
      </div>

      {server.ip && (
        <p className="text-xs text-[hsl(var(--text-quaternary))] font-mono mb-2">{server.ip}</p>
      )}

      {server.description && (
        <p className="text-xs text-[hsl(var(--text-tertiary))] mb-3 line-clamp-2">{server.description}</p>
      )}

      <div className="flex items-center gap-2">
        {server.purpose && (
          <span className="text-xs text-[hsl(var(--text-quaternary))]">{server.purpose}</span>
        )}
        <StatusBadge variant={riskVariants[server.risk_level]}>
          Risk: {server.risk_level}
        </StatusBadge>
      </div>
    </Link>
  );
}
