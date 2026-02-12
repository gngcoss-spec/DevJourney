import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'service-1' })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('@/lib/hooks/use-services', () => ({
  useService: vi.fn(),
  useUpdateService: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteService: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

import ServiceSettingsPage from '@/app/(dashboard)/services/[id]/settings/page';
import { useService } from '@/lib/hooks/use-services';

const mockUseService = vi.mocked(useService);

const mockService = {
  id: 'service-1',
  user_id: 'user-1',
  name: 'Test Service',
  description: 'Description',
  goal: 'MVP',
  target_users: 'Devs',
  current_stage: 'development' as const,
  current_server: null,
  tech_stack: ['frontend:React'],
  ai_role: null,
  status: 'active' as const,
  progress: 50,
  next_action: null,
  last_activity_at: '2026-02-12T00:00:00Z',
  created_at: '2026-02-01T00:00:00Z',
  updated_at: '2026-02-12T00:00:00Z',
};

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('ServiceSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state', () => {
    mockUseService.mockReturnValue({
      data: undefined, isLoading: true, error: null,
    } as any);

    renderWithQuery(<ServiceSettingsPage />);
    expect(screen.getByTestId('page-loading')).toBeInTheDocument();
  });

  it('should show not found state', () => {
    mockUseService.mockReturnValue({
      data: null, isLoading: false, error: null,
    } as any);

    renderWithQuery(<ServiceSettingsPage />);
    expect(screen.getByTestId('page-error')).toBeInTheDocument();
    expect(screen.getByText(/서비스를 찾을 수 없습니다/i)).toBeInTheDocument();
  });

  it('should render settings page title', () => {
    mockUseService.mockReturnValue({
      data: mockService, isLoading: false, error: null,
    } as any);

    renderWithQuery(<ServiceSettingsPage />);
    expect(screen.getByText('서비스 설정')).toBeInTheDocument();
  });

  it('should show danger zone with delete button', () => {
    mockUseService.mockReturnValue({
      data: mockService, isLoading: false, error: null,
    } as any);

    renderWithQuery(<ServiceSettingsPage />);
    expect(screen.getByText('위험 영역')).toBeInTheDocument();
    expect(screen.getByText('서비스 삭제')).toBeInTheDocument();
  });

  it('should show service form for editing', () => {
    mockUseService.mockReturnValue({
      data: mockService, isLoading: false, error: null,
    } as any);

    renderWithQuery(<ServiceSettingsPage />);
    // The form should contain the service name input
    const nameInput = screen.getByDisplayValue('Test Service');
    expect(nameInput).toBeInTheDocument();
  });
});
