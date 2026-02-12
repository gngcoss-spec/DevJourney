// @TASK P4-S2-T1 - Dev Log Form UI Component
// @SPEC CLAUDE.md + inline requirements
// @TEST src/__tests__/components/dev-log-form.test.tsx

'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateDevLog, useUpdateDevLog } from '@/lib/hooks/use-dev-logs';
import type { DevLog } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Zod v4 manual resolver
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

// Validation: at least one field must be filled
const devLogSchema = z.object({
  log_date: z.string().min(1, '날짜를 선택해주세요'),
  done: z.string().optional(),
  decided: z.string().optional(),
  deferred: z.string().optional(),
  next_action: z.string().optional(),
}).refine(
  (data) => {
    const hasDone = data.done && data.done.trim().length > 0;
    const hasDecided = data.decided && data.decided.trim().length > 0;
    const hasDeferred = data.deferred && data.deferred.trim().length > 0;
    const hasNextAction = data.next_action && data.next_action.trim().length > 0;
    return hasDone || hasDecided || hasDeferred || hasNextAction;
  },
  { message: '최소 1개 항목을 입력해주세요', path: ['done'] }
);

type DevLogFormData = z.infer<typeof devLogSchema>;

export interface DevLogFormProps {
  serviceId: string;
  onClose: () => void;
  existingLog?: DevLog;
}

export function DevLogForm({ serviceId, onClose, existingLog }: DevLogFormProps) {
  const isEditMode = !!existingLog;

  const createDevLog = useCreateDevLog();
  const updateDevLog = useUpdateDevLog(serviceId);

  const isPending = isEditMode ? updateDevLog.isPending : createDevLog.isPending;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DevLogFormData>({
    resolver: zodResolver(devLogSchema),
    mode: 'onSubmit',
    defaultValues: {
      log_date: existingLog?.log_date || today,
      done: existingLog?.done || '',
      decided: existingLog?.decided || '',
      deferred: existingLog?.deferred || '',
      next_action: existingLog?.next_action || '',
    },
  });

  const onSubmit = (data: DevLogFormData) => {
    if (isEditMode) {
      // Update existing log
      updateDevLog.mutate(
        {
          id: existingLog.id,
          data: {
            done: data.done || '',
            decided: data.decided || '',
            deferred: data.deferred || '',
            next_action: data.next_action || '',
          },
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      // Create new log
      createDevLog.mutate(
        {
          service_id: serviceId,
          log_date: data.log_date,
          done: data.done || undefined,
          decided: data.decided || undefined,
          deferred: data.deferred || undefined,
          next_action: data.next_action || undefined,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border-default))] pb-4">
        <h2 className="text-subheading">개발 일지 작성</h2>
        <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label="닫기">
          <X className="size-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Date Field */}
        <div className="space-y-2">
          <Label htmlFor="log_date">날짜</Label>
          <Input id="log_date" type="date" {...register('log_date')} />
          {errors.log_date && (
            <p className="text-sm text-[hsl(var(--status-danger-text))]">{errors.log_date.message}</p>
          )}
        </div>

        {/* Done Field */}
        <div className="space-y-2">
          <Label htmlFor="done">오늘 한 것</Label>
          <Textarea id="done" {...register('done')} rows={3} placeholder="오늘 완료한 작업을 입력하세요" />
        </div>

        {/* Decided Field */}
        <div className="space-y-2">
          <Label htmlFor="decided">확정한 것</Label>
          <Textarea id="decided" {...register('decided')} rows={3} placeholder="결정된 사항을 입력하세요" />
        </div>

        {/* Deferred Field */}
        <div className="space-y-2">
          <Label htmlFor="deferred">보류한 것</Label>
          <Textarea id="deferred" {...register('deferred')} rows={3} placeholder="보류된 사항을 입력하세요" />
        </div>

        {/* Next Action Field */}
        <div className="space-y-2">
          <Label htmlFor="next_action">다음에 할 것</Label>
          <Textarea id="next_action" {...register('next_action')} rows={3} placeholder="다음 단계를 입력하세요" />
        </div>

        {/* Validation Error */}
        {errors.done && (
          <p className="text-sm text-[hsl(var(--status-danger-text))]">{errors.done.message}</p>
        )}

        {/* Action Buttons */}
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
