import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Decision } from '@/types/database';

vi.mock('@/lib/hooks/use-decisions', () => ({
  useDecisions: vi.fn(),
  useCreateDecision: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateDecision: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteDecision: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'service-1' })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

import DecisionsPage from '@/app/(dashboard)/services/[id]/decisions/page';
import { useDecisions, useDeleteDecision } from '@/lib/hooks/use-decisions';

const mockUseDecisions = vi.mocked(useDecisions);
const mockUseDeleteDecision = vi.mocked(useDeleteDecision);

const mockDecisions: Decision[] = [
  {
    id: 'dec-1',
    service_id: 'service-1',
    user_id: 'user-1',
    title: 'React vs Vue 선택',
    background: '프론트엔드 프레임워크 결정 필요',
    options: [{ name: 'React' }, { name: 'Vue' }],
    selected_option: 'React',
    reason: '생태계가 더 크고 팀 경험이 많음',
    impact: '빠른 개발 속도 기대',
    created_at: '2026-02-12T00:00:00Z',
    updated_at: '2026-02-12T00:00:00Z',
  },
  {
    id: 'dec-2',
    service_id: 'service-1',
    user_id: 'user-1',
    title: 'DB 선택',
    background: null,
    options: [{ name: 'PostgreSQL' }, { name: 'MySQL' }],
    selected_option: 'PostgreSQL',
    reason: null,
    impact: null,
    created_at: '2026-02-11T00:00:00Z',
    updated_at: '2026-02-11T00:00:00Z',
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

describe('DecisionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeleteDecision.mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
  });

  it('should show loading state', () => {
    mockUseDecisions.mockReturnValue({
      data: undefined, isLoading: true, isError: false, error: null,
    } as any);

    renderWithQuery(<DecisionsPage />);
    expect(screen.getByTestId('page-loading')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseDecisions.mockReturnValue({
      data: undefined, isLoading: false, isError: true, error: new Error('fail'),
    } as any);

    renderWithQuery(<DecisionsPage />);
    expect(screen.getByTestId('page-error')).toBeInTheDocument();
    expect(screen.getByText(/의사결정을 불러올 수 없습니다/i)).toBeInTheDocument();
  });

  it('should show empty state', () => {
    mockUseDecisions.mockReturnValue({
      data: [], isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DecisionsPage />);
    expect(screen.getByText(/아직 의사결정이 없습니다/i)).toBeInTheDocument();
  });

  it('should render decision cards', () => {
    mockUseDecisions.mockReturnValue({
      data: mockDecisions, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DecisionsPage />);
    expect(screen.getByText('React vs Vue 선택')).toBeInTheDocument();
    expect(screen.getByText('DB 선택')).toBeInTheDocument();
  });

  it('should show selected option badge', () => {
    mockUseDecisions.mockReturnValue({
      data: mockDecisions, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DecisionsPage />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });

  it('should expand card on click to show details', async () => {
    const user = userEvent.setup();
    mockUseDecisions.mockReturnValue({
      data: mockDecisions, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DecisionsPage />);

    // Background should not be visible initially
    expect(screen.queryByText(/프론트엔드 프레임워크 결정 필요/)).not.toBeInTheDocument();

    // Click the first card
    const firstCard = screen.getByText('React vs Vue 선택').closest('div[role="button"]');
    await user.click(firstCard!);

    await waitFor(() => {
      expect(screen.getByText('프론트엔드 프레임워크 결정 필요')).toBeInTheDocument();
      expect(screen.getByText('생태계가 더 크고 팀 경험이 많음')).toBeInTheDocument();
    });
  });

  it('should show "새 의사결정" button', () => {
    mockUseDecisions.mockReturnValue({
      data: mockDecisions, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DecisionsPage />);
    expect(screen.getByRole('button', { name: /새 의사결정/i })).toBeInTheDocument();
  });

  it('should show title "의사결정"', () => {
    mockUseDecisions.mockReturnValue({
      data: mockDecisions, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<DecisionsPage />);
    expect(screen.getByText('의사결정')).toBeInTheDocument();
  });
});
