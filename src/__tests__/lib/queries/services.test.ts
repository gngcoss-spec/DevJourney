// @TASK P2-R1-T2 - Services Supabase query functions tests
// @SPEC docs/planning/TASKS.md#services-queries

import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '@/lib/supabase/queries/services';
import type { Service, CreateServiceInput, UpdateServiceInput } from '@/types/database';

// --- Mock helpers ---

function createMockService(overrides: Partial<Service> = {}): Service {
  return {
    id: 'svc-1',
    user_id: 'user-1',
    name: 'Test Service',
    description: null,
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
    ...overrides,
  };
}

/**
 * Creates a mock SupabaseClient with chainable methods.
 * The `terminateWith` parameter sets the final result of the chain.
 *
 * The mock object is both chainable (returns this) and thenable (returns terminateWith).
 * This allows patterns like:
 *   - `await client.from().select().order()` (order resolves)
 *   - `await client.from().select().eq().single()` (single resolves)
 *   - `await client.from().delete().eq()` (eq resolves via then)
 */
function createMockClient(terminateWith: { data: unknown; error: unknown }) {
  const mock: Record<string, unknown> = {};

  // Make mock thenable so `await mock.from().delete().eq()` works
  // when eq is the last call in the chain.
  mock.then = vi.fn((resolve: (value: unknown) => void) => resolve(terminateWith));

  mock.from = vi.fn(() => mock);
  mock.select = vi.fn(() => mock);
  mock.insert = vi.fn(() => mock);
  mock.update = vi.fn(() => mock);
  mock.delete = vi.fn(() => mock);
  mock.eq = vi.fn(() => mock);
  mock.order = vi.fn(() => Promise.resolve(terminateWith));
  mock.single = vi.fn(() => Promise.resolve(terminateWith));

  return mock as unknown as SupabaseClient & {
    from: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };
}

// --- Tests ---

describe('Services Query Functions', () => {
  describe('getServices', () => {
    it('should return all services ordered by last_activity_at DESC', async () => {
      // Arrange
      const mockServices = [
        createMockService({ id: 'svc-1', name: 'Service A', last_activity_at: '2026-02-11T10:00:00Z' }),
        createMockService({ id: 'svc-2', name: 'Service B', last_activity_at: '2026-02-10T10:00:00Z' }),
      ];
      const client = createMockClient({ data: mockServices, error: null });

      // Act
      const result = await getServices(client);

      // Assert
      expect(client.from).toHaveBeenCalledWith('services');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.order).toHaveBeenCalledWith('last_activity_at', { ascending: false });
      expect(result).toEqual(mockServices);
    });

    it('should throw an error when query fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      // Act & Assert
      await expect(getServices(client)).rejects.toThrow('Database error');
    });

    it('should return empty array when no services exist', async () => {
      // Arrange
      const client = createMockClient({ data: [], error: null });

      // Act
      const result = await getServices(client);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getServiceById', () => {
    it('should return a single service by id', async () => {
      // Arrange
      const mockService = createMockService({ id: 'svc-1' });
      const client = createMockClient({ data: mockService, error: null });

      // Act
      const result = await getServiceById(client, 'svc-1');

      // Assert
      expect(client.from).toHaveBeenCalledWith('services');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.eq).toHaveBeenCalledWith('id', 'svc-1');
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(mockService);
    });

    it('should return null when service is not found (PGRST116)', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });

      // Act
      const result = await getServiceById(client, 'non-existent');

      // Assert
      expect(result).toBeNull();
    });

    it('should throw an error for non-PGRST116 errors', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Permission denied', code: '403' },
      });

      // Act & Assert
      await expect(getServiceById(client, 'svc-1')).rejects.toThrow('Permission denied');
    });
  });

  describe('createService', () => {
    it('should create a new service and return it', async () => {
      // Arrange
      const input: CreateServiceInput = {
        name: 'New Service',
        description: 'A new service description',
        goal: 'MVP Launch',
      };
      const createdService = createMockService({
        id: 'svc-new',
        name: 'New Service',
        description: 'A new service description',
        goal: 'MVP Launch',
      });
      const client = createMockClient({ data: createdService, error: null });

      // Act
      const result = await createService(client, input);

      // Assert
      expect(client.from).toHaveBeenCalledWith('services');
      expect(client.insert).toHaveBeenCalledWith(input);
      expect(client.select).toHaveBeenCalled();
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(createdService);
    });

    it('should create a service with only name (minimal input)', async () => {
      // Arrange
      const input: CreateServiceInput = { name: 'Minimal Service' };
      const createdService = createMockService({ id: 'svc-min', name: 'Minimal Service' });
      const client = createMockClient({ data: createdService, error: null });

      // Act
      const result = await createService(client, input);

      // Assert
      expect(client.insert).toHaveBeenCalledWith(input);
      expect(result).toEqual(createdService);
    });

    it('should throw an error when creation fails', async () => {
      // Arrange
      const input: CreateServiceInput = { name: 'Fail Service' };
      const client = createMockClient({
        data: null,
        error: { message: 'Unique constraint violation', code: '23505' },
      });

      // Act & Assert
      await expect(createService(client, input)).rejects.toThrow('Unique constraint violation');
    });
  });

  describe('updateService', () => {
    it('should update a service and return the updated data', async () => {
      // Arrange
      const updateData: UpdateServiceInput = {
        name: 'Updated Name',
        status: 'paused',
        progress: 50,
      };
      const updatedService = createMockService({
        id: 'svc-1',
        name: 'Updated Name',
        status: 'paused',
        progress: 50,
      });
      const client = createMockClient({ data: updatedService, error: null });

      // Act
      const result = await updateService(client, 'svc-1', updateData);

      // Assert
      expect(client.from).toHaveBeenCalledWith('services');
      expect(client.update).toHaveBeenCalledWith(updateData);
      expect(client.eq).toHaveBeenCalledWith('id', 'svc-1');
      expect(client.select).toHaveBeenCalled();
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(updatedService);
    });

    it('should throw an error when update fails', async () => {
      // Arrange
      const updateData: UpdateServiceInput = { name: 'Fail Update' };
      const client = createMockClient({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });

      // Act & Assert
      await expect(updateService(client, 'non-existent', updateData)).rejects.toThrow('Row not found');
    });
  });

  describe('deleteService', () => {
    it('should delete a service by id', async () => {
      // Arrange
      const client = createMockClient({ data: null, error: null });

      // Act
      await deleteService(client, 'svc-1');

      // Assert
      expect(client.from).toHaveBeenCalledWith('services');
      expect(client.delete).toHaveBeenCalled();
      expect(client.eq).toHaveBeenCalledWith('id', 'svc-1');
    });

    it('should throw an error when deletion fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Foreign key violation', code: '23503' },
      });

      // Act & Assert
      await expect(deleteService(client, 'svc-1')).rejects.toThrow('Foreign key violation');
    });

    it('should not return any data on successful deletion', async () => {
      // Arrange
      const client = createMockClient({ data: null, error: null });

      // Act
      const result = await deleteService(client, 'svc-1');

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
