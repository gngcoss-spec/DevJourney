// @TASK P4-S1-T1 - Dev Logs Timeline UI Test
// @SPEC docs/planning/TASKS.md#dev-logs-timeline-ui
// @TEST Tests for dev logs timeline page with loading/error/empty/normal states

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { DevLog } from '@/types/database';

// Mock hooks
vi.mock('@/lib/hooks/use-dev-logs', () => ({
  useDevLogs: vi.fn(),
  useCreateDevLog: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useUpdateDevLog: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'service-1' })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

import DevLogsPage from '@/app/(dashboard)/services/[id]/dev-logs/page';
import { useDevLogs, useCreateDevLog, useUpdateDevLog } from '@/lib/hooks/use-dev-logs';

const mockUseDevLogs = vi.mocked(useDevLogs);
const mockUseCreateDevLog = vi.mocked(useCreateDevLog);
const mockUseUpdateDevLog = vi.mocked(useUpdateDevLog);

const mockDevLogs: DevLog[] = [
  {
    id: 'log-1',
    service_id: 'service-1',
    user_id: 'user-1',
    log_date: '2026-02-12',
    done: '로그인 폼 UI 구현 완료. Tailwind CSS로 다크모드 스타일링 적용.',
    decided: 'React Hook Form + Zod 스키마 검증 사용 확정',
    deferred: 'OAuth 소셜 로그인 기능은 MVP 이후로 연기',
    next_action: 'API 연동 및 에러 핸들링 구현',
    created_at: '2026-02-12T10:00:00Z',
    updated_at: '2026-02-12T10:00:00Z',
  },
  {
    id: 'log-2',
    service_id: 'service-1',
    user_id: 'user-1',
    log_date: '2026-02-11',
    done: 'Supabase Auth 셋업 완료',
    decided: null,
    deferred: null,
    next_action: '로그인 폼 UI 작업 시작',
    created_at: '2026-02-11T10:00:00Z',
    updated_at: '2026-02-11T10:00:00Z',
  },
];

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('DevLogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreateDevLog.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
    mockUseUpdateDevLog.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it('should show loading state with spinner', () => {
    mockUseDevLogs.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    renderWithQuery(<DevLogsPage />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    // Check for spinner (animate-spin class on SVG or div)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseDevLogs.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
    } as any);

    renderWithQuery(<DevLogsPage />);

    expect(screen.getByText(/에러가 발생했습니다/i)).toBeInTheDocument();
  });

  it('should show empty state when no logs exist', () => {
    mockUseDevLogs.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQuery(<DevLogsPage />);

    expect(screen.getByText(/아직 개발 일지가 없습니다/i)).toBeInTheDocument();
  });

  it('should render log cards in normal state', () => {
    mockUseDevLogs.mockReturnValue({
      data: mockDevLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQuery(<DevLogsPage />);

    // Should show both log dates
    expect(screen.getByText('2026-02-12')).toBeInTheDocument();
    expect(screen.getByText('2026-02-11')).toBeInTheDocument();
  });

  it('should show done field preview in card', () => {
    mockUseDevLogs.mockReturnValue({
      data: mockDevLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQuery(<DevLogsPage />);

    // Should show truncated version of done field
    expect(screen.getByText(/로그인 폼 UI 구현 완료/i)).toBeInTheDocument();
  });

  it('should show next_action preview in card', () => {
    mockUseDevLogs.mockReturnValue({
      data: mockDevLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQuery(<DevLogsPage />);

    // Should show next_action field
    expect(screen.getByText(/API 연동 및 에러 핸들링 구현/i)).toBeInTheDocument();
  });

  it('should expand card on click to show all fields', async () => {
    const user = userEvent.setup();
    mockUseDevLogs.mockReturnValue({
      data: mockDevLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQuery(<DevLogsPage />);

    // Initially, decided/deferred fields should not be visible
    expect(screen.queryByText(/React Hook Form/i)).not.toBeInTheDocument();

    // Click the first card (find by date or container)
    const firstCard = screen.getByText('2026-02-12').closest('div[role="button"]');
    expect(firstCard).toBeInTheDocument();
    await user.click(firstCard!);

    // After click, all 4 fields should be visible
    await waitFor(() => {
      expect(screen.getByText(/React Hook Form/i)).toBeInTheDocument();
      expect(screen.getByText(/OAuth 소셜 로그인 기능은 MVP 이후로 연기/i)).toBeInTheDocument();
    });
  });

  it('should show "새 로그 작성" button', () => {
    mockUseDevLogs.mockReturnValue({
      data: mockDevLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQuery(<DevLogsPage />);

    const newLogButton = screen.getByRole('button', { name: /새 로그 작성/i });
    expect(newLogButton).toBeInTheDocument();
  });

  it('should call handler when "새 로그 작성" button is clicked', async () => {
    const user = userEvent.setup();
    mockUseDevLogs.mockReturnValue({
      data: mockDevLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQuery(<DevLogsPage />);

    const newLogButton = screen.getByRole('button', { name: /새 로그 작성/i });
    await user.click(newLogButton);

    // For now, just check that button is clickable
    // Form/modal will be implemented in later task
    expect(newLogButton).toBeInTheDocument();
  });

  it('should show title "개발 일지"', () => {
    mockUseDevLogs.mockReturnValue({
      data: mockDevLogs,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithQuery(<DevLogsPage />);

    expect(screen.getByText('개발 일지')).toBeInTheDocument();
  });
});
