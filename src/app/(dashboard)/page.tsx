'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useServices } from '@/lib/hooks/use-services';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { MilestoneChart } from '@/components/dashboard/milestone-chart';
import { ServiceCardList } from '@/components/dashboard/service-card-list';
import { IntegratedLogTab } from '@/components/dashboard/integrated-log-tab';
import { PageHeader } from '@/components/common/page-header';
import { FilterPills } from '@/components/common/filter-pills';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const tabOptions = [
  { value: 'services' as const, label: '서비스 목록' },
  { value: 'logs' as const, label: '통합 로그' },
];

export default function DashboardPage() {
  const { data: services, isLoading, isError } = useServices();
  const [activeTab, setActiveTab] = useState<'services' | 'logs'>('services');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--text-primary))] mx-auto mb-4" />
            <p className="text-[hsl(var(--text-tertiary))]">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-[hsl(var(--status-danger-text))]">데이터를 불러오는데 실패했습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-display">DevJourney</h1>
          <p className="mt-4 text-body">개발 여정을 기록하고 관리하는 개발관리 웹</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-[hsl(var(--text-tertiary))] mb-4">서비스를 추가해보세요</p>
            <Link href="/services/new">
              <Button>
                <Plus className="size-4 mr-2" />
                서비스 생성
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="서비스 진행 현황을 한눈에 확인하세요">
        <Link href="/services/new">
          <Button>
            <Plus className="size-4 mr-2" />
            새 서비스
          </Button>
        </Link>
      </PageHeader>

      <SummaryCards services={services} />

      <MilestoneChart services={services} />

      <div>
        <FilterPills
          options={tabOptions}
          value={activeTab}
          onChange={setActiveTab}
          className="mb-4"
        />

        <div
          id="services-panel"
          role="tabpanel"
          aria-labelledby="services-tab"
          hidden={activeTab !== 'services'}
        >
          {activeTab === 'services' && <ServiceCardList services={services} />}
        </div>
        <div
          id="logs-panel"
          role="tabpanel"
          aria-labelledby="logs-tab"
          hidden={activeTab !== 'logs'}
        >
          {activeTab === 'logs' && <IntegratedLogTab />}
        </div>
      </div>
    </div>
  );
}
