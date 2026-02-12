'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ServiceForm, type ServiceFormValues } from '@/components/service/service-form';
import { useService, useUpdateService, useDeleteService } from '@/lib/hooks/use-services';
import { arrayToTechStack } from '@/lib/utils/tech-stack';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/common/page-loading';
import { PageError } from '@/components/common/page-error';

export default function ServiceSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: service, isLoading: isLoadingService, error, refetch } = useService(serviceId);
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const handleSubmit = async (data: ServiceFormValues) => {
    try {
      await updateService.mutateAsync({ id: serviceId, data: data as any });
    } catch (error) {
      console.error('Failed to update service:', error);
    }
  };

  const handleDelete = () => {
    deleteService.mutate(serviceId, {
      onSuccess: () => router.push('/services'),
    });
  };

  if (isLoadingService) {
    return <PageLoading />;
  }

  if (!service) {
    return <PageError message="서비스를 찾을 수 없습니다." onRetry={() => refetch()} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-50 mb-8">서비스 설정</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
        <ServiceForm
          mode="edit"
          defaultValues={{
            name: service.name,
            description: service.description || '',
            goal: service.goal || '',
            target_users: service.target_users || '',
            current_stage: service.current_stage,
            current_server: service.current_server || '',
            tech_stack: arrayToTechStack(service.tech_stack || []),
            ai_role: service.ai_role || '',
          }}
          onSubmit={handleSubmit}
          isLoading={updateService.isPending}
        />
      </div>

      {/* Danger Zone */}
      <div className="border border-red-500/30 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-2">위험 영역</h2>
        <p className="text-sm text-slate-400 mb-4">
          이 서비스를 삭제하면 모든 관련 데이터(작업, 로그, 의사결정 등)가 함께 삭제됩니다.
        </p>

        {!showDeleteConfirm ? (
          <Button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30"
          >
            서비스 삭제
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleteService.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteService.isPending ? '삭제 중...' : '정말 삭제'}
            </Button>
            <Button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              variant="ghost"
              className="text-slate-400"
            >
              취소
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
