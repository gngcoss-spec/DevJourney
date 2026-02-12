'use client';

import { useState } from 'react';
import { useServers } from '@/lib/hooks/use-servers';
import { ServerCard } from '@/components/server/server-card';
import { ServerForm } from '@/components/server/server-form';
import { PageHeader } from '@/components/common/page-header';
import { PageLoading } from '@/components/common/page-loading';
import { Modal } from '@/components/common/modal';
import { BentoGrid } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';

export default function ServersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: servers, isLoading, isError } = useServers();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-[hsl(var(--status-danger-text))]">에러가 발생했습니다</p>
          <p className="text-sm text-[hsl(var(--text-quaternary))] mt-2">서버 목록을 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="서버 관리">
        <Button onClick={() => setIsFormOpen(true)}>
          새 서버
        </Button>
      </PageHeader>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} size="md">
        <ServerForm onClose={() => setIsFormOpen(false)} />
      </Modal>

      {!servers || servers.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <p className="text-[hsl(var(--text-tertiary))] text-lg">등록된 서버가 없습니다</p>
            <p className="text-sm text-[hsl(var(--text-quaternary))] mt-2">
              서버를 등록하여 인프라를 관리하세요.
            </p>
          </div>
        </div>
      ) : (
        <BentoGrid columns={3}>
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </BentoGrid>
      )}
    </div>
  );
}
