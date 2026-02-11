// @TASK P0-T0.4 - Dashboard Layout (사이드바 포함)
// @SPEC docs/planning/02-trd.md#프론트엔드-구조

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* 사이드바는 Phase 1+에서 구현 예정 */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-slate-50">DevJourney</h2>
          <p className="text-xs text-slate-400 mt-1">사이드바 구현 예정</p>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
