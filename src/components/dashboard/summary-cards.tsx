// @TASK P2-S1-T1 - Summary cards for dashboard
// @SPEC docs/planning/TASKS.md#dashboard-ui

'use client';

import { Activity, Pause, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Service } from '@/types/database';

interface SummaryCardsProps {
  services: Service[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

function StatCard({ title, value, icon, iconBgColor, iconColor }: StatCardProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${iconBgColor}`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-50">{value}</div>
      </CardContent>
    </Card>
  );
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="전체 서비스"
        value={totalServices}
        icon={<TrendingUp className="w-5 h-5" />}
        iconBgColor="bg-blue-500/10"
        iconColor="text-blue-500"
      />
      <StatCard
        title="진행중"
        value={activeServices}
        icon={<Activity className="w-5 h-5" />}
        iconBgColor="bg-green-500/10"
        iconColor="text-green-500"
      />
      <StatCard
        title="정체"
        value={stalledServices}
        icon={<AlertTriangle className="w-5 h-5" />}
        iconBgColor="bg-yellow-500/10"
        iconColor="text-yellow-500"
      />
      <StatCard
        title="중단"
        value={pausedServices}
        icon={<Pause className="w-5 h-5" />}
        iconBgColor="bg-red-500/10"
        iconColor="text-red-500"
      />
    </div>
  );
}
