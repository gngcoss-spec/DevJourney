import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { TeamMember } from '@/types/database';

vi.mock('@/lib/hooks/use-team', () => ({
  useTeamMembers: vi.fn(),
  useCreateTeamMember: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateTeamMember: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteTeamMember: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

import TeamPage from '@/app/(dashboard)/team/page';
import { useTeamMembers, useDeleteTeamMember } from '@/lib/hooks/use-team';

const mockUseTeamMembers = vi.mocked(useTeamMembers);
const mockUseDeleteTeamMember = vi.mocked(useDeleteTeamMember);

const mockMembers: TeamMember[] = [
  {
    id: 'tm-1',
    user_id: 'user-1',
    invited_by: 'user-1',
    display_name: 'Alice Kim',
    email: 'alice@example.com',
    role: 'owner',
    status: 'active',
    joined_at: '2026-02-01T00:00:00Z',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'tm-2',
    user_id: 'user-1',
    invited_by: 'user-1',
    display_name: 'Bob Lee',
    email: 'bob@example.com',
    role: 'contributor',
    status: 'active',
    joined_at: '2026-02-05T00:00:00Z',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-05T00:00:00Z',
  },
  {
    id: 'tm-3',
    user_id: 'user-1',
    invited_by: 'user-1',
    display_name: 'Charlie Park',
    email: null,
    role: 'viewer',
    status: 'invited',
    joined_at: null,
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-02-10T00:00:00Z',
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

describe('TeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeleteTeamMember.mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
  });

  it('should show loading state', () => {
    mockUseTeamMembers.mockReturnValue({
      data: undefined, isLoading: true, isError: false, error: null,
    } as any);

    renderWithQuery(<TeamPage />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseTeamMembers.mockReturnValue({
      data: undefined, isLoading: false, isError: true, error: new Error('fail'),
    } as any);

    renderWithQuery(<TeamPage />);
    expect(screen.getByText(/에러가 발생했습니다/i)).toBeInTheDocument();
  });

  it('should show empty state', () => {
    mockUseTeamMembers.mockReturnValue({
      data: [], isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<TeamPage />);
    expect(screen.getByText(/아직 팀 멤버가 없습니다/i)).toBeInTheDocument();
  });

  it('should render team member cards', () => {
    mockUseTeamMembers.mockReturnValue({
      data: mockMembers, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<TeamPage />);
    expect(screen.getByText('Alice Kim')).toBeInTheDocument();
    expect(screen.getByText('Bob Lee')).toBeInTheDocument();
    expect(screen.getByText('Charlie Park')).toBeInTheDocument();
  });

  it('should show role badges', () => {
    mockUseTeamMembers.mockReturnValue({
      data: mockMembers, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<TeamPage />);
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Contributor')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('should show status badges', () => {
    mockUseTeamMembers.mockReturnValue({
      data: mockMembers, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<TeamPage />);
    expect(screen.getAllByText('Active').length).toBe(2);
    expect(screen.getByText('Invited')).toBeInTheDocument();
  });

  it('should show email addresses', () => {
    mockUseTeamMembers.mockReturnValue({
      data: mockMembers, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<TeamPage />);
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('should show "멤버 초대" button', () => {
    mockUseTeamMembers.mockReturnValue({
      data: mockMembers, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<TeamPage />);
    expect(screen.getByRole('button', { name: /멤버 초대/i })).toBeInTheDocument();
  });

  it('should show title "팀 관리"', () => {
    mockUseTeamMembers.mockReturnValue({
      data: mockMembers, isLoading: false, isError: false, error: null,
    } as any);

    renderWithQuery(<TeamPage />);
    expect(screen.getByText('팀 관리')).toBeInTheDocument();
  });
});
