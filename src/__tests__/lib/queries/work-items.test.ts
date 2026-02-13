// @TASK P3-R1-T2 - Work Items Supabase query functions tests
// @SPEC docs/planning/TASKS.md#work-items-queries

import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getWorkItems,
  getWorkItemsByStatus,
  getWorkItemById,
  createWorkItem,
  updateWorkItem,
  updateWorkItemPosition,
  deleteWorkItem,
} from '@/lib/supabase/queries/work-items';
import type {
  WorkItem,
  CreateWorkItemInput,
  UpdateWorkItemInput,
  WorkItemStatus,
} from '@/types/database';

// --- Mock helpers ---

function createMockWorkItem(overrides: Partial<WorkItem> = {}): WorkItem {
  return {
    id: 'wi-1',
    service_id: 'svc-1',
    user_id: 'user-1',
    title: 'Test Work Item',
    description: null,
    type: 'feature',
    priority: 'medium',
    status: 'backlog',
    problem: null,
    options_considered: null,
    decision_reason: null,
    result: null,
    assignee_name: null,
    due_date: null,
    labels: [],
    assignee_id: null,
    sort_order: 0,
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
function createMockClient(terminateWith: { data: unknown; error: unknown }, userId: string = 'user-1') {
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

  // Auth mock for user_id injection
  mock.auth = {
    getUser: vi.fn(() => Promise.resolve({ data: { user: { id: userId } }, error: null })),
  };

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

describe('Work Items Query Functions', () => {
  describe('getWorkItems', () => {
    it('should return all work items for a service ordered by sort_order ASC', async () => {
      // Arrange
      const mockItems = [
        createMockWorkItem({ id: 'wi-1', sort_order: 0 }),
        createMockWorkItem({ id: 'wi-2', sort_order: 1 }),
        createMockWorkItem({ id: 'wi-3', sort_order: 2 }),
      ];
      const client = createMockClient({ data: mockItems, error: null });

      // Act
      const result = await getWorkItems(client, 'svc-1');

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_items');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.eq).toHaveBeenCalledWith('service_id', 'svc-1');
      expect(client.order).toHaveBeenCalledWith('sort_order', { ascending: true });
      expect(result).toEqual(mockItems);
    });

    it('should throw an error when query fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      // Act & Assert
      await expect(getWorkItems(client, 'svc-1')).rejects.toThrow('Database error');
    });

    it('should return empty array when no work items exist', async () => {
      // Arrange
      const client = createMockClient({ data: [], error: null });

      // Act
      const result = await getWorkItems(client, 'svc-1');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getWorkItemsByStatus', () => {
    it('should return work items filtered by service_id and status, ordered by sort_order ASC', async () => {
      // Arrange
      const mockItems = [
        createMockWorkItem({ id: 'wi-1', status: 'in-progress', sort_order: 0 }),
        createMockWorkItem({ id: 'wi-2', status: 'in-progress', sort_order: 1 }),
      ];
      const client = createMockClient({ data: mockItems, error: null });

      // Act
      const result = await getWorkItemsByStatus(client, 'svc-1', 'in-progress');

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_items');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.eq).toHaveBeenCalledWith('service_id', 'svc-1');
      expect(client.eq).toHaveBeenCalledWith('status', 'in-progress');
      expect(client.order).toHaveBeenCalledWith('sort_order', { ascending: true });
      expect(result).toEqual(mockItems);
    });

    it('should throw an error when query fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Permission denied', code: '403' },
      });

      // Act & Assert
      await expect(getWorkItemsByStatus(client, 'svc-1', 'backlog')).rejects.toThrow(
        'Permission denied'
      );
    });

    it('should return empty array when no items match the status', async () => {
      // Arrange
      const client = createMockClient({ data: [], error: null });

      // Act
      const result = await getWorkItemsByStatus(client, 'svc-1', 'done');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getWorkItemById', () => {
    it('should return a single work item by id', async () => {
      // Arrange
      const mockItem = createMockWorkItem({ id: 'wi-1' });
      const client = createMockClient({ data: mockItem, error: null });

      // Act
      const result = await getWorkItemById(client, 'wi-1');

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_items');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.eq).toHaveBeenCalledWith('id', 'wi-1');
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(mockItem);
    });

    it('should return null when work item is not found (PGRST116)', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });

      // Act
      const result = await getWorkItemById(client, 'non-existent');

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
      await expect(getWorkItemById(client, 'wi-1')).rejects.toThrow('Permission denied');
    });
  });

  describe('createWorkItem', () => {
    it('should create a new work item and return it', async () => {
      // Arrange
      const input: CreateWorkItemInput = {
        service_id: 'svc-1',
        title: 'New Feature',
        description: 'Implement user login',
        type: 'feature',
        priority: 'high',
      };
      const createdItem = createMockWorkItem({
        id: 'wi-new',
        service_id: 'svc-1',
        title: 'New Feature',
        description: 'Implement user login',
        type: 'feature',
        priority: 'high',
      });
      const client = createMockClient({ data: createdItem, error: null });

      // Act
      const result = await createWorkItem(client, input);

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_items');
      expect(client.insert).toHaveBeenCalledWith({ ...input, user_id: 'user-1' });
      expect(client.select).toHaveBeenCalled();
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(createdItem);
    });

    it('should create a work item with minimal input (service_id + title only)', async () => {
      // Arrange
      const input: CreateWorkItemInput = {
        service_id: 'svc-1',
        title: 'Minimal Work Item',
      };
      const createdItem = createMockWorkItem({
        id: 'wi-min',
        service_id: 'svc-1',
        title: 'Minimal Work Item',
      });
      const client = createMockClient({ data: createdItem, error: null });

      // Act
      const result = await createWorkItem(client, input);

      // Assert
      expect(client.insert).toHaveBeenCalledWith({ ...input, user_id: 'user-1' });
      expect(result).toEqual(createdItem);
    });

    it('should throw an error when creation fails', async () => {
      // Arrange
      const input: CreateWorkItemInput = {
        service_id: 'svc-1',
        title: 'Fail Item',
      };
      const client = createMockClient({
        data: null,
        error: { message: 'Foreign key violation', code: '23503' },
      });

      // Act & Assert
      await expect(createWorkItem(client, input)).rejects.toThrow('Foreign key violation');
    });
  });

  describe('updateWorkItem', () => {
    it('should update a work item and return the updated data', async () => {
      // Arrange
      const updateData: UpdateWorkItemInput = {
        title: 'Updated Title',
        priority: 'urgent',
        status: 'in-progress',
      };
      const updatedItem = createMockWorkItem({
        id: 'wi-1',
        title: 'Updated Title',
        priority: 'urgent',
        status: 'in-progress',
      });
      const client = createMockClient({ data: updatedItem, error: null });

      // Act
      const result = await updateWorkItem(client, 'wi-1', updateData);

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_items');
      expect(client.update).toHaveBeenCalledWith(updateData);
      expect(client.eq).toHaveBeenCalledWith('id', 'wi-1');
      expect(client.select).toHaveBeenCalled();
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(updatedItem);
    });

    it('should update decision tracking fields', async () => {
      // Arrange
      const updateData: UpdateWorkItemInput = {
        problem: 'How to handle auth?',
        options_considered: 'JWT vs Session',
        decision_reason: 'JWT is stateless',
        result: 'Implemented JWT auth',
      };
      const updatedItem = createMockWorkItem({
        id: 'wi-1',
        ...updateData,
      });
      const client = createMockClient({ data: updatedItem, error: null });

      // Act
      const result = await updateWorkItem(client, 'wi-1', updateData);

      // Assert
      expect(client.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(updatedItem);
    });

    it('should throw an error when update fails', async () => {
      // Arrange
      const updateData: UpdateWorkItemInput = { title: 'Fail Update' };
      const client = createMockClient({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });

      // Act & Assert
      await expect(updateWorkItem(client, 'non-existent', updateData)).rejects.toThrow(
        'Row not found'
      );
    });
  });

  describe('updateWorkItemPosition', () => {
    it('should update status and sort_order for Kanban drag-and-drop', async () => {
      // Arrange
      const updatedItem = createMockWorkItem({
        id: 'wi-1',
        status: 'in-progress',
        sort_order: 2,
      });
      const client = createMockClient({ data: updatedItem, error: null });

      // Act
      const result = await updateWorkItemPosition(client, 'wi-1', 'in-progress', 2);

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_items');
      expect(client.update).toHaveBeenCalledWith({ status: 'in-progress', sort_order: 2 });
      expect(client.eq).toHaveBeenCalledWith('id', 'wi-1');
      expect(client.select).toHaveBeenCalled();
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(updatedItem);
    });

    it('should handle moving to a different status column', async () => {
      // Arrange
      const updatedItem = createMockWorkItem({
        id: 'wi-1',
        status: 'done',
        sort_order: 0,
      });
      const client = createMockClient({ data: updatedItem, error: null });

      // Act
      const result = await updateWorkItemPosition(client, 'wi-1', 'done', 0);

      // Assert
      expect(client.update).toHaveBeenCalledWith({ status: 'done', sort_order: 0 });
      expect(result).toEqual(updatedItem);
    });

    it('should throw an error when position update fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });

      // Act & Assert
      await expect(updateWorkItemPosition(client, 'wi-1', 'review', 3)).rejects.toThrow(
        'Row not found'
      );
    });
  });

  describe('deleteWorkItem', () => {
    it('should delete a work item by id', async () => {
      // Arrange
      const client = createMockClient({ data: null, error: null });

      // Act
      await deleteWorkItem(client, 'wi-1');

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_items');
      expect(client.delete).toHaveBeenCalled();
      expect(client.eq).toHaveBeenCalledWith('id', 'wi-1');
    });

    it('should throw an error when deletion fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Foreign key violation', code: '23503' },
      });

      // Act & Assert
      await expect(deleteWorkItem(client, 'wi-1')).rejects.toThrow('Foreign key violation');
    });

    it('should not return any data on successful deletion', async () => {
      // Arrange
      const client = createMockClient({ data: null, error: null });

      // Act
      const result = await deleteWorkItem(client, 'wi-1');

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
