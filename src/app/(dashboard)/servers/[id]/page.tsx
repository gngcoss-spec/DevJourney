'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useServer, useDeleteServer } from '@/lib/hooks/use-servers';
import { ServerForm } from '@/components/server/server-form';
import { StatusBadge } from '@/components/common/status-badge';
import { Modal } from '@/components/common/modal';
import { BentoGrid, BentoCard, BentoCardHeader, BentoCardTitle } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/common/page-loading';
import { PageError } from '@/components/common/page-error';
import type { ServerStatus, RiskLevel } from '@/types/database';

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

const riskLabels: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function ServerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params.id as string;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: server, isLoading, isError, refetch } = useServer(serverId);
  const deleteServer = useDeleteServer();

  const handleDelete = () => {
    deleteServer.mutate(serverId, {
      onSuccess: () => router.push('/servers'),
    });
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !server) {
    return <PageError message="서버를 찾을 수 없습니다." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/servers"
            className="p-2 rounded-lg hover:bg-[hsl(var(--surface-hover))] transition-colors"
            aria-label="서버 목록으로 돌아가기"
          >
            <ArrowLeft className="size-5 text-[hsl(var(--text-tertiary))]" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">{server.name}</h1>
              <StatusBadge variant={statusVariants[server.status]}>
                {statusLabels[server.status]}
              </StatusBadge>
            </div>
            {server.ip && (
              <p className="text-sm text-[hsl(var(--text-quaternary))] font-mono mt-1">{server.ip}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}>
            <Pencil className="size-4" />
            편집
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="size-4" />
            삭제
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <BentoGrid columns={2}>
        {/* Card 1: Basic Info */}
        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle>기본 정보</BentoCardTitle>
          </BentoCardHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-[hsl(var(--text-quaternary))] mb-1">설명</p>
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                {server.description || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[hsl(var(--text-quaternary))] mb-1">용도</p>
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                {server.purpose || '-'}
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Status Info */}
        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle>상태 정보</BentoCardTitle>
          </BentoCardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs font-medium text-[hsl(var(--text-quaternary))] mb-1">상태</p>
                <StatusBadge variant={statusVariants[server.status]}>
                  {statusLabels[server.status]}
                </StatusBadge>
              </div>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--text-quaternary))] mb-1">위험도</p>
                <StatusBadge variant={riskVariants[server.risk_level]}>
                  {riskLabels[server.risk_level]}
                </StatusBadge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[hsl(var(--text-quaternary))] mb-1">마지막 활동</p>
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                {new Date(server.last_activity_at).toLocaleString('ko-KR')}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[hsl(var(--text-quaternary))] mb-1">생성일</p>
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                {new Date(server.created_at).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Edit Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} size="lg">
        <ServerForm
          existingServer={server}
          onClose={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="서버 삭제" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[hsl(var(--text-tertiary))]">
            <strong className="text-[hsl(var(--text-primary))]">{server.name}</strong> 서버를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteServer.isPending}
            >
              {deleteServer.isPending ? '삭제 중...' : '삭제 확인'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
