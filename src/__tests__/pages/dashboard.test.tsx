// @TASK P2-S1-T1 - Dashboard UI TDD tests
// @SPEC docs/planning/TASKS.md#dashboard-ui
// @TEST vitest run src/__tests__/pages/dashboard.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '@/app/(dashboard)/page';
import * as useServicesHook from '@/lib/hooks/use-services';
import type { Service } from '@/types/database';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock Recharts (SSR 이슈 방지)
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  Tooltip: () => <div>Tooltip</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
}));

const createMockService = (overrides: Partial<Service> = {}): Service => ({
  id: '1',
  user_id: 'user-1',
  name: 'Test Service',
  description: 'Test Description',
  goal: 'Test Goal',
  target_users: 'Developers',
  current_stage: 'development',
  current_server: 'AWS',
  tech_stack: ['React', 'Node.js'],
  ai_role: 'Assistant',
  status: 'active',
  progress: 50,
  next_action: 'Implement feature X',
  last_activity_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe('DashboardPage', () => {
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

  it('renders loading state initially', () => {
    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<DashboardPage />);

    // 로딩 스켈레톤 또는 로딩 텍스트 확인
    expect(screen.getByText(/loading|로딩/i)).toBeInTheDocument();
  });

  it('renders empty state when no services exist', () => {
    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<DashboardPage />);

    // 빈 상태 메시지 확인
    expect(screen.getByText(/서비스를 추가해보세요|no services/i)).toBeInTheDocument();
  });

  it('renders summary cards with correct counts', () => {
    const now = new Date();
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();

    const services: Service[] = [
      createMockService({ id: '1', status: 'active', last_activity_at: oneDayAgo }),
      createMockService({ id: '2', status: 'active', last_activity_at: eightDaysAgo }), // stalled
      createMockService({ id: '3', status: 'paused', last_activity_at: oneDayAgo }),
    ];

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: services,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<DashboardPage />);

    // 전체 서비스 수: 3
    const totalCard = screen.getByText(/전체 서비스/i).closest('div[data-slot="card"]');
    expect(totalCard).toHaveTextContent('3');

    // 진행중: 1 (active이고 7일 이내 활동)
    const activeCard = screen.getByText(/진행중/i).closest('div[data-slot="card"]');
    expect(activeCard).toHaveTextContent('1');

    // 정체: 1 (7일 이상 활동 없음)
    const stalledCard = screen.getByText(/정체/i).closest('div[data-slot="card"]');
    expect(stalledCard).toHaveTextContent('1');

    // 중단: 1
    const pausedCard = screen.getByText(/중단/i).closest('div[data-slot="card"]');
    expect(pausedCard).toHaveTextContent('1');
  });

  it('renders milestone chart', () => {
    const services: Service[] = [
      createMockService({ id: '1', name: 'Service A', progress: 30 }),
      createMockService({ id: '2', name: 'Service B', progress: 70 }),
    ];

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: services,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<DashboardPage />);

    // 마일스톤 차트 제목 확인 (Recharts는 dynamic import로 로드됨)
    expect(screen.getByText(/마일스톤 진행률/i)).toBeInTheDocument();
  });

  it('renders service card list with correct data', () => {
    const services: Service[] = [
      createMockService({
        id: '1',
        name: 'E-Commerce Platform',
        status: 'active',
        progress: 65,
        current_stage: 'development',
        next_action: 'Implement payment gateway',
      }),
    ];

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: services,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<DashboardPage />);

    // 서비스명 확인
    expect(screen.getByText('E-Commerce Platform')).toBeInTheDocument();

    // 진행률 확인
    expect(screen.getByText(/65%/)).toBeInTheDocument();

    // 다음 액션 확인
    expect(screen.getByText(/Implement payment gateway/i)).toBeInTheDocument();

    // 상태 뱃지 확인
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it('shows stalled warning badge for services inactive over 7 days', () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

    const services: Service[] = [
      createMockService({
        id: '1',
        name: 'Stalled Project',
        status: 'active',
        last_activity_at: eightDaysAgo,
      }),
    ];

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: services,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<DashboardPage />);

    // 정체 경고 뱃지 확인 (서비스 카드 내부)
    expect(screen.getByText(/7일 이상 활동 없음/i)).toBeInTheDocument();
  });

  it('renders service card with clickable link', () => {
    const services: Service[] = [
      createMockService({ id: 'service-123', name: 'Test Service' }),
    ];

    vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
      data: services,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<DashboardPage />);

    // Link 확인
    const link = screen.getByRole('link', { name: /test service/i });
    expect(link).toHaveAttribute('href', '/services/service-123');
  });
});
