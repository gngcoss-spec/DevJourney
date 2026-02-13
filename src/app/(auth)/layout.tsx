// @TASK P1-S0-T1 - Auth Layout (인증 페이지 레이아웃)
// @SPEC docs/planning/02-trd.md#프론트엔드-구조

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[hsl(var(--surface-ground))]">
      <div className="w-full max-w-md px-4">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[hsl(var(--text-primary))]">DevJourney</h1>
          <p className="text-sm text-[hsl(var(--text-tertiary))] mt-2">개발 여정 관리 플랫폼</p>
        </div>

        {children}
      </div>
    </main>
  );
}
