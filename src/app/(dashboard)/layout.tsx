// @TASK P1-S0-T1 - Dashboard Layout (사이드바 + Query Provider)
// @SPEC docs/planning/02-trd.md#프론트엔드-구조

import SidebarNavigation from '@/components/layout/sidebar-navigation';
import { QueryProvider } from '@/components/providers/query-provider';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-slate-950">
        <SidebarNavigation />
        <main className="flex-1 p-8 md:ml-0">
          {children}
        </main>
      </div>
    </QueryProvider>
  );
}
