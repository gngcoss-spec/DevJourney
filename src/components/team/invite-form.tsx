'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <h2 className="text-xl font-semibold text-slate-50">
          {isEditMode ? '멤버 수정' : '멤버 초대'}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-300" aria-label="닫기">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display_name" className="text-sm font-medium text-slate-300">이름 *</Label>
          <Input
            id="display_name"
            {...register('display_name')}
            className="bg-slate-800 border-slate-700 text-slate-50"
            placeholder="멤버 이름"
          />
          {errors.display_name && <p className="text-sm text-red-400">{errors.display_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-300">이메일</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className="bg-slate-800 border-slate-700 text-slate-50"
            placeholder="member@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium text-slate-300">역할</Label>
          <select
            id="role"
            {...register('role')}
            className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-50 px-3 py-2 text-sm"
          >
            <option value="viewer">Viewer</option>
            <option value="contributor">Contributor</option>
            <option value="owner">Owner</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="ghost" className="bg-slate-700 hover:bg-slate-600 text-slate-300">
            취소
          </Button>
          <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-500 text-white">
            {isEditMode ? '수정' : '초대'}
          </Button>
        </div>
      </form>
    </div>
  );
}
