// @TASK P2-S3-T1 - Service Create Page
// @SPEC docs/planning/02-trd.md#프론트엔드-구조
// @TEST src/__tests__/pages/service-form.test.tsx

'use client';

import { useRouter } from 'next/navigation';
import { ServiceForm, type ServiceFormValues } from '@/components/service/service-form';
import { useCreateService } from '@/lib/hooks/use-services';
import { useGenerateWBS } from '@/lib/hooks/use-generate-wbs';

export default function ServiceNewPage() {
  const router = useRouter();
  const createService = useCreateService();
  const generateWBS = useGenerateWBS();

  const handleSubmit = async (data: ServiceFormValues) => {
    try {
      const { generateWBS: shouldGenerateWBS, ...serviceData } = data;
      // tech_stack conversion (TechStack → string[]) is handled in the query layer
      const created = await createService.mutateAsync(serviceData as any);

      if (shouldGenerateWBS && created?.id) {
        await generateWBS.mutateAsync(created.id);
      }

      router.push('/services');
    } catch (error) {
      console.error('Failed to create service:', error);
    }
  };

  const isPending = createService.isPending || generateWBS.isPending;

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--text-primary))] mb-2">새 서비스 생성</h1>
        <p className="text-[hsl(var(--text-tertiary))]">
          관리할 서비스의 정보를 입력하세요.
        </p>
      </div>

      <div className="bento-glass p-6">
        <ServiceForm
          mode="create"
          onSubmit={handleSubmit}
          isLoading={isPending}
        />
      </div>
    </div>
  );
}
