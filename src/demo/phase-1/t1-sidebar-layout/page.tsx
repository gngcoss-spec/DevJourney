// @TASK P1-S0-T1 - 사이드바 + 인증 레이아웃 데모
// @SPEC docs/planning/tdd/p1-s0-t1.md

'use client';

import { useState } from 'react';
import SidebarNavigation from '@/components/layout/sidebar-navigation';
import { QueryProvider } from '@/components/providers/query-provider';

const DEMO_STATES = {
  dashboard: { route: '/', title: 'Dashboard 페이지' },
  services: { route: '/services', title: 'Services 페이지' },
  mobile: { route: '/', title: 'Mobile View (resize window)' },
} as const;

export default function SidebarLayoutDemo() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('dashboard');

  return (
    <QueryProvider>
      <div className="min-h-screen bg-slate-950">
        {/* 상태 선택기 */}
        <div className="fixed top-0 right-0 z-50 p-4 bg-slate-900/80 backdrop-blur rounded-bl-lg border-l border-b border-slate-700">
          <p className="text-xs text-slate-400 mb-2">데모 상태 선택</p>
          <div className="flex flex-col gap-2">
            {Object.keys(DEMO_STATES).map((s) => (
              <button
                key={s}
                onClick={() => setState(s as keyof typeof DEMO_STATES)}
                className={
                  state === s
                    ? 'bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium'
                    : 'bg-slate-800 text-slate-300 px-4 py-2 rounded text-sm hover:bg-slate-700'
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 레이아웃 렌더링 */}
        <div className="flex min-h-screen">
          <SidebarNavigation />
          <main className="flex-1 p-8 md:ml-0">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-bold text-slate-50 mb-4">
                {DEMO_STATES[state].title}
              </h1>
              <p className="text-slate-400 mb-8">
                사이드바 네비게이션과 대시보드 레이아웃 데모입니다.
              </p>

              {/* 기능 설명 */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                  <h3 className="text-lg font-semibold text-slate-50 mb-2">
                    🖥️ Desktop (md+)
                  </h3>
                  <p className="text-sm text-slate-400">
                    좌측에 고정된 240px 사이드바가 표시됩니다.
                  </p>
                </div>

                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                  <h3 className="text-lg font-semibold text-slate-50 mb-2">
                    📱 Tablet & Mobile
                  </h3>
                  <p className="text-sm text-slate-400">
                    좌측 상단 햄버거 메뉴를 클릭하면 오버레이 사이드바가 나타납니다.
                  </p>
                </div>

                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                  <h3 className="text-lg font-semibold text-slate-50 mb-2">
                    🎨 현재 경로 하이라이트
                  </h3>
                  <p className="text-sm text-slate-400">
                    Dashboard 또는 Services 메뉴 클릭 시 파란색으로 활성화됩니다.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* 상태 정보 */}
        <div className="fixed bottom-4 right-4 p-4 bg-slate-900/80 backdrop-blur rounded-lg border border-slate-700 text-xs font-mono">
          <pre className="text-slate-300">
            {JSON.stringify(DEMO_STATES[state], null, 2)}
          </pre>
        </div>
      </div>
    </QueryProvider>
  );
}
