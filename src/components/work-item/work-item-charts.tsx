'use client';

import dynamic from 'next/dynamic';
import type { WorkItemStats } from '@/lib/utils/work-item-stats';

const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });

const STATUS_COLORS: Record<string, string> = {
  backlog: 'hsl(215, 14%, 45%)',
  ready: 'hsl(270, 60%, 55%)',
  'in-progress': 'hsl(217, 91%, 60%)',
  review: 'hsl(43, 96%, 56%)',
  done: 'hsl(142, 70%, 45%)',
};

const STATUS_LABELS: Record<string, string> = {
  backlog: '백로그',
  ready: '준비됨',
  'in-progress': '진행중',
  review: '리뷰',
  done: '완료',
};

const TYPE_COLORS: Record<string, string> = {
  feature: 'hsl(217, 91%, 60%)',
  bug: 'hsl(0, 84%, 60%)',
  refactor: 'hsl(142, 70%, 45%)',
  infra: 'hsl(270, 60%, 55%)',
  'ai-prompt': 'hsl(25, 95%, 53%)',
};

const TYPE_LABELS: Record<string, string> = {
  feature: '기능',
  bug: '버그',
  refactor: '리팩토링',
  infra: '인프라',
  'ai-prompt': 'AI 프롬프트',
};

interface WorkItemChartsProps {
  stats: WorkItemStats;
}

const tooltipStyle = {
  backgroundColor: 'hsl(215, 25%, 18%)',
  border: '1px solid hsl(215, 20%, 22%)',
  borderRadius: '8px',
  color: '#f1f5f9',
};

export function WorkItemCharts({ stats }: WorkItemChartsProps) {
  const statusData = Object.entries(stats.byStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      fill: STATUS_COLORS[status] || 'hsl(215, 14%, 45%)',
    }));

  const typeData = Object.entries(stats.byType)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      name: TYPE_LABELS[type] || type,
      value: count,
      fill: TYPE_COLORS[type] || 'hsl(215, 14%, 45%)',
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border border-[hsl(var(--border-default))] bg-[hsl(var(--surface))]">
      {/* Status Pie Chart */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-[hsl(var(--text-secondary))]">상태별 분포</h3>
        <div className="h-[200px]">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-[hsl(var(--text-quaternary))]">
              데이터 없음
            </div>
          )}
        </div>
      </div>

      {/* Type Bar Chart */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-[hsl(var(--text-secondary))]">유형별 분포</h3>
        <div className="h-[200px]">
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <XAxis
                  dataKey="name"
                  stroke="hsl(217, 10%, 64%)"
                  tick={{ fill: 'hsl(217, 10%, 64%)', fontSize: 11 }}
                />
                <YAxis
                  stroke="hsl(217, 10%, 64%)"
                  tick={{ fill: 'hsl(217, 10%, 64%)', fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {typeData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-[hsl(var(--text-quaternary))]">
              데이터 없음
            </div>
          )}
        </div>
      </div>

      {/* Points Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[hsl(var(--text-secondary))]">포인트 요약</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border-default))]">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">총 포인트</p>
            <p className="text-xl font-bold text-[hsl(var(--text-primary))]">{stats.totalPoints}</p>
          </div>
          <div className="p-3 rounded-lg bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border-default))]">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">완료 포인트</p>
            <p className="text-xl font-bold text-[hsl(var(--status-success-text))]">{stats.completedPoints}</p>
          </div>
          <div className="p-3 rounded-lg bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border-default))]">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">마감일 설정</p>
            <p className="text-xl font-bold text-[hsl(var(--text-primary))]">{stats.withDueDate}</p>
          </div>
          <div className="p-3 rounded-lg bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border-default))]">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">오버듀</p>
            <p className={`text-xl font-bold ${stats.overdue > 0 ? 'text-[hsl(var(--status-danger-text))]' : 'text-[hsl(var(--text-primary))]'}`}>
              {stats.overdue}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
