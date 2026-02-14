// @TASK P3-S3-T1 - Work Item Modal - Basic Info Tab
// @SPEC docs/planning/TASKS.md#work-item-modal-basic-info
// @TEST src/__tests__/components/work-item-modal.test.tsx

'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CreateWorkItemInput, UpdateWorkItemInput, LinkType } from '@/types/database';
import { useTeamMembers } from '@/lib/hooks/use-team';
import { useWorkItems } from '@/lib/hooks/use-work-items';
import { useWorkItemLinks, useCreateWorkItemLink, useDeleteWorkItemLink } from '@/lib/hooks/use-work-item-links';

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
  story_points: z.number().int().min(0).optional().nullable(),
  parent_id: z.string().optional().nullable(),
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
  serviceId?: string;
  workItemId?: string;
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

const LINK_TYPE_LABELS: Record<LinkType, { label: string; style: string }> = {
  blocks: { label: '차단', style: 'bg-red-500/20 text-red-400 border-red-500/30' },
  relates_to: { label: '관련', style: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  duplicates: { label: '중복', style: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
};

export function TabBasicInfo({ formData, onChange, isEditMode, serviceId, workItemId }: TabBasicInfoProps) {
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
      story_points: (formData as Record<string, unknown>).story_points as number | null ?? null,
      parent_id: (formData as Record<string, unknown>).parent_id as string | null ?? null,
    },
  });

  const { data: teamMembers } = useTeamMembers();
  const { data: serviceWorkItems } = useWorkItems(serviceId || '');
  const { data: links } = useWorkItemLinks(workItemId || '');
  const createLink = useCreateWorkItemLink(workItemId || '');
  const deleteLink = useDeleteWorkItemLink(workItemId || '');

  const [labelInput, setLabelInput] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [newLinkTargetId, setNewLinkTargetId] = useState('');
  const [newLinkType, setNewLinkType] = useState<LinkType>('relates_to');
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

  const availableWorkItems = serviceWorkItems?.filter(
    (item) => item.id !== workItemId
  ) || [];

  const handleAddLink = () => {
    if (!newLinkTargetId || !workItemId) return;
    createLink.mutate(
      { source_id: workItemId, target_id: newLinkTargetId, link_type: newLinkType },
      {
        onSuccess: () => {
          setShowLinkForm(false);
          setNewLinkTargetId('');
          setNewLinkType('relates_to');
        },
      }
    );
  };

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

      {/* 상위 항목 (생성 시에만) */}
      {serviceId && (
        <div className="space-y-2">
          <Label htmlFor="parent_id">
            상위 항목
          </Label>
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  field.onChange(value === '__none__' ? null : value);
                  onChange('parent_id', value === '__none__' ? null : value);
                }}
                defaultValue={field.value || '__none__'}
              >
                <SelectTrigger id="parent_id">
                  <SelectValue placeholder="상위 항목을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">없음</SelectItem>
                  {availableWorkItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

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

      {/* 스토리 포인트 */}
      <div className="space-y-2">
        <Label htmlFor="story_points">
          스토리 포인트
        </Label>
        <Input
          id="story_points"
          type="number"
          min="0"
          placeholder="0, 1, 2, 3, 5, 8, 13..."
          {...register('story_points', { valueAsNumber: true })}
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

      {/* 연결된 항목 (편집 모드에서만) */}
      {isEditMode && workItemId && (
        <div className="space-y-2">
          <Label>연결된 항목</Label>
          {links && links.length > 0 && (
            <div className="space-y-1.5">
              {links.map((link) => {
                const isSource = link.source_id === workItemId;
                const linkedId = isSource ? link.target_id : link.source_id;
                const linkedItem = serviceWorkItems?.find((i) => i.id === linkedId);
                const typeInfo = LINK_TYPE_LABELS[link.link_type];
                return (
                  <div key={link.id} className="flex items-center gap-2 text-sm">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${typeInfo.style}`}>
                      {typeInfo.label}
                    </span>
                    <span className="text-[hsl(var(--text-secondary))] flex-1 truncate">
                      {linkedItem?.title || linkedId}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteLink.mutate(link.id)}
                      className="text-[hsl(var(--text-quaternary))] hover:text-[hsl(var(--status-danger-text))]"
                      aria-label="링크 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {!showLinkForm ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLinkForm(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              항목 연결
            </Button>
          ) : (
            <div className="flex items-end gap-2 p-3 rounded-md border border-[hsl(var(--border-default))] bg-[hsl(var(--surface-raised))]">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-[hsl(var(--text-tertiary))]">대상 항목</label>
                <select
                  value={newLinkTargetId}
                  onChange={(e) => setNewLinkTargetId(e.target.value)}
                  className="w-full h-8 rounded-md border border-[hsl(var(--input))] bg-transparent px-2 text-sm"
                >
                  <option value="">선택...</option>
                  {availableWorkItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[hsl(var(--text-tertiary))]">관계</label>
                <select
                  value={newLinkType}
                  onChange={(e) => setNewLinkType(e.target.value as LinkType)}
                  className="h-8 rounded-md border border-[hsl(var(--input))] bg-transparent px-2 text-sm"
                >
                  <option value="relates_to">관련</option>
                  <option value="blocks">차단</option>
                  <option value="duplicates">중복</option>
                </select>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddLink}
                disabled={!newLinkTargetId || createLink.isPending}
              >
                추가
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkForm(false)}
              >
                취소
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
