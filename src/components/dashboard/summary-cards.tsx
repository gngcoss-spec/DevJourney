'use client';

import Link from 'next/link';
import { Activity, Pause, TrendingUp, AlertTriangle } from 'lucide-react';
import { BentoGrid, BentoCard, BentoCardHeader, BentoCardTitle, BentoCardValue } from '@/components/ui/bento-grid';
import { IconWrapper } from '@/components/common/icon-wrapper';
import type { Service } from '@/types/database';

interface SummaryCardsProps {
  services: Service[];
}

function isServiceStalled(service: Service): boolean {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const lastActivity = new Date(service.last_activity_at);
  return lastActivity < sevenDaysAgo;
}

export function SummaryCards({ services }: SummaryCardsProps) {
  const totalServices = services.length;
  const activeServices = services.filter(
    (s) => s.status === 'active' && !isServiceStalled(s)
  ).length;
  const stalledServices = services.filter((s) => isServiceStalled(s)).length;
  const pausedServices = services.filter((s) => s.status === 'paused').length;

  const stats = [
    { title: '전체 서비스', value: totalServices, icon: TrendingUp, color: 'blue' as const, href: '/services' },
    { title: '진행중', value: activeServices, icon: Activity, color: 'green' as const, href: '/services?status=active' },
    { title: '정체', value: stalledServices, icon: AlertTriangle, color: 'yellow' as const, href: '/services?status=stalled' },
    { title: '중단', value: pausedServices, icon: Pause, color: 'red' as const, href: '/services?status=paused' },
  ];

  return (
    <BentoGrid columns={4}>
      {stats.map((stat) => (
        <Link key={stat.title} href={stat.href}>
          <BentoCard interactive glow={stat.color} className="h-full">
            <BentoCardHeader>
              <BentoCardTitle>{stat.title}</BentoCardTitle>
              <IconWrapper icon={stat.icon} color={stat.color} size="md" />
            </BentoCardHeader>
            <BentoCardValue>{stat.value}</BentoCardValue>
          </BentoCard>
        </Link>
      ))}
    </BentoGrid>
  );
}
