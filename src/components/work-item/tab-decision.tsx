// @TASK P3-S3-T1 - Work Item Modal - Decision Tab
// @SPEC docs/planning/TASKS.md#work-item-modal-decision
// @TEST src/__tests__/components/work-item-modal.test.tsx

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { CreateWorkItemInput, UpdateWorkItemInput } from '@/types/database';

export interface TabDecisionProps {
  formData: Partial<CreateWorkItemInput | UpdateWorkItemInput>;
  onChange: (field: string, value: unknown) => void;
}

interface DecisionFormData {
  problem: string;
  options_considered: string;
  decision_reason: string;
  result: string;
}

export function TabDecision({ formData, onChange }: TabDecisionProps) {
  const { register, watch } = useForm<DecisionFormData>({
    defaultValues: {
      problem: formData.problem || '',
      options_considered: formData.options_considered || '',
      decision_reason: formData.decision_reason || '',
      result: formData.result || '',
    },
  });

  useEffect(() => {
    const subscription = watch((values) => {
      Object.entries(values).forEach(([key, value]) => {
        onChange(key, value);
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <div className="space-y-4">
      {/* Problem */}
      <div className="space-y-2">
        <Label htmlFor="problem">
          Problem (왜 필요한가?)
        </Label>
        <Textarea
          id="problem"
          {...register('problem')}
          placeholder="해결하고자 하는 문제를 설명하세요"
          rows={4}
        />
      </div>

      {/* 고려한 선택지 */}
      <div className="space-y-2">
        <Label htmlFor="options_considered">
          고려한 선택지
        </Label>
        <Textarea
          id="options_considered"
          {...register('options_considered')}
          placeholder="검토한 여러 선택지를 나열하세요 (예: Option A, Option B...)"
          rows={4}
        />
      </div>

      {/* 최종 결정 이유 */}
      <div className="space-y-2">
        <Label htmlFor="decision_reason">
          최종 결정 이유
        </Label>
        <Textarea
          id="decision_reason"
          {...register('decision_reason')}
          placeholder="왜 이 선택지를 선택했는지 설명하세요"
          rows={4}
        />
      </div>

      {/* 결과 */}
      <div className="space-y-2">
        <Label htmlFor="result">
          결과
        </Label>
        <Textarea
          id="result"
          {...register('result')}
          placeholder="결정의 결과를 기록하세요"
          rows={4}
        />
      </div>
    </div>
  );
}
