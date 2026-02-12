'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateServer, useUpdateServer } from '@/lib/hooks/use-servers';
import type { Server, ServerStatus, RiskLevel } from '@/types/database';
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

const serverSchema = z.object({
  name: z.string().min(1, '서버 이름을 입력해주세요'),
  ip: z.string().optional(),
  description: z.string().optional(),
  purpose: z.string().optional(),
  status: z.string().default('active'),
  risk_level: z.string().default('low'),
});

type ServerFormData = z.infer<typeof serverSchema>;

export interface ServerFormProps {
  onClose: () => void;
  existingServer?: Server;
}

export function ServerForm({ onClose, existingServer }: ServerFormProps) {
  const isEditMode = !!existingServer;

  const createServer = useCreateServer();
  const updateServer = useUpdateServer();

  const isPending = isEditMode ? updateServer.isPending : createServer.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServerFormData>({
    resolver: zodResolver(serverSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: existingServer?.name || '',
      ip: existingServer?.ip || '',
      description: existingServer?.description || '',
      purpose: existingServer?.purpose || '',
      status: existingServer?.status || 'active',
      risk_level: existingServer?.risk_level || 'low',
    },
  });

  const onSubmit = (data: ServerFormData) => {
    if (isEditMode) {
      updateServer.mutate(
        {
          id: existingServer.id,
          data: {
            name: data.name,
            ip: data.ip || null,
            description: data.description || null,
            purpose: data.purpose || null,
            status: data.status as ServerStatus,
            risk_level: data.risk_level as RiskLevel,
          },
        },
        { onSuccess: () => onClose() }
      );
    } else {
      createServer.mutate(
        {
          name: data.name,
          ip: data.ip || undefined,
          description: data.description || undefined,
          purpose: data.purpose || undefined,
          status: data.status as ServerStatus,
          risk_level: data.risk_level as RiskLevel,
        },
        { onSuccess: () => onClose() }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <h2 className="text-xl font-semibold text-slate-50">
          {isEditMode ? '서버 수정' : '새 서버'}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-300" aria-label="닫기">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-300">서버 이름 *</Label>
          <Input
            id="name"
            {...register('name')}
            className="bg-slate-800 border-slate-700 text-slate-50"
            placeholder="Production Server"
          />
          {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ip" className="text-sm font-medium text-slate-300">IP 주소</Label>
          <Input
            id="ip"
            {...register('ip')}
            className="bg-slate-800 border-slate-700 text-slate-50"
            placeholder="192.168.1.100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-slate-300">설명</Label>
          <Textarea
            id="description"
            {...register('description')}
            rows={2}
            className="bg-slate-800 border-slate-700 text-slate-50"
            placeholder="서버에 대한 설명"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose" className="text-sm font-medium text-slate-300">용도</Label>
          <Input
            id="purpose"
            {...register('purpose')}
            className="bg-slate-800 border-slate-700 text-slate-50"
            placeholder="Web hosting, API server, etc."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-slate-300">상태</Label>
            <select
              id="status"
              {...register('status')}
              className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-50 px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_level" className="text-sm font-medium text-slate-300">위험도</Label>
            <select
              id="risk_level"
              {...register('risk_level')}
              className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-50 px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="ghost" className="bg-slate-700 hover:bg-slate-600 text-slate-300">
            취소
          </Button>
          <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-500 text-white">
            {isEditMode ? '수정' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}
