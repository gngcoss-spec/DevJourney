'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useServices } from '@/lib/hooks/use-services';
import { ServicesTable } from '@/components/service/services-table';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ServicesPage() {
  const { data: services, isLoading, isError } = useServices();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (!searchQuery.trim()) return services;

    const query = searchQuery.toLowerCase();
    return services.filter((service) =>
      service.name.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-[hsl(var(--text-tertiary))]">로딩 중...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-[hsl(var(--status-danger-text))]">서비스를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Services">
          <Button asChild>
            <Link href="/services/new">새 서비스</Link>
          </Button>
        </PageHeader>

        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <p className="text-[hsl(var(--text-tertiary))] text-lg mb-4">등록된 서비스가 없습니다</p>
          <p className="text-[hsl(var(--text-quaternary))] text-sm mb-6">
            새 서비스를 생성하여 개발 여정을 시작하세요
          </p>
          <Button asChild>
            <Link href="/services/new">첫 서비스 만들기</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Services">
        <Button asChild>
          <Link href="/services/new">새 서비스</Link>
        </Button>
      </PageHeader>

      <div className="max-w-md">
        <Input
          type="text"
          placeholder="서비스 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredServices.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
          <p className="text-[hsl(var(--text-tertiary))] text-lg">검색 결과가 없습니다</p>
          <p className="text-[hsl(var(--text-quaternary))] text-sm mt-2">
            다른 키워드로 검색해 보세요
          </p>
        </div>
      )}

      {filteredServices.length > 0 && (
        <ServicesTable services={filteredServices} />
      )}
    </div>
  );
}
