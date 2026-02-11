// @TASK P2-S4-T1 - Service Tabs Navigation Component
// @SPEC docs/planning/TASKS.md#service-overview
// @TEST src/__tests__/pages/service-overview.test.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ServiceTabsProps {
  serviceId: string;
}

export function ServiceTabs({ serviceId }: ServiceTabsProps) {
  const pathname = usePathname();

  const tabs = [
    { label: 'Overview', href: `/services/${serviceId}` },
    { label: 'Board', href: `/services/${serviceId}/board` },
    { label: 'Work Items', href: `/services/${serviceId}/work-items` },
    { label: 'Dev Logs', href: `/services/${serviceId}/dev-logs` },
  ];

  return (
    <nav className="border-b border-slate-800">
      <div className="flex space-x-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                isActive
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
