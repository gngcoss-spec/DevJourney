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
    links: (id: string) => ['work-items', id, 'links'] as const,
  },
  devLogs: {
    all: ['dev-logs'] as const,
    byService: (serviceId: string) => ['dev-logs', 'service', serviceId] as const,
    detail: (id: string) => ['dev-logs', id] as const,
    byDate: (serviceId: string, date: string) => ['dev-logs', serviceId, date] as const,
  },
  decisions: {
    all: ['decisions'] as const,
    byService: (serviceId: string) => ['decisions', 'service', serviceId] as const,
    detail: (id: string) => ['decisions', id] as const,
  },
  stages: {
    all: ['stages'] as const,
    byService: (serviceId: string) => ['stages', 'service', serviceId] as const,
    detail: (id: string) => ['stages', id] as const,
  },
  documents: {
    all: ['documents'] as const,
    byService: (serviceId: string) => ['documents', 'service', serviceId] as const,
    detail: (id: string) => ['documents', id] as const,
  },
  servers: {
    all: ['servers'] as const,
    detail: (id: string) => ['servers', id] as const,
  },
  team: {
    all: ['team'] as const,
    detail: (id: string) => ['team', id] as const,
  },
  activity: {
    all: ['activity'] as const,
    recent: ['activity', 'recent'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    recentActivity: ['dashboard', 'recent-activity'] as const,
  },
  globalSearch: {
    query: (q: string) => ['global-search', q] as const,
  },
};
