// @TASK P3-S3-T1 - Work Item Modal UI Tests
// @SPEC docs/planning/TASKS.md#work-item-modal
// @TEST TDD: Tests written before implementation

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkItemModal } from '@/components/work-item/work-item-modal';
import type { WorkItem } from '@/types/database';

// Mock dependencies
vi.mock('@/lib/hooks/use-work-items', () => ({
  useCreateWorkItem: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateWorkItem: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteWorkItem: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useWorkItems: vi.fn(() => ({ data: [], isLoading: false })),
  useWorkItem: vi.fn(() => ({ data: undefined })),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

vi.mock('@/lib/supabase/queries/ai-sessions', () => ({
  getAISessions: vi.fn(() => Promise.resolve([])),
  createAISession: vi.fn(),
  deleteAISession: vi.fn(),
}));

vi.mock('@/lib/supabase/queries/comments', () => ({
  getComments: vi.fn(() => Promise.resolve([])),
  createComment: vi.fn(),
  createStatusChangeLog: vi.fn(),
}));

vi.mock('@/lib/hooks/use-comments', () => ({
  useComments: vi.fn(() => ({ data: [], isLoading: false })),
  useCreateComment: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useCreateStatusChangeLog: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateComment: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteComment: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock('@/lib/hooks/use-team', () => ({
  useTeamMembers: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/lib/hooks/use-work-item-links', () => ({
  useWorkItemLinks: vi.fn(() => ({ data: [], isLoading: false })),
  useCreateWorkItemLink: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteWorkItemLink: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const mockWorkItem: WorkItem = {
  id: 'work-1',
  service_id: 'service-1',
  user_id: 'user-1',
  title: 'Test Work Item',
  description: 'Test description',
  type: 'feature',
  priority: 'high',
  status: 'in-progress',
  problem: 'Test problem',
  options_considered: 'Option A, Option B',
  decision_reason: 'Option A is better',
  result: 'Successfully implemented',
  assignee_name: 'John Doe',
  due_date: null,
  labels: [],
  assignee_id: null,
  story_points: null,
  parent_id: null,
  sort_order: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('WorkItemModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Modal renders when isOpen is true
  it('should render modal when isOpen is true', () => {
    renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={vi.fn()}
        serviceId="service-1"
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // Test 2: Modal does not render when isOpen is false
  it('should not render modal when isOpen is false', () => {
    renderWithClient(
      <WorkItemModal
        isOpen={false}
        onClose={vi.fn()}
        serviceId="service-1"
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // Test 3: Create mode displays empty form
  it('should display empty form in create mode', () => {
    renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={vi.fn()}
        serviceId="service-1"
      />
    );

    const titleInput = screen.getByLabelText(/제목/i);
    expect(titleInput).toHaveValue('');
  });

  // Test 4: Edit mode pre-fills existing data
  it('should pre-fill form with existing data in edit mode', async () => {
    renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={vi.fn()}
        workItem={mockWorkItem}
        serviceId="service-1"
      />
    );

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/제목/i);
      expect(titleInput).toHaveValue('Test Work Item');
    });
  });

  // Test 5: Renders 4 tab navigation buttons
  it('should render 4 tab navigation buttons', () => {
    renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={vi.fn()}
        serviceId="service-1"
      />
    );

    expect(screen.getByRole('tab', { name: /기본정보/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /의사결정/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /AI 세션/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /활동로그/i })).toBeInTheDocument();
  });

  // Test 6: Basic info tab displays required fields
  it('should display basic info fields in first tab', () => {
    renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={vi.fn()}
        serviceId="service-1"
      />
    );

    expect(screen.getByLabelText(/제목/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/유형/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/우선순위/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/상태/i)).toBeInTheDocument();
  });

  // Test 7: Decision tab displays decision fields
  it('should display decision fields when decision tab is clicked', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={vi.fn()}
        serviceId="service-1"
      />
    );

    const decisionTab = screen.getByRole('tab', { name: /의사결정/i });
    await user.click(decisionTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/Problem/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/고려한 선택지/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/최종 결정 이유/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/결과/i)).toBeInTheDocument();
    });
  });

  // Test 8: Shows validation error when title is empty
  it('should show validation error when title is empty on submit', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={vi.fn()}
        serviceId="service-1"
      />
    );

    const saveButton = screen.getByRole('button', { name: /저장/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/제목을 입력해주세요/i)).toBeInTheDocument();
    });
  });

  // Test 9: Calls onClose when X button is clicked
  it('should call onClose when X button is clicked', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={onCloseMock}
        serviceId="service-1"
      />
    );

    const closeButton = screen.getByRole('button', { name: /닫기/i });
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  // Test 10: Create mode shows save button
  it('should show save button in create mode', () => {
    renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={vi.fn()}
        serviceId="service-1"
      />
    );

    expect(screen.getByRole('button', { name: /저장/i })).toBeInTheDocument();
  });

  // Test 11: AI Sessions tab only visible in edit mode
  it('should show AI Sessions tab only when workItem exists', () => {
    const { rerender } = renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={vi.fn()}
        serviceId="service-1"
      />
    );

    // In create mode, AI Sessions tab should be disabled or hidden
    const aiTab = screen.getByRole('tab', { name: /AI 세션/i });
    expect(aiTab).toHaveAttribute('aria-disabled', 'true');

    // Re-render with workItem (edit mode)
    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <WorkItemModal
          isOpen={true}
          onClose={vi.fn()}
          workItem={mockWorkItem}
          serviceId="service-1"
        />
      </QueryClientProvider>
    );

    const aiTabEdit = screen.getByRole('tab', { name: /AI 세션/i });
    expect(aiTabEdit).not.toHaveAttribute('aria-disabled', 'true');
  });

  // Test 12: Activity Log tab only visible in edit mode
  it('should show Activity Log tab only when workItem exists', () => {
    const { rerender } = renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={vi.fn()}
        serviceId="service-1"
      />
    );

    const activityTab = screen.getByRole('tab', { name: /활동로그/i });
    expect(activityTab).toHaveAttribute('aria-disabled', 'true');

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <WorkItemModal
          isOpen={true}
          onClose={vi.fn()}
          workItem={mockWorkItem}
          serviceId="service-1"
        />
      </QueryClientProvider>
    );

    const activityTabEdit = screen.getByRole('tab', { name: /활동로그/i });
    expect(activityTabEdit).not.toHaveAttribute('aria-disabled', 'true');
  });

  // Test 13: Delete button shown in edit mode
  it('should show delete button in edit mode', () => {
    renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={vi.fn()}
        workItem={mockWorkItem}
        serviceId="service-1"
      />
    );

    expect(screen.getByRole('button', { name: /삭제/i })).toBeInTheDocument();
  });

  // Test 14: Delete button not shown in create mode
  it('should not show delete button in create mode', () => {
    renderWithClient(
      <WorkItemModal
        isOpen={true}
        onClose={vi.fn()}
        serviceId="service-1"
      />
    );

    expect(screen.queryByRole('button', { name: /삭제/i })).not.toBeInTheDocument();
  });
});
