import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ActivityItem } from '@/lib/supabase/queries/activity';

vi.mock('@/lib/hooks/use-activity', () => ({
  useRecentActivities: vi.fn(),
}));

import ActivityPage from '@/app/(dashboard)/activity/page';
import { useRecentActivities } from '@/lib/hooks/use-activity';

const mockUseRecentActivities = vi.mocked(useRecentActivities);

const mockActivities: ActivityItem[] = [
  {
    id: 'wi-1',
    type: 'work_item',
    title: 'Login 기능 구현',
    service_id: 'svc-1',
    created_at: '2026-02-12T10:00:00Z',
  },
  {
    id: 'dec-1',
    type: 'decision',
    title: 'React 선택',
    service_id: 'svc-1',
    created_at: '2026-02-12T09:00:00Z',
  },
  {
    id: 'log-1',
    type: 'dev_log',
    title: 'Auth 셋업 완료',
    service_id: 'svc-1',
    created_at: '2026-02-11T10:00:00Z',
  },
  {
    id: 'doc-1',
    type: 'document',
    title: 'API 명세서',
    service_id: 'svc-1',
    created_at: '2026-02-11T08:00:00Z',
  },
];

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('ActivityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state', () => {
    mockUseRecentActivities.mockReturnValue({
      data: undefined, isLoading: true, isError: false, error: null,
    } as any);

    renderWithQuery(<ActivityPage />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseRecentActivities.mockReturnValue({
      data: undefined, isLoading: false, isError: true, error: new Error('fail'),
    } as any);

    renderWithQuery(<ActivityPage />);
    expect(screen.getByText(/에러가 발생했습니다/i)).toBeInTheDocument();
  });

  it('should show empty state', () => {
    mockUseRecentActivities.mockReturnValue({
      data: [], isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<ActivityPage />);
    expect(screen.getByText(/아직 활동 내역이 없습니다/i)).toBeInTheDocument();
  });

  it('should render activity items', () => {
    mockUseRecentActivities.mockReturnValue({
      data: mockActivities, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<ActivityPage />);
    expect(screen.getByText('Login 기능 구현')).toBeInTheDocument();
    expect(screen.getByText('React 선택')).toBeInTheDocument();
    expect(screen.getByText('Auth 셋업 완료')).toBeInTheDocument();
    expect(screen.getByText('API 명세서')).toBeInTheDocument();
  });

  it('should show type labels', () => {
    mockUseRecentActivities.mockReturnValue({
      data: mockActivities, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<ActivityPage />);
    // Activity type labels in the items
    expect(screen.getAllByText('작업').length).toBeGreaterThan(0);
    expect(screen.getAllByText('의사결정').length).toBeGreaterThan(0);
    expect(screen.getAllByText('개발 일지').length).toBeGreaterThan(0);
    expect(screen.getAllByText('문서').length).toBeGreaterThan(0);
  });

  it('should show title "활동 내역"', () => {
    mockUseRecentActivities.mockReturnValue({
      data: mockActivities, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<ActivityPage />);
    expect(screen.getByText('활동 내역')).toBeInTheDocument();
  });

  it('should show filter buttons', () => {
    mockUseRecentActivities.mockReturnValue({
      data: mockActivities, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<ActivityPage />);
    expect(screen.getByText('전체')).toBeInTheDocument();
  });
});
