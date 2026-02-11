// @TASK P4-S1-T1 - Dev Log Card Component with accordion
// @SPEC docs/planning/TASKS.md#dev-logs-timeline-ui
// @TEST src/__tests__/pages/dev-logs.test.tsx

import type { DevLog } from '@/types/database';

interface DevLogCardProps {
  devLog: DevLog;
  isExpanded: boolean;
  onToggle: () => void;
}

function truncateText(text: string | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function DevLogCard({ devLog, isExpanded, onToggle }: DevLogCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors cursor-pointer"
    >
      {/* Header: Date */}
      <div className="flex items-center justify-between mb-3">
        <time className="text-sm text-slate-500 font-medium">
          {devLog.log_date}
        </time>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Preview: Done + Next Action */}
      {!isExpanded && (
        <div className="space-y-2">
          {devLog.done && (
            <div>
              <span className="text-xs text-slate-400 mr-2">🟢 오늘 한 것</span>
              <p className="text-sm text-slate-200 mt-1">
                {truncateText(devLog.done, 80)}
              </p>
            </div>
          )}
          {devLog.next_action && (
            <div>
              <span className="text-xs text-slate-400 mr-2">➡️ 다음에 할 것</span>
              <p className="text-sm text-slate-200 mt-1">
                {truncateText(devLog.next_action, 60)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Expanded: All 4 Fields */}
      {isExpanded && (
        <div className="space-y-4">
          {devLog.done && (
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-1">
                🟢 오늘 한 것
              </h4>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">
                {devLog.done}
              </p>
            </div>
          )}

          {devLog.decided && (
            <div>
              <h4 className="text-sm font-medium text-blue-400 mb-1">
                ✅ 확정한 것
              </h4>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">
                {devLog.decided}
              </p>
            </div>
          )}

          {devLog.deferred && (
            <div>
              <h4 className="text-sm font-medium text-yellow-400 mb-1">
                ⏸️ 보류한 것
              </h4>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">
                {devLog.deferred}
              </p>
            </div>
          )}

          {devLog.next_action && (
            <div>
              <h4 className="text-sm font-medium text-purple-400 mb-1">
                ➡️ 다음에 할 것
              </h4>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">
                {devLog.next_action}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
