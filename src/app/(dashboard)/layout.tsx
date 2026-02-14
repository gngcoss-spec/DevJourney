// @TASK P1-S0-T1 - Dashboard Layout (사이드바 + Query Provider)
// @SPEC docs/planning/02-trd.md#프론트엔드-구조

import SidebarNavigation from '@/components/layout/sidebar-navigation';
import { QueryProvider } from '@/components/providers/query-provider';
import { SearchDialog } from '@/components/global-search';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <SearchDialog />
      <div className="flex min-h-screen bg-[hsl(var(--surface-ground))]">
        <SidebarNavigation />
        <main className="flex-1 p-4 pt-16 md:p-8 md:pt-8">
          {children}
        </main>
      </div>
    </QueryProvider>
  );
}
