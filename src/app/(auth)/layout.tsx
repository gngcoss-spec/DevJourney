// @TASK P0-T0.4 - Auth Layout (인증 페이지 레이아웃)
// @SPEC docs/planning/02-trd.md#프론트엔드-구조

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </main>
  );
}
