// @TASK P2-S3-T1 - Service Create Page
// @SPEC docs/planning/02-trd.md#프론트엔드-구조
// @TEST src/__tests__/pages/service-form.test.tsx

'use client';

import { useRouter } from 'next/navigation';
import { ServiceForm } from '@/components/service/service-form';
import { useCreateService } from '@/lib/hooks/use-services';
import type { CreateServiceInput } from '@/types/database';

export default function ServiceNewPage() {
  const router = useRouter();
  const createService = useCreateService();

  const handleSubmit = async (data: CreateServiceInput) => {
    try {
      await createService.mutateAsync(data);
      router.push('/services');
    } catch (error) {
      console.error('Failed to create service:', error);
      // TODO: 에러 토스트 표시 (향후 P2-S4에서 구현)
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">새 서비스 생성</h1>
        <p className="text-slate-400">
          관리할 서비스의 정보를 입력하세요.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <ServiceForm
          mode="create"
          onSubmit={handleSubmit}
          isLoading={createService.isPending}
        />
      </div>
    </div>
  );
}
