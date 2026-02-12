'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateDocument, useUpdateDocument } from '@/lib/hooks/use-documents';
import type { Document, DocType } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { docTypeLabels } from '@/components/document/document-card';

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

const documentSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().optional(),
  doc_type: z.string().default('other'),
  external_url: z.string().optional(),
  version: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

export interface DocumentFormProps {
  serviceId: string;
  onClose: () => void;
  existingDocument?: Document;
}

const DOC_TYPES: DocType[] = ['planning', 'database', 'api', 'prompt', 'erd', 'architecture', 'other'];

export function DocumentForm({ serviceId, onClose, existingDocument }: DocumentFormProps) {
  const isEditMode = !!existingDocument;

  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument(serviceId);

  const isPending = isEditMode ? updateDocument.isPending : createDocument.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: existingDocument?.title || '',
      description: existingDocument?.description || '',
      doc_type: existingDocument?.doc_type || 'other',
      external_url: existingDocument?.external_url || '',
      version: existingDocument?.version || '1.0',
    },
  });

  const onSubmit = (data: DocumentFormData) => {
    if (isEditMode) {
      updateDocument.mutate(
        {
          id: existingDocument.id,
          data: {
            title: data.title,
            description: data.description || null,
            doc_type: data.doc_type as DocType,
            external_url: data.external_url || null,
            version: data.version || '1.0',
          },
        },
        { onSuccess: () => onClose() }
      );
    } else {
      createDocument.mutate(
        {
          service_id: serviceId,
          title: data.title,
          description: data.description || undefined,
          doc_type: data.doc_type as DocType,
          external_url: data.external_url || undefined,
          version: data.version || undefined,
        },
        { onSuccess: () => onClose() }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <h2 className="text-xl font-semibold text-slate-50">
          {isEditMode ? '문서 수정' : '새 문서'}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-300" aria-label="닫기">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-slate-300">제목 *</Label>
          <Input
            id="title"
            {...register('title')}
            className="bg-slate-800 border-slate-700 text-slate-50"
            placeholder="문서 제목"
          />
          {errors.title && <p className="text-sm text-red-400">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="doc_type" className="text-sm font-medium text-slate-300">문서 유형</Label>
          <select
            id="doc_type"
            {...register('doc_type')}
            className="w-full rounded-md bg-slate-800 border border-slate-700 text-slate-50 px-3 py-2 text-sm"
          >
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>{docTypeLabels[type]}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-slate-300">설명</Label>
          <Textarea
            id="description"
            {...register('description')}
            rows={2}
            className="bg-slate-800 border-slate-700 text-slate-50"
            placeholder="문서에 대한 간단한 설명"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="external_url" className="text-sm font-medium text-slate-300">외부 링크</Label>
          <Input
            id="external_url"
            {...register('external_url')}
            className="bg-slate-800 border-slate-700 text-slate-50"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="version" className="text-sm font-medium text-slate-300">버전</Label>
          <Input
            id="version"
            {...register('version')}
            className="bg-slate-800 border-slate-700 text-slate-50"
            placeholder="1.0"
          />
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
