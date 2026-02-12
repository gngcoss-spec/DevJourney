'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useDevLogs } from '@/lib/hooks/use-dev-logs';
import { DevLogsTimeline } from '@/components/dev-log/dev-logs-timeline';
import { DevLogForm } from '@/components/dev-log/dev-log-form';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/common/modal';
import { PageLoading } from '@/components/common/page-loading';
import { PageError } from '@/components/common/page-error';
import { PageEmpty } from '@/components/common/page-empty';
import { BookOpen } from 'lucide-react';

export default function DevLogsPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: devLogs, isLoading, isError, refetch } = useDevLogs(serviceId);

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return <PageError message="개발 일지를 불러올 수 없습니다" onRetry={() => refetch()} />;
  }

  if (!devLogs || devLogs.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-50">개발 일지</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            새 로그 작성
          </Button>
        </div>

        <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
          <DevLogForm
            serviceId={serviceId}
            onClose={() => setIsFormOpen(false)}
          />
        </Modal>

        <PageEmpty
          icon={BookOpen}
          message="아직 개발 일지가 없습니다"
          description="첫 번째 일지를 작성하여 개발 여정을 기록해보세요."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-50">개발 일지</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          새 로그 작성
        </Button>
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <DevLogForm
          serviceId={serviceId}
          onClose={() => setIsFormOpen(false)}
        />
      </Modal>

      <DevLogsTimeline devLogs={devLogs} />
    </div>
  );
}
