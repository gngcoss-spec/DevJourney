export const queryKeys = {
  services: {
    all: ['services'] as const,
    detail: (id: string) => ['services', id] as const,
    workItems: (id: string) => ['services', id, 'work-items'] as const,
    devLogs: (id: string) => ['services', id, 'dev-logs'] as const,
  },
  workItems: {
    all: (serviceId: string) => ['work-items', serviceId] as const,
    detail: (id: string) => ['work-items', 'detail', id] as const,
    comments: (id: string) => ['work-items', id, 'comments'] as const,
    aiSessions: (id: string) => ['work-items', id, 'ai-sessions'] as const,
  },
  devLogs: {
    all: ['dev-logs'] as const,
    byService: (serviceId: string) => ['dev-logs', 'service', serviceId] as const,
    detail: (id: string) => ['dev-logs', id] as const,
    byDate: (serviceId: string, date: string) => ['dev-logs', serviceId, date] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    recentActivity: ['dashboard', 'recent-activity'] as const,
  },
};
