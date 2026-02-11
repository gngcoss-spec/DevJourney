// @TASK P4-S1-T1 - Dev Logs Timeline Page
// @SPEC docs/planning/TASKS.md#dev-logs-timeline-ui
// @TEST src/__tests__/pages/dev-logs.test.tsx

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useDevLogs } from '@/lib/hooks/use-dev-logs';
import { DevLogsTimeline } from '@/components/dev-log/dev-logs-timeline';
import { DevLogForm } from '@/components/dev-log/dev-log-form';

export default function DevLogsPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: devLogs, isLoading, isError } = useDevLogs(serviceId);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-slate-400 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-slate-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <svg
            className="h-12 w-12 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-400">에러가 발생했습니다</p>
          <p className="text-sm text-slate-500 mt-2">개발 일지를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!devLogs || devLogs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-50">개발 일지</h1>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            새 로그 작성
          </button>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <DevLogForm
                serviceId={serviceId}
                onClose={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <svg
              className="h-16 w-16 text-slate-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-400 text-lg">아직 개발 일지가 없습니다</p>
            <p className="text-sm text-slate-500 mt-2">
              첫 번째 일지를 작성하여 개발 여정을 기록해보세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Normal state
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-50">개발 일지</h1>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          새 로그 작성
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <DevLogForm
              serviceId={serviceId}
              onClose={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Timeline */}
      <DevLogsTimeline devLogs={devLogs} />
    </div>
  );
}
