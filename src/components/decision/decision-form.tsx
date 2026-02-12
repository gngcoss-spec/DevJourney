'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateDecision, useUpdateDecision } from '@/lib/hooks/use-decisions';
import type { Decision } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

const decisionSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  background: z.string().optional(),
  options_text: z.string().optional(),
  selected_option: z.string().optional(),
  reason: z.string().optional(),
  impact: z.string().optional(),
});

type DecisionFormData = z.infer<typeof decisionSchema>;

export interface DecisionFormProps {
  serviceId: string;
  onClose: () => void;
  existingDecision?: Decision;
}

export function DecisionForm({ serviceId, onClose, existingDecision }: DecisionFormProps) {
  const isEditMode = !!existingDecision;

  const createDecision = useCreateDecision();
  const updateDecision = useUpdateDecision(serviceId);

  const isPending = isEditMode ? updateDecision.isPending : createDecision.isPending;

  const optionsToText = (options: Record<string, unknown>[]): string => {
    return options.map((o) => (o.name as string) || '').filter(Boolean).join('\n');
  };

  const textToOptions = (text: string): Record<string, unknown>[] => {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DecisionFormData>({
    resolver: zodResolver(decisionSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: existingDecision?.title || '',
      background: existingDecision?.background || '',
      options_text: existingDecision?.options ? optionsToText(existingDecision.options) : '',
      selected_option: existingDecision?.selected_option || '',
      reason: existingDecision?.reason || '',
      impact: existingDecision?.impact || '',
    },
  });

  const onSubmit = (data: DecisionFormData) => {
    const options = data.options_text ? textToOptions(data.options_text) : [];

    if (isEditMode) {
      updateDecision.mutate(
        {
          id: existingDecision.id,
          data: {
            title: data.title,
            background: data.background || null,
            options,
            selected_option: data.selected_option || null,
            reason: data.reason || null,
            impact: data.impact || null,
          },
        },
        { onSuccess: () => onClose() }
      );
    } else {
      createDecision.mutate(
        {
          service_id: serviceId,
          title: data.title,
          background: data.background || undefined,
          options,
          selected_option: data.selected_option || undefined,
          reason: data.reason || undefined,
          impact: data.impact || undefined,
        },
        { onSuccess: () => onClose() }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border-default))] pb-4">
        <h2 className="text-subheading">
          {isEditMode ? '의사결정 수정' : '새 의사결정'}
        </h2>
        <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label="닫기">
          <X className="size-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">제목 *</Label>
          <Input id="title" {...register('title')} placeholder="의사결정 제목" />
          {errors.title && <p className="text-sm text-[hsl(var(--status-danger-text))]">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="background">배경</Label>
          <Textarea id="background" {...register('background')} rows={2} placeholder="결정의 배경을 설명하세요" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="options_text">검토 옵션 (한 줄에 하나씩)</Label>
          <Textarea id="options_text" {...register('options_text')} rows={3} placeholder="React&#10;Vue&#10;Angular" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="selected_option">선택된 옵션</Label>
          <Input id="selected_option" {...register('selected_option')} placeholder="최종 선택한 옵션" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">선택 이유</Label>
          <Textarea id="reason" {...register('reason')} rows={2} placeholder="이 옵션을 선택한 이유" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="impact">영향</Label>
          <Textarea id="impact" {...register('impact')} rows={2} placeholder="이 결정의 영향" />
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
