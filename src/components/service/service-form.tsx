// @TASK P2-S3-T1 - Service Form Component
// @SPEC docs/planning/TASKS.md#service-form
// @TEST src/__tests__/pages/service-form.test.tsx

'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import type { CreateServiceInput } from '@/types/database';
import { Button } from '@/components/ui/button';
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

// Zod v4 스키마
export const serviceFormSchema = z.object({
  name: z.string().min(1, '서비스명을 입력해주세요'),
  description: z.string().optional(),
  goal: z.string().optional(),
  target_users: z.string().optional(),
  current_stage: z
    .enum(['idea', 'planning', 'design', 'development', 'testing', 'launch', 'enhancement'])
    .default('idea'),
  current_server: z.string().optional(),
  tech_stack: z.array(z.string()).default([]),
  ai_role: z.string().optional(),
});

export type ServiceFormData = z.infer<typeof serviceFormSchema>;

// Zod v4 호환 수동 resolver
function zodResolver<T extends z.ZodType>(schema: T) {
  return async (data: unknown) => {
    const result = schema.safeParse(data);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    // Zod v4에서는 result.error.issues 사용
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

export interface ServiceFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateServiceInput>;
  onSubmit: (data: CreateServiceInput) => void;
  isLoading?: boolean;
}

const STAGE_OPTIONS = [
  { value: 'idea', label: '아이디어' },
  { value: 'planning', label: '기획' },
  { value: 'design', label: '디자인' },
  { value: 'development', label: '개발' },
  { value: 'testing', label: '테스트' },
  { value: 'launch', label: '런칭' },
  { value: 'enhancement', label: '개선' },
] as const;

export function ServiceForm({
  mode,
  defaultValues,
  onSubmit,
  isLoading = false,
}: ServiceFormProps) {
  const [techStackInput, setTechStackInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      goal: defaultValues?.goal || '',
      target_users: defaultValues?.target_users || '',
      current_stage: defaultValues?.current_stage || 'idea',
      current_server: defaultValues?.current_server || '',
      tech_stack: defaultValues?.tech_stack || [],
      ai_role: defaultValues?.ai_role || '',
    },
  });

  const techStack = watch('tech_stack') || [];

  const handleAddTechStack = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setValue('tech_stack', [...techStack, trimmed]);
    }
    setTechStackInput('');
  };

  const handleTechStackKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTechStack(techStackInput);
    } else if (e.key === ',') {
      e.preventDefault();
      handleAddTechStack(techStackInput);
    }
  };

  const handleTechStackBlur = () => {
    if (techStackInput.trim()) {
      handleAddTechStack(techStackInput);
    }
  };

  const removeTechStack = (index: number) => {
    const newTechStack = techStack.filter((_, i) => i !== index);
    setValue('tech_stack', newTechStack);
  };

  const onFormSubmit = (data: ServiceFormData) => {
    onSubmit(data as CreateServiceInput);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* 서비스명 - 필수 */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          서비스명 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="서비스명을 입력하세요"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          설명
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="서비스에 대한 간단한 설명"
          rows={3}
        />
      </div>

      {/* 목표 */}
      <div className="space-y-2">
        <Label htmlFor="goal" className="text-sm font-medium">
          목표
        </Label>
        <Textarea
          id="goal"
          {...register('goal')}
          placeholder="이 서비스로 달성하고자 하는 목표"
          rows={3}
        />
      </div>

      {/* 대상 사용자 */}
      <div className="space-y-2">
        <Label htmlFor="target_users" className="text-sm font-medium">
          대상 사용자
        </Label>
        <Input
          id="target_users"
          {...register('target_users')}
          placeholder="예: 개발자, 디자이너"
        />
      </div>

      {/* 현재 단계 */}
      <div className="space-y-2">
        <Label htmlFor="current_stage" className="text-sm font-medium">
          현재 단계
        </Label>
        <Controller
          name="current_stage"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="current_stage">
                <SelectValue placeholder="현재 단계를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* 현재 서버 */}
      <div className="space-y-2">
        <Label htmlFor="current_server" className="text-sm font-medium">
          현재 서버
        </Label>
        <Input
          id="current_server"
          {...register('current_server')}
          placeholder="예: https://myservice.com"
          type="url"
        />
      </div>

      {/* 기술 스택 - 태그 입력 */}
      <div className="space-y-2">
        <Label htmlFor="tech_stack_input" className="text-sm font-medium">
          기술 스택
        </Label>
        <Input
          id="tech_stack_input"
          value={techStackInput}
          onChange={(e) => setTechStackInput(e.target.value)}
          onKeyDown={handleTechStackKeyDown}
          onBlur={handleTechStackBlur}
          placeholder="쉼표나 엔터로 추가"
        />
        {/* 태그 목록 */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {techStack.map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-100 rounded-full text-sm"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTechStack(index)}
                  aria-label="삭제"
                  className="hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI 역할 */}
      <div className="space-y-2">
        <Label htmlFor="ai_role" className="text-sm font-medium">
          AI 역할
        </Label>
        <Textarea
          id="ai_role"
          {...register('ai_role')}
          placeholder="AI가 이 프로젝트에서 담당할 역할"
          rows={3}
        />
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? mode === 'create'
              ? '생성 중...'
              : '수정 중...'
            : mode === 'create'
            ? '생성'
            : '수정'}
        </Button>
      </div>
    </form>
  );
}
