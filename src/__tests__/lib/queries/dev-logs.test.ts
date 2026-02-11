// @TASK P4-R1-T1 - Dev Logs Supabase query functions tests
// @SPEC docs/planning/TASKS.md#dev-logs-queries

import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getDevLogs,
  getAllDevLogs,
  getDevLogByDate,
  createDevLog,
  updateDevLog,
} from '@/lib/supabase/queries/dev-logs';
import type { DevLog, CreateDevLogInput, UpdateDevLogInput } from '@/types/database';

// --- Mock helpers ---

function createMockDevLog(overrides: Partial<DevLog> = {}): DevLog {
  return {
    id: 'log-1',
    service_id: 'svc-1',
    user_id: 'user-1',
    log_date: '2026-02-12',
    done: 'Completed feature X',
    decided: 'Use approach A for problem Y',
    deferred: 'Refactor module Z',
    next_action: 'Start testing',
    created_at: '2026-02-12T00:00:00Z',
    updated_at: '2026-02-12T00:00:00Z',
    ...overrides,
  };
}

/**
 * Creates a mock SupabaseClient with chainable methods.
 * The `terminateWith` parameter sets the final result of the chain.
 *
 * The mock object is both chainable (returns this) and thenable (returns terminateWith).
 * This allows patterns like:
 *   - `await client.from().select().eq().order()` (order resolves)
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
  mock.eq = vi.fn(() => mock);
  mock.order = vi.fn(() => mock); // Return chainable mock
  mock.limit = vi.fn(() => Promise.resolve(terminateWith)); // limit resolves promise
  mock.single = vi.fn(() => Promise.resolve(terminateWith));

  return mock as unknown as SupabaseClient & {
    from: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };
}

// --- Tests ---

describe('Dev Logs Query Functions', () => {
  describe('getDevLogs', () => {
    it('should return all dev logs for a service ordered by log_date DESC', async () => {
      // Arrange
      const mockLogs = [
        createMockDevLog({ id: 'log-1', log_date: '2026-02-12' }),
        createMockDevLog({ id: 'log-2', log_date: '2026-02-11' }),
        createMockDevLog({ id: 'log-3', log_date: '2026-02-10' }),
      ];
      const client = createMockClient({ data: mockLogs, error: null });

      // Act
      const result = await getDevLogs(client, 'svc-1');

      // Assert
      expect(client.from).toHaveBeenCalledWith('dev_logs');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.eq).toHaveBeenCalledWith('service_id', 'svc-1');
      expect(client.order).toHaveBeenCalledWith('log_date', { ascending: false });
      expect(result).toEqual(mockLogs);
    });

    it('should throw an error when query fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      // Act & Assert
      await expect(getDevLogs(client, 'svc-1')).rejects.toThrow('Database error');
    });

    it('should return empty array when no dev logs exist', async () => {
      // Arrange
      const client = createMockClient({ data: [], error: null });

      // Act
      const result = await getDevLogs(client, 'svc-1');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getAllDevLogs', () => {
    it('should return all dev logs across all services with default limit', async () => {
      // Arrange
      const mockLogs = [
        createMockDevLog({ id: 'log-1', log_date: '2026-02-12' }),
        createMockDevLog({ id: 'log-2', service_id: 'svc-2', log_date: '2026-02-11' }),
      ];
      const client = createMockClient({ data: mockLogs, error: null });

      // Act
      const result = await getAllDevLogs(client);

      // Assert
      expect(client.from).toHaveBeenCalledWith('dev_logs');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.order).toHaveBeenCalledWith('log_date', { ascending: false });
      expect(client.limit).toHaveBeenCalledWith(20);
      expect(result).toEqual(mockLogs);
    });

    it('should respect custom limit parameter', async () => {
      // Arrange
      const mockLogs = [createMockDevLog({ id: 'log-1' })];
      const client = createMockClient({ data: mockLogs, error: null });

      // Act
      const result = await getAllDevLogs(client, 5);

      // Assert
      expect(client.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockLogs);
    });

    it('should throw an error when query fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      // Act & Assert
      await expect(getAllDevLogs(client)).rejects.toThrow('Database error');
    });
  });

  describe('getDevLogByDate', () => {
    it('should return dev log for service and date', async () => {
      // Arrange
      const mockLog = createMockDevLog({ id: 'log-1', log_date: '2026-02-12' });
      const client = createMockClient({ data: mockLog, error: null });

      // Act
      const result = await getDevLogByDate(client, 'svc-1', '2026-02-12');

      // Assert
      expect(client.from).toHaveBeenCalledWith('dev_logs');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.eq).toHaveBeenCalledWith('service_id', 'svc-1');
      expect(client.eq).toHaveBeenCalledWith('log_date', '2026-02-12');
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(mockLog);
    });

    it('should return null when dev log not found (PGRST116)', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });

      // Act
      const result = await getDevLogByDate(client, 'svc-1', '2026-02-12');

      // Assert
      expect(result).toBeNull();
    });

    it('should throw an error for other query failures', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      // Act & Assert
      await expect(getDevLogByDate(client, 'svc-1', '2026-02-12')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('createDevLog', () => {
    it('should create a new dev log successfully', async () => {
      // Arrange
      const input: CreateDevLogInput = {
        service_id: 'svc-1',
        done: 'Completed feature X',
      };
      const mockLog = createMockDevLog(input);
      const client = createMockClient({ data: mockLog, error: null });

      // Act
      const result = await createDevLog(client, input);

      // Assert
      expect(client.from).toHaveBeenCalledWith('dev_logs');
      expect(client.insert).toHaveBeenCalledWith(input);
      expect(client.select).toHaveBeenCalledWith();
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(mockLog);
    });

    it('should throw an error when insert fails', async () => {
      // Arrange
      const input: CreateDevLogInput = {
        service_id: 'svc-1',
      };
      const client = createMockClient({
        data: null,
        error: { message: 'Insert failed', code: '500' },
      });

      // Act & Assert
      await expect(createDevLog(client, input)).rejects.toThrow('Insert failed');
    });
  });

  describe('updateDevLog', () => {
    it('should update an existing dev log successfully', async () => {
      // Arrange
      const updateData: UpdateDevLogInput = {
        done: 'Updated done field',
      };
      const mockLog = createMockDevLog({ ...updateData });
      const client = createMockClient({ data: mockLog, error: null });

      // Act
      const result = await updateDevLog(client, 'log-1', updateData);

      // Assert
      expect(client.from).toHaveBeenCalledWith('dev_logs');
      expect(client.update).toHaveBeenCalledWith(updateData);
      expect(client.eq).toHaveBeenCalledWith('id', 'log-1');
      expect(client.select).toHaveBeenCalledWith();
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(mockLog);
    });

    it('should throw an error when update fails', async () => {
      // Arrange
      const updateData: UpdateDevLogInput = {
        decided: 'New decision',
      };
      const client = createMockClient({
        data: null,
        error: { message: 'Update failed', code: '500' },
      });

      // Act & Assert
      await expect(updateDevLog(client, 'log-1', updateData)).rejects.toThrow(
        'Update failed'
      );
    });
  });
});
