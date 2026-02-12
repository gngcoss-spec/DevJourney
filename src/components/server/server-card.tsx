'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Server, ServerStatus, RiskLevel } from '@/types/database';

interface ServerCardProps {
  server: Server;
}

const statusStyles: Record<ServerStatus, string> = {
  active: 'bg-green-500/20 text-green-500 border-green-500/50',
  maintenance: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  offline: 'bg-red-500/20 text-red-500 border-red-500/50',
};

const statusLabels: Record<ServerStatus, string> = {
  active: 'Active',
  maintenance: 'Maintenance',
  offline: 'Offline',
};

const riskStyles: Record<RiskLevel, string> = {
  low: 'bg-green-500/10 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export function ServerCard({ server }: ServerCardProps) {
  return (
    <Link
      href={`/servers/${server.id}`}
      className="block border border-slate-800 rounded-lg bg-slate-900/50 p-4 hover:bg-slate-800/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-200">{server.name}</h3>
        <Badge variant="outline" className={statusStyles[server.status]}>
          {statusLabels[server.status]}
        </Badge>
      </div>

      {server.ip && (
        <p className="text-xs text-slate-500 font-mono mb-2">{server.ip}</p>
      )}

      {server.description && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{server.description}</p>
      )}

      <div className="flex items-center gap-2">
        {server.purpose && (
          <span className="text-xs text-slate-500">{server.purpose}</span>
        )}
        <Badge variant="outline" className={riskStyles[server.risk_level]}>
          Risk: {server.risk_level}
        </Badge>
      </div>
    </Link>
  );
}
