// @TASK P4-S3-T1 - Dashboard Integrated Dev Log Tab tests
// @SPEC docs/planning/TASKS.md#dashboard-dev-logs-tab
// @TEST vitest run src/__tests__/components/integrated-log-tab.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntegratedLogTab } from '@/components/dashboard/integrated-log-tab';
import * as useDevLogsHook from '@/lib/hooks/use-dev-logs';
import * as useServicesHook from '@/lib/hooks/use-services';
import type { DevLog, Service } from '@/types/database';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

const createMockDevLog = (overrides: Partial<DevLog> = {}): DevLog => ({
  id: 'log-1',
  service_id: 'service-1',
  user_id: 'user-1',
  log_date: '2026-02-12',
  done: 'Implemented dashboard feature',
  decided: 'Use TanStack Query for state management',
  deferred: 'Performance optimization',
  next_action: 'Complete integrated log tab',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

const createMockService = (overrides: Partial<Service> = {}): Service => ({
  id: 'service-1',
  user_id: 'user-1',
  name: 'DevJourney',
  description: 'Development management app',
  goal: 'Track dev journey',
  target_users: 'Developers',
  current_stage: 'development',
  current_server: 'Vercel',
  tech_stack: ['Next.js', 'Supabase'],
  ai_role: 'Assistant',
  status: 'active',
  progress: 50,
  next_action: 'Build features',
  last_activity_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe('IntegratedLogTab', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('shows loading state when dev logs are loading', () => {
    vi.spyOn(useDevLogsHook, 'useAllDevLogs').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<IntegratedLogTab />);

    expect(screen.getByText(/loading|로딩/i)).toBeInTheDocument();
  });

  it('shows loading state when services are loading', () => {
    vi.spyOn(useDevLogsHook, 'useAllDevLogs').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<IntegratedLogTab />);

    expect(screen.getByText(/loading|로딩/i)).toBeInTheDocument();
  });

  it('shows empty state when no dev logs exist', () => {
    vi.spyOn(useDevLogsHook, 'useAllDevLogs').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<IntegratedLogTab />);

    expect(screen.getByText(/아직 개발 일지가 없습니다|no dev logs/i)).toBeInTheDocument();
  });

  it('displays dev log list with multiple services', () => {
    const services = [
      createMockService({ id: 'service-1', name: 'DevJourney' }),
      createMockService({ id: 'service-2', name: 'E-Commerce' }),
    ];

    const devLogs = [
      createMockDevLog({ id: 'log-1', service_id: 'service-1', log_date: '2026-02-12' }),
      createMockDevLog({ id: 'log-2', service_id: 'service-2', log_date: '2026-02-11' }),
    ];

    vi.spyOn(useDevLogsHook, 'useAllDevLogs').mockReturnValue({
      data: devLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: services,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<IntegratedLogTab />);

    // Both logs should be displayed (Korean date format)
    expect(screen.getByText(/2026\.\s*02\.\s*12\./)).toBeInTheDocument();
    expect(screen.getByText(/2026\.\s*02\.\s*11\./)).toBeInTheDocument();
  });

  it('shows service name for each log entry', () => {
    const services = [createMockService({ id: 'service-1', name: 'DevJourney' })];
    const devLogs = [createMockDevLog({ service_id: 'service-1' })];

    vi.spyOn(useDevLogsHook, 'useAllDevLogs').mockReturnValue({
      data: devLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: services,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<IntegratedLogTab />);

    expect(screen.getByText('DevJourney')).toBeInTheDocument();
  });

  it('shows date for each log entry', () => {
    const services = [createMockService()];
    const devLogs = [createMockDevLog({ log_date: '2026-02-12' })];

    vi.spyOn(useDevLogsHook, 'useAllDevLogs').mockReturnValue({
      data: devLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: services,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<IntegratedLogTab />);

    // Korean date format with periods and spaces
    expect(screen.getByText(/2026\.\s*02\.\s*12\./)).toBeInTheDocument();
  });

  it('shows "done" preview for each log', () => {
    const services = [createMockService()];
    const devLogs = [
      createMockDevLog({ done: 'Implemented dashboard feature' }),
    ];

    vi.spyOn(useDevLogsHook, 'useAllDevLogs').mockReturnValue({
      data: devLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: services,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<IntegratedLogTab />);

    expect(screen.getByText(/implemented dashboard feature/i)).toBeInTheDocument();
  });

  it('shows "next_action" preview for each log', () => {
    const services = [createMockService()];
    const devLogs = [
      createMockDevLog({ next_action: 'Complete integrated log tab' }),
    ];

    vi.spyOn(useDevLogsHook, 'useAllDevLogs').mockReturnValue({
      data: devLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: services,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<IntegratedLogTab />);

    expect(screen.getByText(/complete integrated log tab/i)).toBeInTheDocument();
  });

  it('creates clickable link to service dev logs page', () => {
    const services = [createMockService({ id: 'service-123', name: 'DevJourney' })];
    const devLogs = [createMockDevLog({ id: 'log-1', service_id: 'service-123' })];

    vi.spyOn(useDevLogsHook, 'useAllDevLogs').mockReturnValue({
      data: devLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: services,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<IntegratedLogTab />);

    // Link should point to service dev logs page
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/services/service-123/dev-logs');
  });

  it('shows error state when dev logs query fails', () => {
    vi.spyOn(useDevLogsHook, 'useAllDevLogs').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch'),
    } as any);

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<IntegratedLogTab />);

    expect(screen.getByText(/데이터를 불러오는데 실패했습니다|error/i)).toBeInTheDocument();
  });

  it('shows error state when services query fails', () => {
    vi.spyOn(useDevLogsHook, 'useAllDevLogs').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch'),
    } as any);

    renderWithProviders(<IntegratedLogTab />);

    expect(screen.getByText(/데이터를 불러오는데 실패했습니다|error/i)).toBeInTheDocument();
  });
});
