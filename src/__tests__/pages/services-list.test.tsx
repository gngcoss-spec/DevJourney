// @TASK P2-S2-T1 - Services List Page Test
// @SPEC docs/planning/02-trd.md#services-목록-화면
// @TEST TDD RED phase - Test first

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ServicesPage from '@/app/(dashboard)/services/page';
import * as useServicesHook from '@/lib/hooks/use-services';
import type { Service } from '@/types/database';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Test wrapper with TanStack Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Mock service data
const mockServices: Service[] = [
  {
    id: 'svc-1',
    user_id: 'user-1',
    name: 'DevJourney',
    description: '개발 여정 관리 도구',
    goal: '개발 프로세스 개선',
    target_users: '개발자',
    current_stage: 'development',
    current_server: null,
    tech_stack: ['Next.js', 'Supabase'],
    ai_role: null,
    status: 'active',
    progress: 45,
    next_action: 'Services 목록 화면 구현',
    last_activity_at: '2026-02-10T12:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-02-10T12:00:00Z',
  },
  {
    id: 'svc-2',
    user_id: 'user-1',
    name: 'E-commerce Platform',
    description: '온라인 쇼핑몰',
    goal: '매출 증대',
    target_users: '소상공인',
    current_stage: 'planning',
    current_server: null,
    tech_stack: ['React', 'Node.js'],
    ai_role: null,
    status: 'stalled',
    progress: 20,
    next_action: '요구사항 정리',
    last_activity_at: '2026-01-15T08:00:00Z',
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-01-15T08:00:00Z',
  },
  {
    id: 'svc-3',
    user_id: 'user-1',
    name: 'Mobile App',
    description: '모바일 앱',
    goal: '사용자 확보',
    target_users: '일반 사용자',
    current_stage: 'idea',
    current_server: null,
    tech_stack: ['React Native'],
    ai_role: null,
    status: 'paused',
    progress: 10,
    next_action: null,
    last_activity_at: '2026-01-05T10:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
  },
];

describe('ServicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때 로딩 표시', async () => {
      vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(<ServicesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/로딩 중/i)).toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('서비스가 없을 때 빈 상태 메시지 표시', () => {
      vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ServicesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/등록된 서비스가 없습니다/i)).toBeInTheDocument();
    });

    it('빈 상태일 때 "새 서비스" 버튼 표시', () => {
      vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ServicesPage />, { wrapper: createWrapper() });

      const newButton = screen.getByRole('link', { name: /새 서비스/i });
      expect(newButton).toBeInTheDocument();
      expect(newButton).toHaveAttribute('href', '/services/new');
    });
  });

  describe('서비스 목록 렌더링', () => {
    it('서비스 목록 테이블 렌더링', () => {
      vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
        data: mockServices,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ServicesPage />, { wrapper: createWrapper() });

      // 서비스명 확인
      expect(screen.getByText('DevJourney')).toBeInTheDocument();
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
      expect(screen.getByText('Mobile App')).toBeInTheDocument();

      // 상태 뱃지 확인 (active, stalled, paused)
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('stalled')).toBeInTheDocument();
      expect(screen.getByText('paused')).toBeInTheDocument();

      // 단계 확인
      expect(screen.getByText('development')).toBeInTheDocument();
      expect(screen.getByText('planning')).toBeInTheDocument();
      expect(screen.getByText('idea')).toBeInTheDocument();
    });

    it('헤더에 "새 서비스" 버튼 표시', () => {
      vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
        data: mockServices,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ServicesPage />, { wrapper: createWrapper() });

      const newButton = screen.getByRole('link', { name: /새 서비스/i });
      expect(newButton).toBeInTheDocument();
      expect(newButton).toHaveAttribute('href', '/services/new');
    });

    it('진행률 표시 (숫자 또는 바)', () => {
      vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
        data: mockServices,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ServicesPage />, { wrapper: createWrapper() });

      // 진행률 숫자 확인 (45%, 20%, 10%)
      expect(screen.getByText(/45%/)).toBeInTheDocument();
      expect(screen.getByText(/20%/)).toBeInTheDocument();
      expect(screen.getByText(/10%/)).toBeInTheDocument();
    });
  });

  describe('검색 기능', () => {
    it('검색 입력 필드 렌더링', () => {
      vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
        data: mockServices,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ServicesPage />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/검색/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('서비스명으로 검색 필터링', async () => {
      const user = userEvent.setup();
      vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
        data: mockServices,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ServicesPage />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/검색/i);

      // "DevJourney" 검색
      await user.type(searchInput, 'DevJourney');

      await waitFor(() => {
        expect(screen.getByText('DevJourney')).toBeInTheDocument();
        expect(screen.queryByText('E-commerce Platform')).not.toBeInTheDocument();
        expect(screen.queryByText('Mobile App')).not.toBeInTheDocument();
      });
    });

    it('검색 결과가 없을 때 메시지 표시', async () => {
      const user = userEvent.setup();
      vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
        data: mockServices,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ServicesPage />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/검색/i);

      // 존재하지 않는 서비스 검색
      await user.type(searchInput, 'NonExistentService');

      await waitFor(() => {
        expect(screen.getByText(/검색 결과가 없습니다/i)).toBeInTheDocument();
      });
    });
  });

  describe('상태 뱃지 스타일', () => {
    it('active 뱃지는 초록색', () => {
      vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
        data: mockServices,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ServicesPage />, { wrapper: createWrapper() });

      const activeBadge = screen.getByText('active');
      expect(activeBadge).toHaveClass(/green/i);
    });

    it('stalled 뱃지는 노란색', () => {
      vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
        data: mockServices,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ServicesPage />, { wrapper: createWrapper() });

      const stalledBadge = screen.getByText('stalled');
      expect(stalledBadge).toHaveClass(/yellow/i);
    });

    it('paused 뱃지는 빨간색', () => {
      vi.spyOn(useServicesHook, 'useServices').mockReturnValue({
        data: mockServices,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<ServicesPage />, { wrapper: createWrapper() });

      const pausedBadge = screen.getByText('paused');
      expect(pausedBadge).toHaveClass(/red/i);
    });
  });
});
