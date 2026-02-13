// @TASK P4-S1-T1 - Dev Logs Timeline Component
// @SPEC docs/planning/TASKS.md#dev-logs-timeline-ui
// @TEST src/__tests__/pages/dev-logs.test.tsx

'use client';

import { useState } from 'react';
import type { DevLog } from '@/types/database';
import { DevLogCard } from './dev-log-card';

interface DevLogsTimelineProps {
  devLogs: DevLog[];
}

export function DevLogsTimeline({ devLogs }: DevLogsTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {devLogs.map((log, index) => (
        <div key={log.id} className="relative">
          {/* Timeline line */}
          {index < devLogs.length - 1 && (
            <div className="absolute left-0 top-12 bottom-0 w-px bg-[hsl(var(--border-default))] ml-2" />
          )}

          {/* Timeline dot */}
          <div className="absolute left-0 top-6 w-4 h-4 rounded-full bg-[hsl(var(--border-default))] border-2 border-[hsl(var(--surface-raised))]" />

          {/* Card */}
          <div className="ml-8">
            <DevLogCard
              devLog={log}
              isExpanded={expandedId === log.id}
              onToggle={() => handleToggle(log.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
