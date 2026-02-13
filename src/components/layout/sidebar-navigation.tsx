// @TASK P1-S0-T1 - 사이드바 네비게이션
// @SPEC docs/planning/tdd/p1-s0-t1.md

'use client';

import { Home, Layers, Server, Users, Clock, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarStore } from '@/stores/sidebar-store';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Services', href: '/services', icon: Layers },
  { name: 'Servers', href: '/servers', icon: Server },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Activity', href: '/activity', icon: Clock },
];

export default function SidebarNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, toggle, close } = useSidebarStore();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile: 햄버거 메뉴 버튼 */}
      <button
        onClick={toggle}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-[var(--radius-md)] bg-[hsl(var(--surface-raised))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-overlay))]"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Mobile: 오버레이 배경 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-[hsl(var(--surface-ground))] border-r border-[hsl(var(--border-default))] z-40 transition-all duration-300',
          // Desktop: sticky로 뷰포트 높이 고정
          'md:sticky md:top-0 md:h-screen md:w-64',
          // Tablet: 접힘 가능
          'sm:fixed sm:w-64',
          // Mobile: 오버레이
          isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* 로고 */}
          <div className="mb-8 mt-12 md:mt-0">
            <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">DevJourney</h2>
            <p className="text-xs text-[hsl(var(--text-quaternary))] mt-1">개발 여정 관리</p>
          </div>

          {/* 메뉴 항목 */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-colors text-sm',
                    isActive
                      ? 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] font-medium'
                      : 'text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--surface-raised))] hover:text-[hsl(var(--text-secondary))]'
                  )}
                >
                  <Icon className="size-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* 로그아웃 — 사이드바 최하단 고정 */}
          <div className="mt-auto border-t border-[hsl(var(--border-default))] pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[hsl(var(--status-danger-text))]/70 hover:bg-[hsl(var(--status-danger-bg))] hover:text-[hsl(var(--status-danger-text))] transition-colors w-full text-sm"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
