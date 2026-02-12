'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateTeamMember, useUpdateTeamMember } from '@/lib/hooks/use-team';
import type { TeamMember, TeamRole } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const inviteSchema = z.object({
  display_name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().optional(),
  role: z.string().default('viewer'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export interface InviteFormProps {
  onClose: () => void;
  existingMember?: TeamMember;
}

export function InviteForm({ onClose, existingMember }: InviteFormProps) {
  const isEditMode = !!existingMember;

  const createTeamMember = useCreateTeamMember();
  const updateTeamMember = useUpdateTeamMember();

  const isPending = isEditMode ? updateTeamMember.isPending : createTeamMember.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    mode: 'onSubmit',
    defaultValues: {
      display_name: existingMember?.display_name || '',
      email: existingMember?.email || '',
      role: existingMember?.role || 'viewer',
    },
  });

  const onSubmit = (data: InviteFormData) => {
    if (isEditMode) {
      updateTeamMember.mutate(
        {
          id: existingMember.id,
          data: {
            display_name: data.display_name,
            email: data.email || null,
            role: data.role as TeamRole,
          },
        },
        { onSuccess: () => onClose() }
      );
    } else {
      createTeamMember.mutate(
        {
          display_name: data.display_name,
          email: data.email || undefined,
          role: data.role as TeamRole,
        },
        { onSuccess: () => onClose() }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border-default))] pb-4">
        <h2 className="text-subheading">
          {isEditMode ? '멤버 수정' : '멤버 초대'}
        </h2>
        <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label="닫기">
          <X className="size-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display_name">이름 *</Label>
          <Input id="display_name" {...register('display_name')} placeholder="멤버 이름" />
          {errors.display_name && <p className="text-sm text-[hsl(var(--status-danger-text))]">{errors.display_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" {...register('email')} placeholder="member@example.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">역할</Label>
          <select
            id="role"
            {...register('role')}
            className="w-full h-9 rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-[hsl(var(--ring))] focus-visible:ring-[hsl(var(--ring)/0.5)] focus-visible:ring-[3px]"
          >
            <option value="viewer">Viewer</option>
            <option value="contributor">Contributor</option>
            <option value="owner">Owner</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="outline">
            취소
          </Button>
          <Button type="submit" disabled={isPending}>
            {isEditMode ? '수정' : '초대'}
          </Button>
        </div>
      </form>
    </div>
  );
}
