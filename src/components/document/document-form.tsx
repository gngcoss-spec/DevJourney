'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X } from 'lucide-react';
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
      <div className="flex items-center justify-between border-b border-[hsl(var(--border-default))] pb-4">
        <h2 className="text-subheading">
          {isEditMode ? '문서 수정' : '새 문서'}
        </h2>
        <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label="닫기">
          <X className="size-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">제목 *</Label>
          <Input id="title" {...register('title')} placeholder="문서 제목" />
          {errors.title && <p className="text-sm text-[hsl(var(--status-danger-text))]">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="doc_type">문서 유형</Label>
          <select
            id="doc_type"
            {...register('doc_type')}
            className="w-full h-9 rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-[hsl(var(--ring))] focus-visible:ring-[hsl(var(--ring)/0.5)] focus-visible:ring-[3px]"
          >
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>{docTypeLabels[type]}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">설명</Label>
          <Textarea id="description" {...register('description')} rows={2} placeholder="문서에 대한 간단한 설명" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="external_url">외부 링크</Label>
          <Input id="external_url" {...register('external_url')} placeholder="https://..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="version">버전</Label>
          <Input id="version" {...register('version')} placeholder="1.0" />
        </div>

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
