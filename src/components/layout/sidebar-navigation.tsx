// @TASK P1-S0-T1 - 사이드바 네비게이션
// @SPEC docs/planning/tdd/p1-s0-t1.md

'use client';

import { Home, Layers, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarStore } from '@/stores/sidebar-store';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Services', href: '/services', icon: Layers },
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
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-slate-800 text-slate-50 hover:bg-slate-700"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
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
          'fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-40 transition-all duration-300',
          // Desktop: 항상 표시
          'md:static md:w-64',
          // Tablet: 접힘 가능
          'sm:fixed sm:w-64',
          // Mobile: 오버레이
          isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* 로고 */}
          <div className="mb-8 mt-12 md:mt-0">
            <h2 className="text-lg font-semibold text-slate-50">DevJourney</h2>
            <p className="text-xs text-slate-400 mt-1">개발 여정 관리</p>
          </div>

          {/* 메뉴 항목 */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-50 transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
