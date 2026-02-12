import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Server } from '@/types/database';

vi.mock('@/lib/hooks/use-servers', () => ({
  useServers: vi.fn(),
  useCreateServer: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateServer: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteServer: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'srv-1' })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

import ServersPage from '@/app/(dashboard)/servers/page';
import { useServers } from '@/lib/hooks/use-servers';

const mockUseServers = vi.mocked(useServers);

const mockServers: Server[] = [
  {
    id: 'srv-1',
    user_id: 'user-1',
    name: 'Production Server',
    ip: '192.168.1.100',
    description: 'Main production server',
    purpose: 'Web hosting',
    status: 'active',
    risk_level: 'low',
    last_activity_at: '2026-02-12T00:00:00Z',
    created_at: '2026-02-12T00:00:00Z',
    updated_at: '2026-02-12T00:00:00Z',
  },
  {
    id: 'srv-2',
    user_id: 'user-1',
    name: 'Staging Server',
    ip: '192.168.1.101',
    description: null,
    purpose: 'Testing',
    status: 'maintenance',
    risk_level: 'medium',
    last_activity_at: '2026-02-11T00:00:00Z',
    created_at: '2026-02-11T00:00:00Z',
    updated_at: '2026-02-11T00:00:00Z',
  },
  {
    id: 'srv-3',
    user_id: 'user-1',
    name: 'Legacy Server',
    ip: null,
    description: 'Old server',
    purpose: null,
    status: 'offline',
    risk_level: 'high',
    last_activity_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
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

describe('ServersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state', () => {
    mockUseServers.mockReturnValue({
      data: undefined, isLoading: true, isError: false, error: null,
    } as any);

    renderWithQuery(<ServersPage />);
    expect(screen.getByTestId('page-loading')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseServers.mockReturnValue({
      data: undefined, isLoading: false, isError: true, error: new Error('fail'),
    } as any);

    renderWithQuery(<ServersPage />);
    expect(screen.getByText(/에러가 발생했습니다/i)).toBeInTheDocument();
  });

  it('should show empty state', () => {
    mockUseServers.mockReturnValue({
      data: [], isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<ServersPage />);
    expect(screen.getByText(/등록된 서버가 없습니다/i)).toBeInTheDocument();
  });

  it('should render server cards', () => {
    mockUseServers.mockReturnValue({
      data: mockServers, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<ServersPage />);
    expect(screen.getByText('Production Server')).toBeInTheDocument();
    expect(screen.getByText('Staging Server')).toBeInTheDocument();
    expect(screen.getByText('Legacy Server')).toBeInTheDocument();
  });

  it('should show status badges', () => {
    mockUseServers.mockReturnValue({
      data: mockServers, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<ServersPage />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should show IP addresses', () => {
    mockUseServers.mockReturnValue({
      data: mockServers, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<ServersPage />);
    expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.101')).toBeInTheDocument();
  });

  it('should show risk level badges', () => {
    mockUseServers.mockReturnValue({
      data: mockServers, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<ServersPage />);
    expect(screen.getByText('Risk: low')).toBeInTheDocument();
    expect(screen.getByText('Risk: medium')).toBeInTheDocument();
    expect(screen.getByText('Risk: high')).toBeInTheDocument();
  });

  it('should show "새 서버" button', () => {
    mockUseServers.mockReturnValue({
      data: mockServers, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<ServersPage />);
    expect(screen.getByRole('button', { name: /새 서버/i })).toBeInTheDocument();
  });

  it('should show title "서버 관리"', () => {
    mockUseServers.mockReturnValue({
      data: mockServers, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<ServersPage />);
    expect(screen.getByText('서버 관리')).toBeInTheDocument();
  });
});
