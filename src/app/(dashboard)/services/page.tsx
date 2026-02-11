// @TASK P2-S2-T1 - Services List Page
// @SPEC docs/planning/02-trd.md#services-목록-화면
// @TEST src/__tests__/pages/services-list.test.tsx

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useServices } from '@/lib/hooks/use-services';
import { ServicesTable } from '@/components/service/services-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ServicesPage() {
  const { data: services, isLoading, isError } = useServices();
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 필터링
  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (!searchQuery.trim()) return services;

    const query = searchQuery.toLowerCase();
    return services.filter((service) =>
      service.name.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400">로딩 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-400">서비스를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  // 빈 상태 (서비스가 없을 때)
  if (!services || services.length === 0) {
    return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Services</h1>
          <Button asChild>
            <Link href="/services/new">새 서비스</Link>
          </Button>
        </div>

        {/* 빈 상태 메시지 */}
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <p className="text-slate-400 text-lg mb-4">등록된 서비스가 없습니다</p>
          <p className="text-slate-500 text-sm mb-6">
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
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Services</h1>
        <Button asChild>
          <Link href="/services/new">새 서비스</Link>
        </Button>
      </div>

      {/* 검색 */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="서비스 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
        />
      </div>

      {/* 검색 결과 없음 */}
      {filteredServices.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
          <p className="text-slate-400 text-lg">검색 결과가 없습니다</p>
          <p className="text-slate-500 text-sm mt-2">
            다른 키워드로 검색해 보세요
          </p>
        </div>
      )}

      {/* 서비스 테이블 */}
      {filteredServices.length > 0 && (
        <ServicesTable services={filteredServices} />
      )}
    </div>
  );
}
