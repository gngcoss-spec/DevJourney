'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { BentoCard, BentoCardHeader, BentoCardTitle } from '@/components/ui/bento-grid';
import type { Service } from '@/types/database';

const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

interface MilestoneChartProps {
  services: Service[];
}

export function MilestoneChart({ services }: MilestoneChartProps) {
  const router = useRouter();

  const chartData = services.map((service) => ({
    id: service.id,
    name: service.name.length > 15 ? service.name.substring(0, 15) + '...' : service.name,
    progress: service.progress,
  }));

  const handleBarClick = (data: { id: string }) => {
    if (data?.id) {
      router.push(`/services/${data.id}`);
    }
  };

  return (
    <BentoCard colSpan="full">
      <BentoCardHeader>
        <BentoCardTitle className="text-subheading">마일스톤 진행률</BentoCardTitle>
      </BentoCardHeader>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 22%)" />
            <XAxis
              dataKey="name"
              stroke="hsl(217 10% 64%)"
              tick={{ fill: 'hsl(217, 10%, 64%)', fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(217 10% 64%)"
              tick={{ fill: 'hsl(217, 10%, 64%)' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(215, 25%, 18%)',
                border: '1px solid hsl(215, 20%, 22%)',
                borderRadius: '12px',
                color: '#f1f5f9',
              }}
              cursor={{ fill: 'hsl(215, 20%, 22%)' }}
            />
            <Bar
              dataKey="progress"
              fill="hsl(217, 91%, 60%)"
              radius={[8, 8, 0, 0]}
              className="cursor-pointer"
              onClick={handleBarClick}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </BentoCard>
  );
}
