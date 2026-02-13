'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useDecisions, useDeleteDecision } from '@/lib/hooks/use-decisions';
import { DecisionCard } from '@/components/decision/decision-card';
import { DecisionForm } from '@/components/decision/decision-form';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/common/modal';
import { PageLoading } from '@/components/common/page-loading';
import { PageError } from '@/components/common/page-error';
import { PageEmpty } from '@/components/common/page-empty';
import { Scale } from 'lucide-react';
import type { Decision } from '@/types/database';

export default function DecisionsPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState<Decision | undefined>(undefined);

  const { data: decisions, isLoading, isError, refetch } = useDecisions(serviceId);
  const deleteDecision = useDeleteDecision(serviceId);

  const handleEdit = (decision: Decision) => {
    setEditingDecision(decision);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteDecision.mutate(id);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingDecision(undefined);
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <PageError message="의사결정을 불러올 수 없습니다" onRetry={() => refetch()} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">의사결정</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          새 의사결정
        </Button>
      </div>

      <Modal isOpen={isFormOpen} onClose={handleClose}>
        <DecisionForm
          serviceId={serviceId}
          onClose={handleClose}
          existingDecision={editingDecision}
        />
      </Modal>

      {!decisions || decisions.length === 0 ? (
        <PageEmpty
          icon={Scale}
          message="아직 의사결정이 없습니다"
          description="첫 번째 의사결정을 기록하여 결정 이력을 남겨보세요."
        />
      ) : (
        <div className="space-y-3">
          {decisions.map((decision) => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
