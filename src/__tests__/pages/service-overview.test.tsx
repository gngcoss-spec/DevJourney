// @TASK P2-S4-T1 - Service Overview Page Tests
// @SPEC docs/planning/TASKS.md#service-overview
// @TEST Service Overview 페이지 렌더링 및 인터랙션 테스트

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ServiceOverviewPage from '@/app/(dashboard)/services/[id]/page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-service-id' }),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/services/test-service-id',
}));

// Mock useService hook
vi.mock('@/lib/hooks/use-services', () => ({
  useService: vi.fn(),
}));

import { useService } from '@/lib/hooks/use-services';

const mockUseService = vi.mocked(useService);

const mockService = {
  id: 'test-service-id',
  user_id: 'user-1',
  name: 'Test Service',
  description: 'A comprehensive test service',
  goal: 'Build a robust MVP',
  target_users: 'Developers and project managers',
  current_stage: 'development' as const,
  current_server: 'https://api.example.com',
  tech_stack: ['React', 'TypeScript', 'TailwindCSS'],
  ai_role: 'Code assistant for React development',
  status: 'active' as const,
  progress: 65,
  next_action: 'Complete authentication module',
  last_activity_at: '2026-02-11T10:00:00Z',
  created_at: '2026-02-01T10:00:00Z',
  updated_at: '2026-02-11T10:00:00Z',
};

describe('ServiceOverviewPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
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

  describe('Loading State', () => {
    it('로딩 중일 때 스켈레톤 표시', () => {
      mockUseService.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      renderWithProviders(<ServiceOverviewPage />);

      expect(screen.getByTestId('service-overview-skeleton')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('에러 발생 시 에러 메시지 표시', () => {
      mockUseService.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch service'),
      } as any);

      renderWithProviders(<ServiceOverviewPage />);

      expect(screen.getByText(/서비스를 불러오는 중 오류가 발생했습니다/i)).toBeInTheDocument();
    });
  });

  describe('Success State - ServiceHeader', () => {
    beforeEach(() => {
      mockUseService.mockReturnValue({
        data: mockService,
        isLoading: false,
        error: null,
      } as any);
    });

    it('서비스명 렌더링', () => {
      renderWithProviders(<ServiceOverviewPage />);
      expect(screen.getByText('Test Service')).toBeInTheDocument();
    });

    it('상태 뱃지 렌더링 (active)', () => {
      renderWithProviders(<ServiceOverviewPage />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('현재 단계 표시 (development)', () => {
      renderWithProviders(<ServiceOverviewPage />);
      expect(screen.getByText(/Stage: development/i)).toBeInTheDocument();
    });

    it('편집 버튼이 올바른 링크를 가짐', () => {
      renderWithProviders(<ServiceOverviewPage />);
      const editButton = screen.getByRole('link', { name: /편집/i });
      expect(editButton).toHaveAttribute('href', '/services/test-service-id/edit');
    });
  });

  describe('Success State - ServiceTabs', () => {
    beforeEach(() => {
      mockUseService.mockReturnValue({
        data: mockService,
        isLoading: false,
        error: null,
      } as any);
    });

    it('4개 탭 네비게이션 렌더링', () => {
      renderWithProviders(<ServiceOverviewPage />);
      expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Board' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Work Items' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Dev Logs' })).toBeInTheDocument();
    });

    it('각 탭이 올바른 href 속성을 가짐', () => {
      renderWithProviders(<ServiceOverviewPage />);
      expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/services/test-service-id');
      expect(screen.getByRole('link', { name: 'Board' })).toHaveAttribute('href', '/services/test-service-id/board');
      expect(screen.getByRole('link', { name: 'Work Items' })).toHaveAttribute('href', '/services/test-service-id/work-items');
      expect(screen.getByRole('link', { name: 'Dev Logs' })).toHaveAttribute('href', '/services/test-service-id/dev-logs');
    });

    it('Overview 탭이 활성 상태로 표시', () => {
      renderWithProviders(<ServiceOverviewPage />);
      const overviewTab = screen.getByRole('link', { name: 'Overview' });
      expect(overviewTab).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Success State - ServiceInfo', () => {
    beforeEach(() => {
      mockUseService.mockReturnValue({
        data: mockService,
        isLoading: false,
        error: null,
      } as any);
    });

    it('목적/목표 표시', () => {
      renderWithProviders(<ServiceOverviewPage />);
      expect(screen.getByText('A comprehensive test service')).toBeInTheDocument();
      expect(screen.getByText('Build a robust MVP')).toBeInTheDocument();
    });

    it('대상 사용자 표시', () => {
      renderWithProviders(<ServiceOverviewPage />);
      expect(screen.getByText('Developers and project managers')).toBeInTheDocument();
    });

    it('기술 스택 태그 렌더링', () => {
      renderWithProviders(<ServiceOverviewPage />);
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('TailwindCSS')).toBeInTheDocument();
    });

    it('AI 역할 표시', () => {
      renderWithProviders(<ServiceOverviewPage />);
      expect(screen.getByText('Code assistant for React development')).toBeInTheDocument();
    });

    it('다음 액션 강조 표시', () => {
      renderWithProviders(<ServiceOverviewPage />);
      expect(screen.getByText('Complete authentication module')).toBeInTheDocument();
    });

    it('진행률 바 표시 (65%)', () => {
      renderWithProviders(<ServiceOverviewPage />);
      expect(screen.getByText('65%')).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '65');
    });
  });

  describe('Status Badge Colors', () => {
    it('stalled 상태일 때 노랑 뱃지', () => {
      mockUseService.mockReturnValue({
        data: { ...mockService, status: 'stalled' },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ServiceOverviewPage />);
      const badge = screen.getByText('Stalled');
      expect(badge).toHaveClass('bg-yellow-500/10', 'text-yellow-500');
    });

    it('paused 상태일 때 빨강 뱃지', () => {
      mockUseService.mockReturnValue({
        data: { ...mockService, status: 'paused' },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ServiceOverviewPage />);
      const badge = screen.getByText('Paused');
      expect(badge).toHaveClass('bg-red-500/10', 'text-red-500');
    });
  });
});
