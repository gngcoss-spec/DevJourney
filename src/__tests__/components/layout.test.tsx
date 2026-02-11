// @TASK P1-S0-T1 - 사이드바 + 인증 레이아웃 테스트
// @SPEC docs/planning/tdd/p1-s0-t1.md

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarNavigation from '@/components/layout/sidebar-navigation';
import { useSidebarStore } from '@/stores/sidebar-store';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
  })),
}));

describe('SidebarNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Dashboard와 Services 메뉴가 렌더링된다', () => {
    render(<SidebarNavigation />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
  });

  it('로그아웃 버튼이 존재한다', () => {
    render(<SidebarNavigation />);

    expect(screen.getByText(/logout|로그아웃/i)).toBeInTheDocument();
  });

  it('현재 경로에 따라 활성 메뉴가 하이라이트된다', async () => {
    const { usePathname } = await import('next/navigation');
    vi.mocked(usePathname).mockReturnValue('/');

    render(<SidebarNavigation />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-blue-500');
  });

  it('모바일에서 토글 버튼이 동작한다', () => {
    render(<SidebarNavigation />);

    const store = useSidebarStore.getState();
    const initialState = store.isOpen;

    // 토글 호출
    store.toggle();

    expect(useSidebarStore.getState().isOpen).toBe(!initialState);
  });
});
