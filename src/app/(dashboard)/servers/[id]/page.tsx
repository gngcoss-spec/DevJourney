'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useServer, useDeleteServer } from '@/lib/hooks/use-servers';
import { ServerForm } from '@/components/server/server-form';
import { Badge } from '@/components/ui/badge';

const statusStyles = {
  active: 'bg-green-500/20 text-green-500 border-green-500/50',
  maintenance: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  offline: 'bg-red-500/20 text-red-500 border-red-500/50',
} as const;

const riskStyles = {
  low: 'bg-green-500/10 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/10 text-red-400 border-red-500/30',
} as const;

export default function ServerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params.id as string;
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: server, isLoading, isError } = useServer(serverId);
  const deleteServer = useDeleteServer();

  const handleDelete = () => {
    deleteServer.mutate(serverId, {
      onSuccess: () => router.push('/servers'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400">로딩 중...</p>
      </div>
    );
  }

  if (isError || !server) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-red-400">서버를 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">{server.name}</h1>
          {server.ip && <p className="text-sm text-slate-500 font-mono mt-1">{server.ip}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={statusStyles[server.status]}>
            {server.status}
          </Badge>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            편집
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <ServerForm
              existingServer={server}
              onClose={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="grid gap-6">
        <div className="border border-slate-800 rounded-lg bg-slate-900/50 p-6 space-y-4">
          {server.description && (
            <div>
              <h3 className="text-xs font-medium text-slate-500 mb-1">설명</h3>
              <p className="text-sm text-slate-300">{server.description}</p>
            </div>
          )}
          {server.purpose && (
            <div>
              <h3 className="text-xs font-medium text-slate-500 mb-1">용도</h3>
              <p className="text-sm text-slate-300">{server.purpose}</p>
            </div>
          )}
          <div>
            <h3 className="text-xs font-medium text-slate-500 mb-1">위험도</h3>
            <Badge variant="outline" className={riskStyles[server.risk_level]}>
              {server.risk_level}
            </Badge>
          </div>
          <div>
            <h3 className="text-xs font-medium text-slate-500 mb-1">마지막 활동</h3>
            <p className="text-sm text-slate-400">
              {new Date(server.last_activity_at).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
