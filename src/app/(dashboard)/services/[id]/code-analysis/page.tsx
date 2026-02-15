'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCodeAnalyses, useDeleteCodeAnalysis } from '@/lib/hooks/use-code-analyses';
import { AnalysisCard } from '@/components/code-analysis/analysis-card';
import { AnalysisDetail } from '@/components/code-analysis/analysis-detail';
import { RepoInputForm } from '@/components/code-analysis/repo-input-form';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/common/modal';
import { PageLoading } from '@/components/common/page-loading';
import { PageError } from '@/components/common/page-error';
import { PageEmpty } from '@/components/common/page-empty';
import { SearchCode } from 'lucide-react';
import type { CodeAnalysis } from '@/types/database';

export default function CodeAnalysisPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<CodeAnalysis | null>(null);

  const { data: analyses, isLoading, isError, refetch } = useCodeAnalyses(serviceId);
  const deleteAnalysis = useDeleteCodeAnalysis(serviceId);

  const handleDelete = (id: string) => {
    deleteAnalysis.mutate(id);
    if (selectedAnalysis?.id === id) {
      setSelectedAnalysis(null);
    }
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    refetch();
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <PageError message="분석 이력을 불러올 수 없습니다" onRetry={() => refetch()} />;
  }

  // Detail view
  if (selectedAnalysis) {
    return (
      <AnalysisDetail
        analysis={selectedAnalysis}
        onBack={() => setSelectedAnalysis(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">코드 분석</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          새 분석
        </Button>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} size="md">
        <RepoInputForm
          serviceId={serviceId}
          onSuccess={handleSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {!analyses || analyses.length === 0 ? (
        <PageEmpty
          icon={SearchCode}
          message="아직 코드 분석 이력이 없습니다"
          description="GitHub 저장소를 분석하여 코드 품질을 확인해보세요."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {analyses.map((analysis) => (
            <AnalysisCard
              key={analysis.id}
              analysis={analysis}
              onClick={setSelectedAnalysis}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
