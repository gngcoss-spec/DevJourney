// @TASK P3-S2-T1 - Work Items List Page Test
// @SPEC docs/planning/TASKS.md#work-items-list-ui
// @TEST TDD RED phase - Test first

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import WorkItemsPage from '@/app/(dashboard)/services/[id]/work-items/page';
import * as useWorkItemsHook from '@/lib/hooks/use-work-items';
import type { WorkItem } from '@/types/database';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'service-1' })),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock supabase client (needed by WorkItemModal)
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

vi.mock('@/lib/hooks/use-team', () => ({
  useTeamMembers: vi.fn(() => ({ data: [], isLoading: false })),
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

// Mock work item data
const mockWorkItems: WorkItem[] = [
  {
    id: 'wi-1',
    service_id: 'service-1',
    user_id: 'user-1',
    title: 'Work Items 목록 UI 구현',
    description: '목록, 필터, 테이블 구현',
    type: 'feature',
    priority: 'high',
    status: 'in-progress',
    problem: null,
    options_considered: null,
    decision_reason: null,
    result: null,
    assignee_name: 'Claude',
    due_date: null,
    labels: [],
    assignee_id: null,
    story_points: null,
    parent_id: null,
    sort_order: 1,
    created_at: '2026-02-10T12:00:00Z',
    updated_at: '2026-02-10T12:00:00Z',
  },
  {
    id: 'wi-2',
    service_id: 'service-1',
    user_id: 'user-1',
    title: 'API 연동 버그 수정',
    description: null,
    type: 'bug',
    priority: 'urgent',
    status: 'review',
    problem: 'API 호출 시 에러 발생',
    options_considered: null,
    decision_reason: null,
    result: null,
    assignee_name: null,
    due_date: null,
    labels: [],
    assignee_id: null,
    story_points: null,
    parent_id: null,
    sort_order: 2,
    created_at: '2026-02-09T10:00:00Z',
    updated_at: '2026-02-09T10:00:00Z',
  },
  {
    id: 'wi-3',
    service_id: 'service-1',
    user_id: 'user-1',
    title: '코드 리팩토링',
    description: '컴포넌트 구조 개선',
    type: 'refactor',
    priority: 'medium',
    status: 'backlog',
    problem: null,
    options_considered: null,
    decision_reason: null,
    result: null,
    assignee_name: null,
    due_date: null,
    labels: [],
    assignee_id: null,
    story_points: null,
    parent_id: null,
    sort_order: 3,
    created_at: '2026-02-08T08:00:00Z',
    updated_at: '2026-02-08T08:00:00Z',
  },
  {
    id: 'wi-4',
    service_id: 'service-1',
    user_id: 'user-1',
    title: 'CI/CD 파이프라인 구축',
    description: 'GitHub Actions 설정',
    type: 'infra',
    priority: 'low',
    status: 'done',
    problem: null,
    options_considered: null,
    decision_reason: null,
    result: '배포 자동화 완료',
    assignee_name: 'DevOps',
    due_date: null,
    labels: [],
    assignee_id: null,
    story_points: null,
    parent_id: null,
    sort_order: 4,
    created_at: '2026-02-07T09:00:00Z',
    updated_at: '2026-02-11T14:00:00Z',
  },
  {
    id: 'wi-5',
    service_id: 'service-1',
    user_id: 'user-1',
    title: 'AI 프롬프트 최적화',
    description: 'Claude 프롬프트 개선',
    type: 'ai-prompt',
    priority: 'medium',
    status: 'ready',
    problem: null,
    options_considered: null,
    decision_reason: null,
    result: null,
    assignee_name: null,
    due_date: null,
    labels: [],
    assignee_id: null,
    story_points: null,
    parent_id: null,
    sort_order: 5,
    created_at: '2026-02-06T11:00:00Z',
    updated_at: '2026-02-06T11:00:00Z',
  },
];

describe('WorkItemsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때 로딩 표시', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('page-loading')).toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('에러 발생 시 에러 메시지 표시', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/오류가 발생했습니다/i)).toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('Work Item이 없을 때 빈 상태 메시지 표시', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/등록된 Work Item이 없습니다/i)).toBeInTheDocument();
    });

    it('빈 상태일 때 "새 Work Item" 버튼 표시', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      const newButton = screen.getByRole('button', { name: /새 Work Item/i });
      expect(newButton).toBeInTheDocument();
    });
  });

  describe('Work Items 목록 렌더링', () => {
    it('Work Items 테이블 렌더링', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      // 제목 확인
      expect(screen.getByText('Work Items 목록 UI 구현')).toBeInTheDocument();
      expect(screen.getByText('API 연동 버그 수정')).toBeInTheDocument();
      expect(screen.getByText('코드 리팩토링')).toBeInTheDocument();
      expect(screen.getByText('CI/CD 파이프라인 구축')).toBeInTheDocument();
      expect(screen.getByText('AI 프롬프트 최적화')).toBeInTheDocument();
    });

    it('헤더에 "새 Work Item" 버튼 표시', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      const newButton = screen.getByRole('button', { name: /새 Work Item/i });
      expect(newButton).toBeInTheDocument();
    });

    it('유형 뱃지 표시 (feature, bug, refactor, infra, ai-prompt)', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      // 유형 뱃지 확인 (aria-label로 검색)
      expect(screen.getByLabelText('유형: feature')).toBeInTheDocument();
      expect(screen.getByLabelText('유형: bug')).toBeInTheDocument();
      expect(screen.getByLabelText('유형: refactor')).toBeInTheDocument();
      expect(screen.getByLabelText('유형: infra')).toBeInTheDocument();
      expect(screen.getByLabelText('유형: ai-prompt')).toBeInTheDocument();
    });

    it('우선순위 뱃지 표시 (urgent, high, medium, low)', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      // 우선순위 뱃지 확인 (aria-label로 검색)
      expect(screen.getByLabelText('우선순위: urgent')).toBeInTheDocument();
      expect(screen.getByLabelText('우선순위: high')).toBeInTheDocument();
      expect(screen.getAllByLabelText(/우선순위: medium/)).toHaveLength(2); // 2개
      expect(screen.getByLabelText('우선순위: low')).toBeInTheDocument();
    });

    it('상태 뱃지 표시 (backlog, ready, in-progress, review, done)', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      // 상태 뱃지 확인 (aria-label로 검색)
      expect(screen.getByLabelText('상태: in-progress')).toBeInTheDocument();
      expect(screen.getByLabelText('상태: review')).toBeInTheDocument();
      expect(screen.getByLabelText('상태: backlog')).toBeInTheDocument();
      expect(screen.getByLabelText('상태: done')).toBeInTheDocument();
      expect(screen.getByLabelText('상태: ready')).toBeInTheDocument();
    });
  });

  describe('필터 기능', () => {
    it('상태 필터 select 존재', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      // 상태 필터 label 확인
      expect(screen.getByText(/상태:/i)).toBeInTheDocument();
    });

    it('유형 필터 select 존재', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      // 유형 필터 label 확인
      expect(screen.getByText(/유형:/i)).toBeInTheDocument();
    });

    it('우선순위 필터 select 존재', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      // 우선순위 필터 label 확인
      expect(screen.getByText(/우선순위:/i)).toBeInTheDocument();
    });

    it('상태 필터링 동작 (backlog만 표시)', async () => {
      const user = userEvent.setup();
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      // 상태 필터에서 "backlog" 선택 (id로 검색)
      const statusFilter = document.getElementById('status-filter') as HTMLSelectElement;
      await user.selectOptions(statusFilter, 'backlog');

      await waitFor(() => {
        // backlog 항목만 표시
        expect(screen.getByText('코드 리팩토링')).toBeInTheDocument();
        // 다른 상태는 표시 안 됨
        expect(screen.queryByText('Work Items 목록 UI 구현')).not.toBeInTheDocument();
        expect(screen.queryByText('API 연동 버그 수정')).not.toBeInTheDocument();
      });
    });

    it('유형 필터링 동작 (bug만 표시)', async () => {
      const user = userEvent.setup();
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      // 유형 필터에서 "bug" 선택 (id로 검색)
      const typeFilter = document.getElementById('type-filter') as HTMLSelectElement;
      await user.selectOptions(typeFilter, 'bug');

      await waitFor(() => {
        // bug 항목만 표시
        expect(screen.getByText('API 연동 버그 수정')).toBeInTheDocument();
        // 다른 유형은 표시 안 됨
        expect(screen.queryByText('Work Items 목록 UI 구현')).not.toBeInTheDocument();
        expect(screen.queryByText('코드 리팩토링')).not.toBeInTheDocument();
      });
    });

    it('우선순위 필터링 동작 (urgent만 표시)', async () => {
      const user = userEvent.setup();
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      // 우선순위 필터에서 "urgent" 선택 (id로 검색)
      const priorityFilter = document.getElementById('priority-filter') as HTMLSelectElement;
      await user.selectOptions(priorityFilter, 'urgent');

      await waitFor(() => {
        // urgent 항목만 표시
        expect(screen.getByText('API 연동 버그 수정')).toBeInTheDocument();
        // 다른 우선순위는 표시 안 됨
        expect(screen.queryByText('Work Items 목록 UI 구현')).not.toBeInTheDocument();
        expect(screen.queryByText('코드 리팩토링')).not.toBeInTheDocument();
      });
    });
  });

  describe('뱃지 색상', () => {
    it('유형별 뱃지 색상 확인 (feature: blue)', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      const featureBadge = screen.getByLabelText('유형: feature');
      expect(featureBadge.className).toMatch(/blue/i);
    });

    it('유형별 뱃지 색상 확인 (bug: red)', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      const bugBadge = screen.getByLabelText('유형: bug');
      expect(bugBadge.className).toMatch(/red/i);
    });

    it('유형별 뱃지 색상 확인 (refactor: green)', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      const refactorBadge = screen.getByLabelText('유형: refactor');
      expect(refactorBadge.className).toMatch(/green/i);
    });

    it('우선순위별 뱃지 색상 확인 (urgent: red)', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      const urgentBadge = screen.getByLabelText('우선순위: urgent');
      expect(urgentBadge.className).toMatch(/red/i);
    });

    it('상태별 뱃지 색상 확인 (done: green)', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      const doneBadge = screen.getByLabelText('상태: done');
      expect(doneBadge.className).toMatch(/green/i);
    });
  });

  describe('행 클릭 이벤트', () => {
    it('행 클릭 시 onRowClick 호출되지 않음 (P3-S3-T1에서 구현 예정)', () => {
      vi.spyOn(useWorkItemsHook, 'useWorkItems').mockReturnValue({
        data: mockWorkItems,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(<WorkItemsPage />, { wrapper: createWrapper() });

      // 행 존재 확인만 수행 (클릭 이벤트는 P3-S3-T1에서 구현)
      const firstRow = screen.getByText('Work Items 목록 UI 구현').closest('tr');
      expect(firstRow).toBeInTheDocument();
    });
  });
});
