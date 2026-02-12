'use client';

export function PageLoading() {
  return (
    <div data-testid="page-loading" className="space-y-4 animate-pulse">
      <div className="h-8 bg-slate-800 rounded-lg w-1/3" />
      <div className="h-32 bg-slate-800 rounded-lg" />
      <div className="h-32 bg-slate-800 rounded-lg" />
    </div>
  );
}
