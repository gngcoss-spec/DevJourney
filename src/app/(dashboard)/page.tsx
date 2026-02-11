// @TASK P0-T0.4 - Dashboard Home Page
// @SPEC docs/planning/02-trd.md#프론트엔드-구조

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-50">DevJourney</h1>
        <p className="mt-4 text-slate-400">개발 여정을 기록하고 관리하는 개발관리 웹</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-6 border border-slate-800 rounded-lg bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-50">Services</h3>
          <p className="text-sm text-slate-400 mt-2">프로젝트 목록</p>
        </div>
        <div className="p-6 border border-slate-800 rounded-lg bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-50">Work Items</h3>
          <p className="text-sm text-slate-400 mt-2">작업 항목</p>
        </div>
        <div className="p-6 border border-slate-800 rounded-lg bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-50">Dev Logs</h3>
          <p className="text-sm text-slate-400 mt-2">개발 로그</p>
        </div>
      </div>
    </div>
  );
}
