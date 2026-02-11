// @TASK P1-S0-T1 - 데모 허브 (모든 데모 링크)

'use client';

import Link from 'next/link';

const demos = [
  {
    phase: 'Phase 1',
    items: [
      {
        id: 't1-sidebar-layout',
        name: 'T1: 사이드바 + 인증 레이아웃',
        path: '/demo/phase-1/t1-sidebar-layout',
        description: '반응형 사이드바 네비게이션 + TanStack Query Provider',
      },
    ],
  },
];

export default function DemoHub() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-50 mb-2">DevJourney Demos</h1>
        <p className="text-slate-400 mb-8">
          모든 UI 컴포넌트와 레이아웃의 데모를 확인하세요.
        </p>

        {demos.map((phase) => (
          <div key={phase.phase} className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-50 mb-4">{phase.phase}</h2>
            <div className="grid gap-4">
              {phase.items.map((demo) => (
                <Link
                  key={demo.id}
                  href={demo.path}
                  className="p-6 bg-slate-900 rounded-lg border border-slate-800 hover:border-blue-500 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-slate-50 mb-2">
                    {demo.name}
                  </h3>
                  <p className="text-sm text-slate-400">{demo.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
