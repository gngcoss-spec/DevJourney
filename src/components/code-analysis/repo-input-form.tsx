'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAnalyzeRepo } from '@/lib/hooks/use-analyze-repo';
import { Loader2 } from 'lucide-react';

const repoUrlSchema = z.object({
  repo_url: z
    .string()
    .min(1, 'GitHub URL을 입력해주세요')
    .regex(/github\.com\/[^/]+\/[^/]+/, '올바른 GitHub 저장소 URL을 입력해주세요'),
});

type RepoUrlForm = z.infer<typeof repoUrlSchema>;

interface RepoInputFormProps {
  serviceId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RepoInputForm({ serviceId, onSuccess, onCancel }: RepoInputFormProps) {
  const analyzeRepo = useAnalyzeRepo();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RepoUrlForm>({
    defaultValues: { repo_url: '' },
  });

  const onSubmit = (data: RepoUrlForm) => {
    analyzeRepo.mutate(
      { repo_url: data.repo_url, service_id: serviceId },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
        새 코드 분석
      </h2>
      <p className="text-sm text-[hsl(var(--text-tertiary))]">
        공개 GitHub 저장소 URL을 입력하면 코드 품질을 분석합니다.
      </p>

      <div className="space-y-2">
        <Label htmlFor="repo_url">GitHub Repository URL</Label>
        <Input
          id="repo_url"
          placeholder="https://github.com/owner/repo"
          {...register('repo_url', {
            required: 'GitHub URL을 입력해주세요',
            pattern: {
              value: /github\.com\/[^/]+\/[^/]+/,
              message: '올바른 GitHub 저장소 URL을 입력해주세요',
            },
          })}
          disabled={analyzeRepo.isPending}
        />
        {errors.repo_url && (
          <p className="text-sm text-red-400">{errors.repo_url.message}</p>
        )}
      </div>

      {analyzeRepo.isError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">
            {analyzeRepo.error?.message || '분석 중 오류가 발생했습니다'}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={analyzeRepo.isPending}>
          취소
        </Button>
        <Button type="submit" disabled={analyzeRepo.isPending}>
          {analyzeRepo.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              분석 중...
            </>
          ) : (
            '분석 시작'
          )}
        </Button>
      </div>
    </form>
  );
}
