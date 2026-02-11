// @TASK P2-S1-T1 - Dashboard UI with TDD
// @SPEC docs/planning/TASKS.md#dashboard-ui
// @TEST src/__tests__/pages/dashboard.test.tsx

'use client';

import Link from 'next/link';
import { useServices } from '@/lib/hooks/use-services';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { MilestoneChart } from '@/components/dashboard/milestone-chart';
import { ServiceCardList } from '@/components/dashboard/service-card-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { data: services, isLoading, isError } = useServices();

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-50 mx-auto mb-4" />
            <p className="text-slate-400">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-400">데이터를 불러오는데 실패했습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  // 빈 상태
  if (!services || services.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-50">DevJourney</h1>
          <p className="mt-4 text-slate-400">개발 여정을 기록하고 관리하는 개발관리 웹</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-slate-400 mb-4">서비스를 추가해보세요</p>
            <Link href="/services/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                서비스 생성
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 정상 상태
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-50">Dashboard</h1>
          <p className="mt-2 text-slate-400">서비스 진행 현황을 한눈에 확인하세요</p>
        </div>
        <Link href="/services/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 서비스
          </Button>
        </Link>
      </div>

      <SummaryCards services={services} />

      <MilestoneChart services={services} />

      <div>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">서비스 목록</h2>
        <ServiceCardList services={services} />
      </div>
    </div>
  );
}
