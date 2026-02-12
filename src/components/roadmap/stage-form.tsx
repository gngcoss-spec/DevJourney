'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateStage, useUpdateStage } from '@/lib/hooks/use-stages';
import type { Stage, ServiceStage } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { stageLabels } from '@/components/roadmap/stage-card';

function zodResolver<T extends z.ZodType>(schema: T) {
  return async (data: unknown) => {
    const result = schema.safeParse(data);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (!errors[path]) {
        errors[path] = { type: 'validation', message: issue.message };
      }
    }
    return { values: {}, errors };
  };
}

const stageSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  summary: z.string().optional(),
  deliverables_text: z.string().optional(),
});

type StageFormData = z.infer<typeof stageSchema>;

export interface StageFormProps {
  serviceId: string;
  stageName: ServiceStage;
  onClose: () => void;
  existingStage?: Stage;
}

export function StageForm({ serviceId, stageName, onClose, existingStage }: StageFormProps) {
  const isEditMode = !!existingStage;

  const createStage = useCreateStage();
  const updateStage = useUpdateStage(serviceId);

  const isPending = isEditMode ? updateStage.isPending : createStage.isPending;

  const {
    register,
    handleSubmit,
  } = useForm<StageFormData>({
    resolver: zodResolver(stageSchema),
    mode: 'onSubmit',
    defaultValues: {
      start_date: existingStage?.start_date || '',
      end_date: existingStage?.end_date || '',
      summary: existingStage?.summary || '',
      deliverables_text: existingStage?.deliverables?.join('\n') || '',
    },
  });

  const onSubmit = (data: StageFormData) => {
    const deliverables = data.deliverables_text
      ? data.deliverables_text.split('\n').map((d) => d.trim()).filter(Boolean)
      : [];

    if (isEditMode) {
      updateStage.mutate(
        {
          id: existingStage.id,
          data: {
            start_date: data.start_date || null,
            end_date: data.end_date || null,
            summary: data.summary || null,
            deliverables,
          },
        },
        { onSuccess: () => onClose() }
      );
    } else {
      createStage.mutate(
        {
          service_id: serviceId,
          stage_name: stageName,
          start_date: data.start_date || undefined,
          end_date: data.end_date || undefined,
          summary: data.summary || undefined,
          deliverables,
        },
        { onSuccess: () => onClose() }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border-default))] pb-4">
        <h2 className="text-subheading">
          {stageLabels[stageName]} 단계 {isEditMode ? '수정' : '등록'}
        </h2>
        <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label="닫기">
          <X className="size-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">시작일</Label>
            <Input id="start_date" type="date" {...register('start_date')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">종료일</Label>
            <Input id="end_date" type="date" {...register('end_date')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">요약</Label>
          <Textarea id="summary" {...register('summary')} rows={3} placeholder="이 단계의 요약을 입력하세요" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliverables_text">산출물 (한 줄에 하나씩)</Label>
          <Textarea id="deliverables_text" {...register('deliverables_text')} rows={3} placeholder="PRD&#10;ERD&#10;API Spec" />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="outline">
            취소
          </Button>
          <Button type="submit" disabled={isPending}>
            {isEditMode ? '수정' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}
