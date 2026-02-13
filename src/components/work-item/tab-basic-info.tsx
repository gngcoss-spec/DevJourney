// @TASK P3-S3-T1 - Work Item Modal - Basic Info Tab
// @SPEC docs/planning/TASKS.md#work-item-modal-basic-info
// @TEST src/__tests__/components/work-item-modal.test.tsx

'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CreateWorkItemInput, UpdateWorkItemInput } from '@/types/database';
import { useTeamMembers } from '@/lib/hooks/use-team';

// Zod schema for work item basic info
const basicInfoSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().optional(),
  type: z.enum(['feature', 'bug', 'refactor', 'infra', 'ai-prompt']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['backlog', 'ready', 'in-progress', 'review', 'done']),
  assignee_name: z.string().optional(),
  due_date: z.string().optional(),
  labels: z.array(z.string()).optional(),
  assignee_id: z.string().optional(),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

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

export interface TabBasicInfoProps {
  formData: Partial<CreateWorkItemInput | UpdateWorkItemInput>;
  onChange: (field: string, value: unknown) => void;
  isEditMode: boolean;
}

const TYPE_OPTIONS = [
  { value: 'feature', label: '기능' },
  { value: 'bug', label: '버그' },
  { value: 'refactor', label: '리팩토링' },
  { value: 'infra', label: '인프라' },
  { value: 'ai-prompt', label: 'AI 프롬프트' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
  { value: 'urgent', label: '긴급' },
] as const;

const STATUS_OPTIONS = [
  { value: 'backlog', label: '백로그' },
  { value: 'ready', label: '준비됨' },
  { value: 'in-progress', label: '진행중' },
  { value: 'review', label: '리뷰' },
  { value: 'done', label: '완료' },
] as const;

export function TabBasicInfo({ formData, onChange, isEditMode }: TabBasicInfoProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: formData.title || '',
      description: formData.description || '',
      type: (formData.type as BasicInfoFormData['type']) || 'feature',
      priority: (formData.priority as BasicInfoFormData['priority']) || 'medium',
      status: (formData.status as BasicInfoFormData['status']) || 'backlog',
      assignee_name: formData.assignee_name || '',
      due_date: (formData as Record<string, unknown>).due_date as string || '',
      labels: ((formData as Record<string, unknown>).labels as string[]) || [],
      assignee_id: (formData as Record<string, unknown>).assignee_id as string || '',
    },
  });

  const { data: teamMembers } = useTeamMembers();
  const [labelInput, setLabelInput] = useState('');
  const labelsValue = watch('labels') || [];

  // Watch form changes and propagate to parent
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
      {/* 제목 - 필수 */}
      <div className="space-y-2">
        <Label htmlFor="title">
          제목 <span className="text-[hsl(var(--status-danger-text))]">*</span>
        </Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="작업 아이템 제목을 입력하세요"
          className={errors.title ? 'border-[hsl(var(--status-danger-text))]' : ''}
        />
        {errors.title && (
          <p className="text-sm text-[hsl(var(--status-danger-text))]">{errors.title.message}</p>
        )}
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label htmlFor="description">
          설명
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="작업 아이템에 대한 상세 설명"
          rows={4}
        />
      </div>

      {/* 유형 */}
      <div className="space-y-2">
        <Label htmlFor="type">
          유형
        </Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="type">
                <SelectValue placeholder="유형을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* 우선순위 */}
      <div className="space-y-2">
        <Label htmlFor="priority">
          우선순위
        </Label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="우선순위를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* 상태 */}
      <div className="space-y-2">
        <Label htmlFor="status">
          상태
        </Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="status">
                <SelectValue placeholder="상태를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* 담당자 */}
      <div className="space-y-2">
        <Label htmlFor="assignee_id">
          담당자
        </Label>
        <Controller
          name="assignee_id"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(value) => {
                field.onChange(value === '__none__' ? '' : value);
                const member = teamMembers?.find((m) => m.id === value);
                setValue('assignee_name', member ? member.display_name : '');
                onChange('assignee_name', member ? member.display_name : '');
              }}
              defaultValue={field.value || '__none__'}
            >
              <SelectTrigger id="assignee_id">
                <SelectValue placeholder="담당자를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">미지정</SelectItem>
                {teamMembers?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <input type="hidden" {...register('assignee_name')} />
      </div>

      {/* 마감일 */}
      <div className="space-y-2">
        <Label htmlFor="due_date">
          마감일
        </Label>
        <Input
          id="due_date"
          type="date"
          {...register('due_date')}
        />
      </div>

      {/* 라벨 */}
      <div className="space-y-2">
        <Label htmlFor="labels">
          라벨
        </Label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {labelsValue.map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[hsl(var(--surface-raised))] text-[hsl(var(--text-tertiary))] border border-[hsl(var(--border-default))]"
            >
              {label}
              <button
                type="button"
                onClick={() => {
                  const next = labelsValue.filter((_, i) => i !== index);
                  setValue('labels', next);
                  onChange('labels', next);
                }}
                className="hover:text-[hsl(var(--status-danger-text))]"
                aria-label={`라벨 ${label} 제거`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <Input
          id="labels"
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && labelInput.trim()) {
              e.preventDefault();
              const next = [...labelsValue, labelInput.trim()];
              setValue('labels', next);
              onChange('labels', next);
              setLabelInput('');
            }
          }}
          placeholder="라벨을 입력하고 Enter를 누르세요"
        />
      </div>
    </div>
  );
}
