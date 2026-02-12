'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useStages } from '@/lib/hooks/use-stages';
import { useService } from '@/lib/hooks/use-services';
import { RoadmapTimeline } from '@/components/roadmap/roadmap-timeline';
import { StageForm } from '@/components/roadmap/stage-form';
import { Modal } from '@/components/common/modal';
import { PageLoading } from '@/components/common/page-loading';
import { PageError } from '@/components/common/page-error';
import type { Stage, ServiceStage } from '@/types/database';

export default function RoadmapPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStageName, setEditingStageName] = useState<ServiceStage>('idea');
  const [editingStage, setEditingStage] = useState<Stage | undefined>(undefined);

  const { data: stages, isLoading: stagesLoading, isError: stagesError, error: stagesErrorObj, refetch } = useStages(serviceId);
  const { data: service } = useService(serviceId);

  const handleEditStage = (stageName: ServiceStage, existing?: Stage) => {
    setEditingStageName(stageName);
    setEditingStage(existing);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingStage(undefined);
  };

  if (stagesLoading) {
    return <PageLoading />;
  }

  if (stagesError) {
    return (
      <PageError
        message="로드맵을 불러올 수 없습니다"
        onRetry={() => refetch()}
      />
    );
  }

  const currentStage = service?.current_stage || 'idea';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-50">로드맵</h1>
      </div>

      <Modal isOpen={isFormOpen} onClose={handleClose} maxWidth="max-w-lg">
        <StageForm
          serviceId={serviceId}
          stageName={editingStageName}
          onClose={handleClose}
          existingStage={editingStage}
        />
      </Modal>

      <RoadmapTimeline
        stages={stages || []}
        currentStage={currentStage}
        onEditStage={handleEditStage}
      />
    </div>
  );
}
