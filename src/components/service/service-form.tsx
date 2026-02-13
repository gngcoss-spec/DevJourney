// @TASK P2-S3-T1 - Service Form Component
// @SPEC docs/planning/TASKS.md#service-form
// @TEST src/__tests__/pages/service-form.test.tsx

'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import type { CreateServiceInput, TechStack } from '@/types/database';
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

const techStackCategorySchema = z.array(z.string()).default([]);

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
  tech_stack: z.object({
    frontend: techStackCategorySchema,
    backend: techStackCategorySchema,
    ai_engine: techStackCategorySchema,
    visualization: techStackCategorySchema,
    security: techStackCategorySchema,
    integration: techStackCategorySchema,
    deployment: techStackCategorySchema,
  }).default({
    frontend: [],
    backend: [],
    ai_engine: [],
    visualization: [],
    security: [],
    integration: [],
    deployment: [],
  }),
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

/** Form uses TechStack (categorized object), not string[] (DB format). Conversion happens in query layer. */
export interface ServiceFormValues {
  name: string;
  description?: string;
  goal?: string;
  target_users?: string;
  current_stage?: CreateServiceInput['current_stage'];
  current_server?: string;
  tech_stack?: TechStack;
  ai_role?: string;
  generateWBS?: boolean;
}

export interface ServiceFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<ServiceFormValues>;
  onSubmit: (data: ServiceFormValues) => void;
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

const TECH_STACK_CATEGORIES = [
  { key: 'frontend' as const, label: 'Frontend', placeholder: 'React, Next.js, Vue...' },
  { key: 'backend' as const, label: 'Backend', placeholder: 'Node.js, Supabase, Django...' },
  { key: 'ai_engine' as const, label: 'AI Engine', placeholder: 'ChatGPT, Claude, Gemini...' },
  { key: 'visualization' as const, label: 'Visualization', placeholder: 'Recharts, D3.js, Three.js...' },
  { key: 'security' as const, label: 'Security', placeholder: 'OAuth, JWT, RLS...' },
  { key: 'integration' as const, label: 'Integration', placeholder: 'Slack, GitHub, Stripe...' },
  { key: 'deployment' as const, label: 'Deployment', placeholder: 'Vercel, AWS, Docker...' },
] as const;

const DEFAULT_TECH_STACK: TechStack = {
  frontend: [],
  backend: [],
  ai_engine: [],
  visualization: [],
  security: [],
  integration: [],
  deployment: [],
};

export function ServiceForm({
  mode,
  defaultValues,
  onSubmit,
  isLoading = false,
}: ServiceFormProps) {
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>({});
  const [generateWBS, setGenerateWBS] = useState(mode === 'create');

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
      tech_stack: { ...DEFAULT_TECH_STACK, ...(defaultValues?.tech_stack || {}) },
      ai_role: defaultValues?.ai_role || '',
    },
  });

  const techStack = watch('tech_stack') || DEFAULT_TECH_STACK;

  const handleAddTag = (category: keyof TechStack, value: string) => {
    const trimmed = value.trim();
    const current = techStack[category] || [];
    if (trimmed && !current.includes(trimmed)) {
      setValue(`tech_stack.${category}`, [...current, trimmed]);
    }
    setCategoryInputs((prev) => ({ ...prev, [category]: '' }));
  };

  const handleTagKeyDown = (category: keyof TechStack, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(category, categoryInputs[category] || '');
    }
  };

  const handleTagBlur = (category: keyof TechStack) => {
    const value = categoryInputs[category] || '';
    if (value.trim()) {
      handleAddTag(category, value);
    }
  };

  const removeTag = (category: keyof TechStack, index: number) => {
    const current = techStack[category] || [];
    setValue(`tech_stack.${category}`, current.filter((_, i) => i !== index));
  };

  const onFormSubmit = (data: ServiceFormData) => {
    onSubmit({ ...data, generateWBS } as ServiceFormValues);
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

      {/* 기술 스택 - 카테고리별 태그 입력 */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">기술 스택</Label>
        <div className="space-y-3">
          {TECH_STACK_CATEGORIES.map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`tech_stack_${key}`} className="text-xs text-[hsl(var(--text-tertiary))]">
                {label}
              </Label>
              <Input
                id={`tech_stack_${key}`}
                value={categoryInputs[key] || ''}
                onChange={(e) =>
                  setCategoryInputs((prev) => ({ ...prev, [key]: e.target.value }))
                }
                onKeyDown={(e) => handleTagKeyDown(key, e)}
                onBlur={() => handleTagBlur(key)}
                placeholder={placeholder}
              />
              {(techStack[key] || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(techStack[key] || []).map((tag, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(var(--border-default))] text-[hsl(var(--text-primary))] rounded-full text-xs"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(key, index)}
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
          ))}
        </div>
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

      {/* WBS 자동 생성 옵션 (생성 모드에서만 표시) */}
      {mode === 'create' && (
        <div className="bento-glass p-4 space-y-2">
          <label htmlFor="generate-wbs" className="flex items-start gap-3 cursor-pointer">
            <input
              id="generate-wbs"
              type="checkbox"
              checked={generateWBS}
              onChange={(e) => setGenerateWBS(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]"
            />
            <div>
              <span className="text-sm font-medium text-[hsl(var(--text-primary))]">
                WBS 자동 생성
              </span>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
                7단계 로드맵(Stages), 작업 아이템(Work Items), 의사결정(Decisions), 문서(Documents)를 자동 생성합니다.
              </p>
            </div>
          </label>
        </div>
      )}

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
