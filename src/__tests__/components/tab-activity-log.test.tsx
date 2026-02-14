import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TabActivityLog } from '@/components/work-item/tab-activity-log';
import type { WorkItemComment } from '@/types/database';

// Mock the hooks
const mockUseComments = vi.fn();
const mockCreateMutate = vi.fn();
const mockUseCreateComment = vi.fn(() => ({
  mutate: mockCreateMutate,
  isPending: false,
}));
const mockUpdateMutate = vi.fn();
const mockUseUpdateComment = vi.fn(() => ({
  mutate: mockUpdateMutate,
  isPending: false,
}));
const mockDeleteMutate = vi.fn();
const mockUseDeleteComment = vi.fn(() => ({
  mutate: mockDeleteMutate,
  isPending: false,
}));

vi.mock('@/lib/hooks/use-comments', () => ({
  useComments: (...args: unknown[]) => mockUseComments(...args),
  useCreateComment: (...args: unknown[]) => mockUseCreateComment(...args),
  useUpdateComment: (...args: unknown[]) => mockUseUpdateComment(...args),
  useDeleteComment: (...args: unknown[]) => mockUseDeleteComment(...args),
}));

const mockComments: WorkItemComment[] = [
  {
    id: 'c-1',
    work_item_id: 'wi-1',
    user_id: 'user-1',
    author_name: 'Alice',
    content: 'First comment',
    comment_type: 'comment',
    metadata: {},
    created_at: '2026-02-13T10:00:00Z',
    updated_at: '2026-02-12T00:00:00Z',
    is_edited: false,
  },
  {
    id: 'c-2',
    work_item_id: 'wi-1',
    user_id: 'user-1',
    author_name: 'System',
    content: 'Status changed from backlog to in-progress',
    comment_type: 'status_change',
    metadata: { from_status: 'backlog', to_status: 'in-progress' },
    created_at: '2026-02-13T11:00:00Z',
    updated_at: '2026-02-12T00:00:00Z',
    is_edited: false,
  },
];

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('TabActivityLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseComments.mockReturnValue({
      data: mockComments,
      isLoading: false,
    });
  });

  it('should render comment list with author names and content', () => {
    renderWithClient(<TabActivityLog workItemId="wi-1" />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Status changed from backlog to in-progress')).toBeInTheDocument();
  });

  it('should render empty state when no comments', () => {
    mockUseComments.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWithClient(<TabActivityLog workItemId="wi-1" />);

    expect(screen.getByText('활동 로그가 없습니다')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    mockUseComments.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderWithClient(<TabActivityLog workItemId="wi-1" />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('should render comment input form', () => {
    renderWithClient(<TabActivityLog workItemId="wi-1" />);

    expect(screen.getByLabelText('코멘트 추가')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('코멘트를 입력하세요...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
  });

  it('should disable add button when input is empty', () => {
    renderWithClient(<TabActivityLog workItemId="wi-1" />);

    const addButton = screen.getByRole('button', { name: '추가' });
    expect(addButton).toBeDisabled();
  });

  it('should call createComment when form is submitted', async () => {
    const user = userEvent.setup();
    renderWithClient(<TabActivityLog workItemId="wi-1" />);

    const textarea = screen.getByPlaceholderText('코멘트를 입력하세요...');
    await user.type(textarea, 'New test comment');

    const addButton = screen.getByRole('button', { name: '추가' });
    await user.click(addButton);

    expect(mockCreateMutate).toHaveBeenCalledWith(
      {
        work_item_id: 'wi-1',
        author_name: 'User',
        content: 'New test comment',
        comment_type: 'comment',
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });
});
