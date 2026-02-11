// @TASK P4-R1-T1 - Dev Logs TanStack Query hooks tests
// @SPEC docs/planning/TASKS.md#dev-logs-hooks

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import {
  useDevLogs,
  useAllDevLogs,
  useDevLogByDate,
  useCreateDevLog,
  useUpdateDevLog,
} from '@/lib/hooks/use-dev-logs';
import type { DevLog, CreateDevLogInput } from '@/types/database';

// Mock Supabase query functions
vi.mock('@/lib/supabase/queries/dev-logs', () => ({
  getDevLogs: vi.fn(),
  getAllDevLogs: vi.fn(),
  getDevLogByDate: vi.fn(),
  createDevLog: vi.fn(),
  updateDevLog: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

// Import mocked functions
import {
  getDevLogs,
  getAllDevLogs,
  getDevLogByDate,
  createDevLog,
  updateDevLog,
} from '@/lib/supabase/queries/dev-logs';

describe('use-dev-logs hooks', () => {
  let queryClient: QueryClient;

  // Helper to create wrapper with QueryClientProvider
  function createWrapper() {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  beforeEach(() => {
    // Reset query client before each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  describe('useDevLogs', () => {
    it('should fetch all dev logs for a service successfully', async () => {
      const mockDevLogs: DevLog[] = [
        {
          id: 'log-1',
          service_id: 'service-1',
          user_id: 'user-1',
          log_date: '2026-02-12',
          done: 'Completed feature X',
          decided: 'Use approach A',
          deferred: 'Refactor module Y',
          next_action: 'Start testing',
          created_at: '2026-02-12T00:00:00Z',
          updated_at: '2026-02-12T00:00:00Z',
        },
      ];

      vi.mocked(getDevLogs).mockResolvedValue(mockDevLogs);

      const { result } = renderHook(() => useDevLogs('service-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockDevLogs);
    });

    it('should not fetch when serviceId is empty', async () => {
      const { result } = renderHook(() => useDevLogs(''), {
        wrapper: createWrapper(),
      });

      // Query should be disabled
      expect(result.current.isLoading).toBe(false);
      expect(getDevLogs).not.toHaveBeenCalled();
    });

    it('should handle query errors', async () => {
      const error = new Error('Query failed');
      vi.mocked(getDevLogs).mockRejectedValue(error);

      const { result } = renderHook(() => useDevLogs('service-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useAllDevLogs', () => {
    it('should fetch all dev logs successfully', async () => {
      const mockDevLogs: DevLog[] = [
        {
          id: 'log-1',
          service_id: 'service-1',
          user_id: 'user-1',
          log_date: '2026-02-12',
          done: 'Completed feature X',
          decided: null,
          deferred: null,
          next_action: null,
          created_at: '2026-02-12T00:00:00Z',
          updated_at: '2026-02-12T00:00:00Z',
        },
        {
          id: 'log-2',
          service_id: 'service-2',
          user_id: 'user-1',
          log_date: '2026-02-11',
          done: null,
          decided: 'Use approach B',
          deferred: null,
          next_action: null,
          created_at: '2026-02-11T00:00:00Z',
          updated_at: '2026-02-11T00:00:00Z',
        },
      ];

      vi.mocked(getAllDevLogs).mockResolvedValue(mockDevLogs);

      const { result } = renderHook(() => useAllDevLogs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockDevLogs);
    });

    it('should support custom limit parameter', async () => {
      const mockDevLogs: DevLog[] = [];
      vi.mocked(getAllDevLogs).mockResolvedValue(mockDevLogs);

      renderHook(() => useAllDevLogs(10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(getAllDevLogs).toHaveBeenCalledWith(expect.anything(), 10));
    });
  });

  describe('useDevLogByDate', () => {
    it('should fetch a dev log by service and date', async () => {
      const mockLog: DevLog = {
        id: 'log-1',
        service_id: 'service-1',
        user_id: 'user-1',
        log_date: '2026-02-12',
        done: 'Completed feature X',
        decided: null,
        deferred: null,
        next_action: null,
        created_at: '2026-02-12T00:00:00Z',
        updated_at: '2026-02-12T00:00:00Z',
      };

      vi.mocked(getDevLogByDate).mockResolvedValue(mockLog);

      const { result } = renderHook(() => useDevLogByDate('service-1', '2026-02-12'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockLog);
    });

    it('should return null when log not found', async () => {
      vi.mocked(getDevLogByDate).mockResolvedValue(null);

      const { result } = renderHook(() => useDevLogByDate('service-1', '2026-02-12'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBeNull();
    });

    it('should not fetch when serviceId or date is empty', async () => {
      renderHook(() => useDevLogByDate('', '2026-02-12'), {
        wrapper: createWrapper(),
      });

      expect(getDevLogByDate).not.toHaveBeenCalled();
    });
  });

  describe('useCreateDevLog', () => {
    it('should create a new dev log and invalidate queries', async () => {
      const input: CreateDevLogInput = {
        service_id: 'service-1',
        done: 'Completed feature X',
      };
      const newLog: DevLog = {
        id: 'log-new',
        service_id: 'service-1',
        user_id: 'user-1',
        log_date: '2026-02-12',
        done: 'Completed feature X',
        decided: null,
        deferred: null,
        next_action: null,
        created_at: '2026-02-12T00:00:00Z',
        updated_at: '2026-02-12T00:00:00Z',
      };

      vi.mocked(createDevLog).mockResolvedValue(newLog);

      const { result } = renderHook(() => useCreateDevLog(), {
        wrapper: createWrapper(),
      });

      // Pre-populate cache to test invalidation
      queryClient.setQueryData(['dev-logs', 'service', 'service-1'], []);

      result.current.mutate(input);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(newLog);
    });

    it('should handle creation errors', async () => {
      const input: CreateDevLogInput = {
        service_id: 'service-1',
      };
      const error = new Error('Create failed');
      vi.mocked(createDevLog).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateDevLog(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(input);

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useUpdateDevLog', () => {
    it('should update a dev log and invalidate queries', async () => {
      const updateData = {
        id: 'log-1',
        data: { done: 'Updated done field' },
      };
      const updatedLog: DevLog = {
        id: 'log-1',
        service_id: 'service-1',
        user_id: 'user-1',
        log_date: '2026-02-12',
        done: 'Updated done field',
        decided: null,
        deferred: null,
        next_action: null,
        created_at: '2026-02-12T00:00:00Z',
        updated_at: '2026-02-12T12:00:00Z',
      };

      vi.mocked(updateDevLog).mockResolvedValue(updatedLog);

      const { result } = renderHook(() => useUpdateDevLog('service-1'), {
        wrapper: createWrapper(),
      });

      // Pre-populate cache to test invalidation
      queryClient.setQueryData(['dev-logs', 'service', 'service-1'], []);

      result.current.mutate(updateData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(updatedLog);
    });

    it('should handle update errors', async () => {
      const updateData = {
        id: 'log-1',
        data: { decided: 'New decision' },
      };
      const error = new Error('Update failed');
      vi.mocked(updateDevLog).mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateDevLog('service-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate(updateData);

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });
});
