import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Stage } from '@/types/database';

vi.mock('@/lib/hooks/use-stages', () => ({
  useStages: vi.fn(),
  useCreateStage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateStage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteStage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock('@/lib/hooks/use-services', () => ({
  useService: vi.fn(() => ({
    data: { current_stage: 'development' },
    isLoading: false,
  })),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'service-1' })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

import RoadmapPage from '@/app/(dashboard)/services/[id]/roadmap/page';
import { useStages } from '@/lib/hooks/use-stages';

const mockUseStages = vi.mocked(useStages);

const mockStages: Stage[] = [
  {
    id: 'stage-1',
    service_id: 'service-1',
    user_id: 'user-1',
    stage_name: 'idea',
    start_date: '2026-01-01',
    end_date: '2026-01-05',
    summary: 'Initial idea brainstorming',
    deliverables: ['PRD Draft'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-05T00:00:00Z',
  },
  {
    id: 'stage-2',
    service_id: 'service-1',
    user_id: 'user-1',
    stage_name: 'planning',
    start_date: '2026-01-06',
    end_date: '2026-01-15',
    summary: 'Detailed planning phase',
    deliverables: ['TRD', 'API Spec'],
    created_at: '2026-01-06T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
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

describe('RoadmapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state', () => {
    mockUseStages.mockReturnValue({
      data: undefined, isLoading: true, isError: false, error: null,
    } as any);

    renderWithQuery(<RoadmapPage />);
    expect(screen.getByTestId('page-loading')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseStages.mockReturnValue({
      data: undefined, isLoading: false, isError: true, error: new Error('fail'),
    } as any);

    renderWithQuery(<RoadmapPage />);
    expect(screen.getByTestId('page-error')).toBeInTheDocument();
    expect(screen.getByText(/로드맵을 불러올 수 없습니다/i)).toBeInTheDocument();
  });

  it('should render all 7 stage cards', () => {
    mockUseStages.mockReturnValue({
      data: mockStages, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<RoadmapPage />);
    expect(screen.getAllByText('Idea').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Planning').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Design').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Development').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Testing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Launch').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Enhancement').length).toBeGreaterThan(0);
  });

  it('should show stage summary for existing stages', () => {
    mockUseStages.mockReturnValue({
      data: mockStages, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<RoadmapPage />);
    expect(screen.getAllByText('Initial idea brainstorming').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Detailed planning phase').length).toBeGreaterThan(0);
  });

  it('should show deliverables badges', () => {
    mockUseStages.mockReturnValue({
      data: mockStages, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<RoadmapPage />);
    expect(screen.getAllByText('PRD Draft').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TRD').length).toBeGreaterThan(0);
  });

  it('should show title "로드맵"', () => {
    mockUseStages.mockReturnValue({
      data: mockStages, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<RoadmapPage />);
    expect(screen.getByText('로드맵')).toBeInTheDocument();
  });

  it('should indicate current stage', () => {
    mockUseStages.mockReturnValue({
      data: mockStages, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<RoadmapPage />);
    // Current stage (development) should show "진행 중" badge
    expect(screen.getAllByText('진행 중').length).toBeGreaterThan(0);
    // Completed stages should show "완료" badge
    expect(screen.getAllByText('완료').length).toBeGreaterThan(0);
  });
});
