import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SearchDialog } from '@/components/global-search/search-dialog';

// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock search store
const mockClose = vi.fn();
const mockOpen = vi.fn();
let mockIsOpen = false;

vi.mock('@/stores/search-store', () => ({
  useSearchStore: () => ({
    isOpen: mockIsOpen,
    close: mockClose,
    open: mockOpen,
  }),
}));

// Mock global search hook
const mockSetInputValue = vi.fn();
const mockReset = vi.fn();
let mockHookState = {
  inputValue: '',
  results: null as any,
  isLoading: false,
};

vi.mock('@/lib/hooks/use-global-search', () => ({
  useGlobalSearch: () => ({
    ...mockHookState,
    setInputValue: mockSetInputValue,
    reset: mockReset,
  }),
}));

describe('SearchDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOpen = false;
    mockHookState = {
      inputValue: '',
      results: null,
      isLoading: false,
    };
  });

  it('should not render content when closed', () => {
    mockIsOpen = false;
    render(<SearchDialog />);

    expect(screen.queryByPlaceholderText('검색어를 입력하세요...')).not.toBeInTheDocument();
  });

  it('should render input when open', () => {
    mockIsOpen = true;
    render(<SearchDialog />);

    expect(screen.getByPlaceholderText('검색어를 입력하세요...')).toBeInTheDocument();
  });

  it('should display result groups when results exist', () => {
    mockIsOpen = true;
    mockHookState = {
      inputValue: 'test',
      results: {
        services: [{ id: 'svc-1', type: 'service', title: 'Test Service', description: 'desc', service_id: 'svc-1', created_at: '2026-01-01' }],
        workItems: [{ id: 'wi-1', type: 'work_item', title: 'Test Task', description: null, service_id: 'svc-1', created_at: '2026-01-01' }],
        decisions: [],
        devLogs: [],
        documents: [],
        total: 2,
      },
      isLoading: false,
    };

    render(<SearchDialog />);

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Work Items')).toBeInTheDocument();
    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should show empty state message when no results found', () => {
    mockIsOpen = true;
    mockHookState = {
      inputValue: 'xyz',
      results: {
        services: [],
        workItems: [],
        decisions: [],
        devLogs: [],
        documents: [],
        total: 0,
      },
      isLoading: false,
    };

    render(<SearchDialog />);

    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
  });

  it('should navigate when a result is clicked', () => {
    mockIsOpen = true;
    mockHookState = {
      inputValue: 'test',
      results: {
        services: [{ id: 'svc-1', type: 'service', title: 'My Service', description: null, service_id: 'svc-1', created_at: '2026-01-01' }],
        workItems: [],
        decisions: [],
        devLogs: [],
        documents: [],
        total: 1,
      },
      isLoading: false,
    };

    render(<SearchDialog />);

    fireEvent.click(screen.getByText('My Service'));

    expect(mockClose).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/services/svc-1');
  });
});
