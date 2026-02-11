// @TASK P2-R1-T3 - Services TanStack Query hooks tests
// @SPEC docs/planning/TASKS.md#services-hooks
// @TEST src/__tests__/hooks/use-services.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import {
  useServices,
  useService,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '@/lib/hooks/use-services';
import type { Service } from '@/types/database';

// Mock Supabase query functions
vi.mock('@/lib/supabase/queries/services', () => ({
  getServices: vi.fn(),
  getServiceById: vi.fn(),
  createService: vi.fn(),
  updateService: vi.fn(),
  deleteService: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}));

// Import mocked functions
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '@/lib/supabase/queries/services';

describe('use-services hooks', () => {
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

  describe('useServices', () => {
    it('should fetch all services successfully', async () => {
      const mockServices: Service[] = [
        {
          id: '1',
          user_id: 'user-1',
          name: 'Service A',
          description: 'Description A',
          goal: 'Goal A',
          target_users: 'Users A',
          current_stage: 'development',
          current_server: 'server-a',
          tech_stack: ['React', 'Node.js'],
          ai_role: 'Assistant',
          status: 'active',
          progress: 50,
          next_action: 'Implement feature X',
          last_activity_at: '2026-02-11T00:00:00Z',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-02-11T00:00:00Z',
        },
        {
          id: '2',
          user_id: 'user-1',
          name: 'Service B',
          description: null,
          goal: null,
          target_users: null,
          current_stage: 'idea',
          current_server: null,
          tech_stack: [],
          ai_role: null,
          status: 'active',
          progress: 10,
          next_action: null,
          last_activity_at: '2026-02-10T00:00:00Z',
          created_at: '2026-02-10T00:00:00Z',
          updated_at: '2026-02-10T00:00:00Z',
        },
      ];

      vi.mocked(getServices).mockResolvedValueOnce(mockServices);

      const { result } = renderHook(() => useServices(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockServices);
      expect(getServices).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch error', async () => {
      vi.mocked(getServices).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useServices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Network error'));
    });
  });

  describe('useService', () => {
    it('should fetch single service by id successfully', async () => {
      const mockService: Service = {
        id: '1',
        user_id: 'user-1',
        name: 'Service A',
        description: 'Description A',
        goal: 'Goal A',
        target_users: 'Users A',
        current_stage: 'development',
        current_server: 'server-a',
        tech_stack: ['React', 'Node.js'],
        ai_role: 'Assistant',
        status: 'active',
        progress: 50,
        next_action: 'Implement feature X',
        last_activity_at: '2026-02-11T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-02-11T00:00:00Z',
      };

      vi.mocked(getServiceById).mockResolvedValueOnce(mockService);

      const { result } = renderHook(() => useService('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockService);
      expect(getServiceById).toHaveBeenCalledWith(expect.anything(), '1');
    });

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useService(''), {
        wrapper: createWrapper(),
      });

      // Query should be disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(getServiceById).not.toHaveBeenCalled();
    });

    it('should return null for not found service', async () => {
      vi.mocked(getServiceById).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useService('nonexistent'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeNull();
    });
  });

  describe('useCreateService', () => {
    it('should create service and invalidate queries', async () => {
      const mockCreated: Service = {
        id: 'new-1',
        user_id: 'user-1',
        name: 'New Service',
        description: 'New Description',
        goal: null,
        target_users: null,
        current_stage: 'idea',
        current_server: null,
        tech_stack: [],
        ai_role: null,
        status: 'active',
        progress: 0,
        next_action: null,
        last_activity_at: '2026-02-11T00:00:00Z',
        created_at: '2026-02-11T00:00:00Z',
        updated_at: '2026-02-11T00:00:00Z',
      };

      vi.mocked(createService).mockResolvedValueOnce(mockCreated);

      const { result } = renderHook(() => useCreateService(), {
        wrapper: createWrapper(),
      });

      // Spy on invalidateQueries
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      // Trigger mutation
      result.current.mutate({ name: 'New Service', description: 'New Description' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCreated);
      expect(createService).toHaveBeenCalledWith(
        expect.anything(),
        { name: 'New Service', description: 'New Description' }
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['services'] });
    });

    it('should handle create error', async () => {
      vi.mocked(createService).mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useCreateService(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: 'New Service' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Create failed'));
    });
  });

  describe('useUpdateService', () => {
    it('should update service and invalidate queries', async () => {
      const mockUpdated: Service = {
        id: '1',
        user_id: 'user-1',
        name: 'Updated Service',
        description: 'Updated Description',
        goal: 'Updated Goal',
        target_users: null,
        current_stage: 'development',
        current_server: 'updated-server',
        tech_stack: ['Vue.js'],
        ai_role: 'Code Assistant',
        status: 'active',
        progress: 75,
        next_action: 'Deploy',
        last_activity_at: '2026-02-11T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-02-11T00:00:00Z',
      };

      vi.mocked(updateService).mockResolvedValueOnce(mockUpdated);

      const { result } = renderHook(() => useUpdateService(), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({
        id: '1',
        data: { name: 'Updated Service', progress: 75 },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockUpdated);
      expect(updateService).toHaveBeenCalledWith(
        expect.anything(),
        '1',
        { name: 'Updated Service', progress: 75 }
      );
      // Should invalidate both all services and specific service
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['services'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['services', '1'] });
    });

    it('should handle update error', async () => {
      vi.mocked(updateService).mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useUpdateService(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: '1', data: { name: 'Updated' } });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Update failed'));
    });
  });

  describe('useDeleteService', () => {
    it('should delete service and invalidate queries', async () => {
      vi.mocked(deleteService).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteService(), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(deleteService).toHaveBeenCalledWith(expect.anything(), '1');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['services'] });
    });

    it('should handle delete error', async () => {
      vi.mocked(deleteService).mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useDeleteService(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(new Error('Delete failed'));
    });
  });
});
