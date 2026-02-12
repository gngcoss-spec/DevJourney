// @TASK P2-S4-T1 - Service Overview Page Tests
// @SPEC docs/planning/TASKS.md#service-overview
// @TEST Service Overview 페이지 렌더링 및 인터랙션 테스트

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  tech_stack: ['frontend:React', 'frontend:TypeScript', 'frontend:TailwindCSS'],
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
    it('서비스 로딩 중일 때 아무것도 렌더링하지 않음 (레이아웃이 로딩 처리)', () => {
      mockUseService.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const { container } = renderWithProviders(<ServiceOverviewPage />);
      // Overview page returns null when no service data
      expect(container.innerHTML).toBe('');
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
});
