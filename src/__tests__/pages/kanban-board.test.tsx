// @TASK P3-S1-T1 - Kanban Board UI TDD tests
// @SPEC docs/planning/TASKS.md#kanban-board-ui
// @TEST vitest run src/__tests__/pages/kanban-board.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { WorkItem } from '@/types/database';

// Mock hooks
vi.mock('@/lib/hooks/use-work-items', () => ({
  useWorkItems: vi.fn(),
  useMoveWorkItem: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'service-1' })),
}));

// Import after mocks
import * as useWorkItemsHook from '@/lib/hooks/use-work-items';
import KanbanBoardPage from '@/app/(dashboard)/services/[id]/board/page';

const createMockWorkItem = (overrides: Partial<WorkItem> = {}): WorkItem => ({
  id: '1',
  service_id: 'service-1',
  user_id: 'user-1',
  title: 'Test Work Item',
  description: 'Test Description',
  type: 'feature',
  priority: 'medium',
  status: 'backlog',
  problem: null,
  options_considered: null,
  decision_reason: null,
  result: null,
  assignee_name: null,
  sort_order: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe('KanbanBoardPage', () => {
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
    vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<KanbanBoardPage />);

    expect(screen.getByTestId('kanban-skeleton')).toBeInTheDocument();
  });

  it('renders all 5 columns (Backlog, Ready, In Progress, Review, Done)', () => {
    vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<KanbanBoardPage />);

    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('displays correct item count in each column header', () => {
    const workItems: WorkItem[] = [
      createMockWorkItem({ id: '1', status: 'backlog' }),
      createMockWorkItem({ id: '2', status: 'backlog' }),
      createMockWorkItem({ id: '3', status: 'ready' }),
      createMockWorkItem({ id: '4', status: 'in-progress' }),
      createMockWorkItem({ id: '5', status: 'done' }),
    ];

    vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
      data: workItems,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<KanbanBoardPage />);

    // Backlog (2)
    const backlogHeader = screen.getByText('Backlog').closest('div');
    expect(backlogHeader).toHaveTextContent('2');

    // Ready (1)
    const readyHeader = screen.getByText('Ready').closest('div');
    expect(readyHeader).toHaveTextContent('1');

    // In Progress (1)
    const inProgressHeader = screen.getByText('In Progress').closest('div');
    expect(inProgressHeader).toHaveTextContent('1');

    // Review (0)
    const reviewHeader = screen.getByText('Review').closest('div');
    expect(reviewHeader).toHaveTextContent('0');

    // Done (1)
    const doneHeader = screen.getByText('Done').closest('div');
    expect(doneHeader).toHaveTextContent('1');
  });

  it('places work items in correct columns based on status', () => {
    const workItems: WorkItem[] = [
      createMockWorkItem({ id: '1', title: 'Backlog Item', status: 'backlog' }),
      createMockWorkItem({ id: '2', title: 'Ready Item', status: 'ready' }),
      createMockWorkItem({ id: '3', title: 'In Progress Item', status: 'in-progress' }),
      createMockWorkItem({ id: '4', title: 'Review Item', status: 'review' }),
      createMockWorkItem({ id: '5', title: 'Done Item', status: 'done' }),
    ];

    vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
      data: workItems,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<KanbanBoardPage />);

    // 각 컬럼에 올바른 카드가 있는지 확인
    expect(screen.getByText('Backlog Item')).toBeInTheDocument();
    expect(screen.getByText('Ready Item')).toBeInTheDocument();
    expect(screen.getByText('In Progress Item')).toBeInTheDocument();
    expect(screen.getByText('Review Item')).toBeInTheDocument();
    expect(screen.getByText('Done Item')).toBeInTheDocument();
  });

  it('displays type badge with correct color for each work item', () => {
    const workItems: WorkItem[] = [
      createMockWorkItem({ id: '1', title: 'Feature Item', type: 'feature' }),
      createMockWorkItem({ id: '2', title: 'Bug Item', type: 'bug' }),
      createMockWorkItem({ id: '3', title: 'Refactor Item', type: 'refactor' }),
      createMockWorkItem({ id: '4', title: 'Infra Item', type: 'infra' }),
      createMockWorkItem({ id: '5', title: 'AI Prompt Item', type: 'ai-prompt' }),
    ];

    vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
      data: workItems,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<KanbanBoardPage />);

    // 유형 뱃지 확인
    expect(screen.getByText('feature')).toBeInTheDocument();
    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('refactor')).toBeInTheDocument();
    expect(screen.getByText('infra')).toBeInTheDocument();
    expect(screen.getByText('ai-prompt')).toBeInTheDocument();
  });

  it('displays priority indicator for each work item', () => {
    const workItems: WorkItem[] = [
      createMockWorkItem({ id: '1', title: 'Urgent Item', priority: 'urgent' }),
      createMockWorkItem({ id: '2', title: 'High Item', priority: 'high' }),
      createMockWorkItem({ id: '3', title: 'Medium Item', priority: 'medium' }),
      createMockWorkItem({ id: '4', title: 'Low Item', priority: 'low' }),
    ];

    vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
      data: workItems,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<KanbanBoardPage />);

    // 우선순위 도트가 있는지 확인 (data-testid로)
    expect(screen.getByTestId('priority-urgent')).toBeInTheDocument();
    expect(screen.getByTestId('priority-high')).toBeInTheDocument();
    expect(screen.getByTestId('priority-medium')).toBeInTheDocument();
    expect(screen.getByTestId('priority-low')).toBeInTheDocument();
  });

  it('renders quick create button in each column', () => {
    vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<KanbanBoardPage />);

    // 5개 컬럼 × 1개 "+" 버튼 = 5개
    const addButtons = screen.getAllByRole('button', { name: /add|create|\+/i });
    expect(addButtons).toHaveLength(5);
  });

  it('shows empty state message when no work items exist', () => {
    vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    renderWithProviders(<KanbanBoardPage />);

    // 빈 상태 메시지 (전체 보드가 비었을 때)
    expect(screen.getByText(/작업 항목이 없습니다|no work items/i)).toBeInTheDocument();
  });

  it('renders error state when fetch fails', () => {
    vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch work items'),
    } as any);

    renderWithProviders(<KanbanBoardPage />);

    expect(screen.getByText(/오류가 발생했습니다|error/i)).toBeInTheDocument();
  });
});
