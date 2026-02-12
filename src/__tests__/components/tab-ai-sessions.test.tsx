import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TabAISessions } from '@/components/work-item/tab-ai-sessions';
import type { AISession } from '@/types/database';

const mockDeleteMutate = vi.fn();
const mockCreateMutate = vi.fn();

const mockSessions: AISession[] = [
  {
    id: 'session-1',
    work_item_id: 'wi-1',
    user_id: 'user-1',
    provider: 'chatgpt',
    session_url: 'https://chat.openai.com/share/abc',
    title: 'Auth 구현 논의',
    summary: 'JWT 인증 방식 결정',
    key_decisions: 'JWT 사용 확정',
    created_at: '2026-02-11T00:00:00Z',
  },
  {
    id: 'session-2',
    work_item_id: 'wi-1',
    user_id: 'user-1',
    provider: 'claude',
    session_url: null,
    title: '코드 리뷰',
    summary: null,
    key_decisions: null,
    created_at: '2026-02-10T00:00:00Z',
  },
];

vi.mock('@/lib/hooks/use-ai-sessions', () => ({
  useAISessions: vi.fn(() => ({ data: mockSessions, isLoading: false })),
  useCreateAISession: vi.fn(() => ({ mutate: mockCreateMutate, isPending: false })),
  useDeleteAISession: vi.fn(() => ({ mutate: mockDeleteMutate, isPending: false })),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

import { useAISessions } from '@/lib/hooks/use-ai-sessions';

describe('TabAISessions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    vi.mocked(useAISessions).mockReturnValue({
      data: mockSessions,
      isLoading: false,
    } as ReturnType<typeof useAISessions>);
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <TabAISessions workItemId="wi-1" />
      </QueryClientProvider>,
    );

  it('renders session list with titles', () => {
    renderComponent();
    expect(screen.getByText('Auth 구현 논의')).toBeInTheDocument();
    expect(screen.getByText('코드 리뷰')).toBeInTheDocument();
  });

  it('renders session URL as link', () => {
    renderComponent();
    const link = screen.getByText('https://chat.openai.com/share/abc');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', 'https://chat.openai.com/share/abc');
    expect(link.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('renders summary and key_decisions when present', () => {
    renderComponent();
    expect(screen.getByText('JWT 인증 방식 결정')).toBeInTheDocument();
    expect(screen.getByText(/JWT 사용 확정/)).toBeInTheDocument();
  });

  it('renders created_at dates for each session', () => {
    renderComponent();
    const dateElements = screen.getAllByText(/2026/);
    expect(dateElements.length).toBeGreaterThanOrEqual(2);
  });

  it('renders empty state when no sessions', () => {
    vi.mocked(useAISessions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useAISessions>);

    renderComponent();
    expect(screen.getByText('AI 세션이 없습니다')).toBeInTheDocument();
  });

  it('toggles add form on button click', async () => {
    renderComponent();
    const user = userEvent.setup();

    expect(screen.queryByLabelText(/제목/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /세션 추가/ }));

    expect(screen.getByLabelText(/제목/)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL/)).toBeInTheDocument();
    expect(screen.getByLabelText(/요약/)).toBeInTheDocument();
    expect(screen.getByLabelText(/핵심 결정/)).toBeInTheDocument();
  });

  it('has delete button for each session', () => {
    renderComponent();
    const deleteButtons = screen.getAllByRole('button', { name: '삭제' });
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls delete mutation on delete button click', async () => {
    renderComponent();
    const user = userEvent.setup();

    const deleteButtons = screen.getAllByRole('button', { name: '삭제' });
    await user.click(deleteButtons[0]);

    expect(mockDeleteMutate).toHaveBeenCalledWith('session-1');
  });

  it('renders loading state', () => {
    vi.mocked(useAISessions).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useAISessions>);

    renderComponent();
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });
});
