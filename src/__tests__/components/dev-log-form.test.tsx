// @TASK P4-S2-T1 - Dev Log Form UI Component Tests
// @SPEC CLAUDE.md + inline requirements
// @TEST src/__tests__/components/dev-log-form.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DevLogForm } from '@/components/dev-log/dev-log-form';
import type { DevLog } from '@/types/database';

// Mock hooks
const mockCreateMutate = vi.fn();
const mockUpdateMutate = vi.fn();

vi.mock('@/lib/hooks/use-dev-logs', () => ({
  useCreateDevLog: vi.fn(() => ({ mutate: mockCreateMutate, isPending: false })),
  useUpdateDevLog: vi.fn(() => ({ mutate: mockUpdateMutate, isPending: false })),
  useDevLogByDate: vi.fn(() => ({ data: null, isLoading: false })),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

describe('DevLogForm', () => {
  let queryClient: QueryClient;
  const mockOnClose = vi.fn();
  const defaultProps = {
    serviceId: 'service-123',
    onClose: mockOnClose,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderForm = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DevLogForm {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  it('renders form with date field and default value (today)', () => {
    renderForm();
    const dateInput = screen.getByLabelText(/날짜/i) as HTMLInputElement;
    expect(dateInput).toBeInTheDocument();
    expect(dateInput.type).toBe('date');
    // Check if default value is today's date (YYYY-MM-DD format)
    const today = new Date().toISOString().split('T')[0];
    expect(dateInput.value).toBe(today);
  });

  it('renders 4 textareas with correct labels', () => {
    renderForm();
    expect(screen.getByLabelText('오늘 한 것')).toBeInTheDocument();
    expect(screen.getByLabelText('확정한 것')).toBeInTheDocument();
    expect(screen.getByLabelText('보류한 것')).toBeInTheDocument();
    expect(screen.getByLabelText('다음에 할 것')).toBeInTheDocument();
  });

  it('shows validation error when all fields are empty', async () => {
    renderForm();
    const user = userEvent.setup();
    const saveButton = screen.getByRole('button', { name: /저장/i });

    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/최소 1개 항목을 입력해주세요/i)).toBeInTheDocument();
    });

    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it('calls createDevLog on valid submit with at least one field filled', async () => {
    renderForm();
    const user = userEvent.setup();

    const doneTextarea = screen.getByLabelText('오늘 한 것');
    await user.type(doneTextarea, 'Implemented login feature');

    const saveButton = screen.getByRole('button', { name: /저장/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledTimes(1);
    });

    const callArgs = mockCreateMutate.mock.calls[0][0];
    expect(callArgs).toMatchObject({
      service_id: 'service-123',
      done: 'Implemented login feature',
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    renderForm();
    const user = userEvent.setup();

    const cancelButton = screen.getByRole('button', { name: /취소/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('pre-fills form fields when existingLog is provided', () => {
    const existingLog: DevLog = {
      id: 'log-1',
      service_id: 'service-123',
      user_id: 'user-1',
      log_date: '2026-02-10',
      done: 'Fixed bugs',
      decided: 'Use Next.js',
      deferred: 'Analytics integration',
      next_action: 'Deploy to production',
      created_at: '2026-02-10T10:00:00Z',
      updated_at: '2026-02-10T10:00:00Z',
    };

    renderForm({ existingLog });

    const dateInput = screen.getByLabelText(/날짜/i) as HTMLInputElement;
    expect(dateInput.value).toBe('2026-02-10');

    expect(screen.getByLabelText('오늘 한 것')).toHaveValue('Fixed bugs');
    expect(screen.getByLabelText('확정한 것')).toHaveValue('Use Next.js');
    expect(screen.getByLabelText('보류한 것')).toHaveValue('Analytics integration');
    expect(screen.getByLabelText('다음에 할 것')).toHaveValue('Deploy to production');
  });

  it('calls updateDevLog when editing existing log', async () => {
    const existingLog: DevLog = {
      id: 'log-1',
      service_id: 'service-123',
      user_id: 'user-1',
      log_date: '2026-02-10',
      done: 'Fixed bugs',
      decided: null,
      deferred: null,
      next_action: null,
      created_at: '2026-02-10T10:00:00Z',
      updated_at: '2026-02-10T10:00:00Z',
    };

    renderForm({ existingLog });
    const user = userEvent.setup();

    const decidedTextarea = screen.getByLabelText('확정한 것');
    await user.type(decidedTextarea, 'Switched to Supabase');

    const saveButton = screen.getByRole('button', { name: /수정/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledTimes(1);
    });

    const callArgs = mockUpdateMutate.mock.calls[0][0];
    expect(callArgs).toMatchObject({
      id: 'log-1',
      data: {
        done: 'Fixed bugs',
        decided: 'Switched to Supabase',
        deferred: '',
        next_action: '',
      },
    });
  });

  it('displays correct button label: "저장" for create, "수정" for edit', () => {
    const { rerender } = renderForm();
    expect(screen.getByRole('button', { name: /저장/i })).toBeInTheDocument();

    const existingLog: DevLog = {
      id: 'log-1',
      service_id: 'service-123',
      user_id: 'user-1',
      log_date: '2026-02-10',
      done: 'Test',
      decided: null,
      deferred: null,
      next_action: null,
      created_at: '2026-02-10T10:00:00Z',
      updated_at: '2026-02-10T10:00:00Z',
    };

    rerender(
      <QueryClientProvider client={queryClient}>
        <DevLogForm {...defaultProps} existingLog={existingLog} />
      </QueryClientProvider>
    );

    expect(screen.getByRole('button', { name: /수정/i })).toBeInTheDocument();
  });

  it('button is enabled by default (isPending false)', () => {
    renderForm();
    const saveButton = screen.getByRole('button', { name: /저장/i });
    expect(saveButton).not.toBeDisabled();
  });

  it('allows submission with multiple fields filled', async () => {
    renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('오늘 한 것'), 'Task A');
    await user.type(screen.getByLabelText('확정한 것'), 'Decision B');
    await user.type(screen.getByLabelText('다음에 할 것'), 'Action C');

    const saveButton = screen.getByRole('button', { name: /저장/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledTimes(1);
    });

    const callArgs = mockCreateMutate.mock.calls[0][0];
    expect(callArgs.done).toBe('Task A');
    expect(callArgs.decided).toBe('Decision B');
    expect(callArgs.next_action).toBe('Action C');
  });
});
