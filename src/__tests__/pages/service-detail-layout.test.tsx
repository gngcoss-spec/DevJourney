// Service Detail Layout Tests
// Tests ServiceHeader + ServiceTabs rendering that the layout now handles

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ServiceDetailLayout from '@/app/(dashboard)/services/[id]/layout';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-service-id' }),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/services/test-service-id',
}));

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
  tech_stack: ['frontend:React', 'frontend:TypeScript', 'frontend:TailwindCSS'],
  ai_role: 'Code assistant for React development',
  status: 'active' as const,
  progress: 65,
  next_action: 'Complete authentication module',
  last_activity_at: '2026-02-11T10:00:00Z',
  created_at: '2026-02-01T10:00:00Z',
  updated_at: '2026-02-11T10:00:00Z',
};

describe('ServiceDetailLayout', () => {
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
    it('로딩 중일 때 PageLoading 표시', () => {
      mockUseService.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      renderWithProviders(
        <ServiceDetailLayout><div>child</div></ServiceDetailLayout>
      );

      expect(screen.getByTestId('page-loading')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('에러 발생 시 PageError 표시', () => {
      mockUseService.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch service'),
      } as any);

      renderWithProviders(
        <ServiceDetailLayout><div>child</div></ServiceDetailLayout>
      );

      expect(screen.getByTestId('page-error')).toBeInTheDocument();
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
      renderWithProviders(
        <ServiceDetailLayout><div>child</div></ServiceDetailLayout>
      );
      expect(screen.getByText('Test Service')).toBeInTheDocument();
    });

    it('상태 뱃지 렌더링 (active)', () => {
      renderWithProviders(
        <ServiceDetailLayout><div>child</div></ServiceDetailLayout>
      );
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('현재 단계 표시 (development)', () => {
      renderWithProviders(
        <ServiceDetailLayout><div>child</div></ServiceDetailLayout>
      );
      expect(screen.getByText(/Stage: development/i)).toBeInTheDocument();
    });

    it('편집 버튼이 올바른 링크를 가짐', () => {
      renderWithProviders(
        <ServiceDetailLayout><div>child</div></ServiceDetailLayout>
      );
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

    it('8개 탭 네비게이션 렌더링', () => {
      renderWithProviders(
        <ServiceDetailLayout><div>child</div></ServiceDetailLayout>
      );
      expect(screen.getByRole('link', { name: /Overview/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Board/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Work Items/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Dev Logs/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Roadmap/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Decisions/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Documents/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Settings/i })).toBeInTheDocument();
    });

    it('각 탭이 올바른 href 속성을 가짐', () => {
      renderWithProviders(
        <ServiceDetailLayout><div>child</div></ServiceDetailLayout>
      );
      expect(screen.getByRole('link', { name: /Overview/i })).toHaveAttribute('href', '/services/test-service-id');
      expect(screen.getByRole('link', { name: /Board/i })).toHaveAttribute('href', '/services/test-service-id/board');
      expect(screen.getByRole('link', { name: /Work Items/i })).toHaveAttribute('href', '/services/test-service-id/work-items');
      expect(screen.getByRole('link', { name: /Dev Logs/i })).toHaveAttribute('href', '/services/test-service-id/dev-logs');
      expect(screen.getByRole('link', { name: /Roadmap/i })).toHaveAttribute('href', '/services/test-service-id/roadmap');
      expect(screen.getByRole('link', { name: /Decisions/i })).toHaveAttribute('href', '/services/test-service-id/decisions');
      expect(screen.getByRole('link', { name: /Documents/i })).toHaveAttribute('href', '/services/test-service-id/documents');
      expect(screen.getByRole('link', { name: /Settings/i })).toHaveAttribute('href', '/services/test-service-id/settings');
    });

    it('Overview 탭이 활성 상태로 표시', () => {
      renderWithProviders(
        <ServiceDetailLayout><div>child</div></ServiceDetailLayout>
      );
      const overviewTab = screen.getByRole('link', { name: /Overview/i });
      expect(overviewTab).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Children Rendering', () => {
    it('children이 올바르게 렌더링됨', () => {
      mockUseService.mockReturnValue({
        data: mockService,
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(
        <ServiceDetailLayout><div data-testid="child-content">Hello</div></ServiceDetailLayout>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Status Badge Colors', () => {
    it('stalled 상태일 때 노랑 뱃지', () => {
      mockUseService.mockReturnValue({
        data: { ...mockService, status: 'stalled' },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(
        <ServiceDetailLayout><div>child</div></ServiceDetailLayout>
      );
      const badge = screen.getByText('Stalled');
      expect(badge).toBeInTheDocument();
    });

    it('paused 상태일 때 빨강 뱃지', () => {
      mockUseService.mockReturnValue({
        data: { ...mockService, status: 'paused' },
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(
        <ServiceDetailLayout><div>child</div></ServiceDetailLayout>
      );
      const badge = screen.getByText('Paused');
      expect(badge).toBeInTheDocument();
    });
  });
});
