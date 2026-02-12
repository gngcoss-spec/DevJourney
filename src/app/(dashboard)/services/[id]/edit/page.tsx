// @TASK P2-S3-T1 - Service Edit Page
// @SPEC docs/planning/02-trd.md#프론트엔드-구조
// @TEST src/__tests__/pages/service-form.test.tsx

'use client';

import { useRouter, useParams } from 'next/navigation';
import { ServiceForm, type ServiceFormValues } from '@/components/service/service-form';
import { useService, useUpdateService } from '@/lib/hooks/use-services';
import { arrayToTechStack } from '@/lib/utils/tech-stack';

export default function ServiceEditPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const { data: service, isLoading: isLoadingService } = useService(serviceId);
  const updateService = useUpdateService();

  const handleSubmit = async (data: ServiceFormValues) => {
    try {
      // tech_stack conversion (TechStack → string[]) is handled in the query layer
      await updateService.mutateAsync({ id: serviceId, data: data as any });
      router.push(`/services/${serviceId}`);
    } catch (error) {
      console.error('Failed to update service:', error);
    }
  };

  if (isLoadingService) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-slate-400">서비스 정보 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-slate-400">서비스를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">서비스 편집</h1>
        <p className="text-slate-400">
          {service.name}의 정보를 수정합니다.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
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
    </div>
  );
}
