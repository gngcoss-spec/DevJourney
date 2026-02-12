import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getDecisions,
  getDecisionById,
  createDecision,
  updateDecision,
  deleteDecision,
} from '@/lib/supabase/queries/decisions';
import type { Decision, CreateDecisionInput, UpdateDecisionInput } from '@/types/database';

function createMockDecision(overrides: Partial<Decision> = {}): Decision {
  return {
    id: 'dec-1',
    service_id: 'svc-1',
    user_id: 'user-1',
    title: 'Use React over Vue',
    background: 'Need to choose a frontend framework',
    options: [{ name: 'React' }, { name: 'Vue' }],
    selected_option: 'React',
    reason: 'Better ecosystem',
    impact: 'Faster development',
    created_at: '2026-02-12T00:00:00Z',
    updated_at: '2026-02-12T00:00:00Z',
    ...overrides,
  };
}

function createMockClient(terminateWith: { data: unknown; error: unknown }) {
  const mock: Record<string, unknown> = {};

  mock.then = vi.fn((resolve: (value: unknown) => void) => resolve(terminateWith));
  mock.from = vi.fn(() => mock);
  mock.select = vi.fn(() => mock);
  mock.insert = vi.fn(() => mock);
  mock.update = vi.fn(() => mock);
  mock.delete = vi.fn(() => mock);
  mock.eq = vi.fn(() => mock);
  mock.order = vi.fn(() => Promise.resolve(terminateWith));
  mock.single = vi.fn(() => Promise.resolve(terminateWith));

  mock.auth = {
    getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })),
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

describe('Decisions Query Functions', () => {
  describe('getDecisions', () => {
    it('should return all decisions for a service ordered by created_at DESC', async () => {
      const mockDecisions = [
        createMockDecision({ id: 'dec-1' }),
        createMockDecision({ id: 'dec-2' }),
      ];
      const client = createMockClient({ data: mockDecisions, error: null });

      const result = await getDecisions(client, 'svc-1');

      expect(client.from).toHaveBeenCalledWith('decisions');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.eq).toHaveBeenCalledWith('service_id', 'svc-1');
      expect(client.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockDecisions);
    });

    it('should throw an error when query fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      await expect(getDecisions(client, 'svc-1')).rejects.toThrow('Database error');
    });

    it('should return empty array when no decisions exist', async () => {
      const client = createMockClient({ data: [], error: null });

      const result = await getDecisions(client, 'svc-1');

      expect(result).toEqual([]);
    });
  });

  describe('getDecisionById', () => {
    it('should return a single decision by id', async () => {
      const mockDecision = createMockDecision({ id: 'dec-1' });
      const client = createMockClient({ data: mockDecision, error: null });

      const result = await getDecisionById(client, 'dec-1');

      expect(client.from).toHaveBeenCalledWith('decisions');
      expect(client.eq).toHaveBeenCalledWith('id', 'dec-1');
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(mockDecision);
    });

    it('should return null when not found (PGRST116)', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });

      const result = await getDecisionById(client, 'non-existent');

      expect(result).toBeNull();
    });

    it('should throw an error for non-PGRST116 errors', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Permission denied', code: '403' },
      });

      await expect(getDecisionById(client, 'dec-1')).rejects.toThrow('Permission denied');
    });
  });

  describe('createDecision', () => {
    it('should create a new decision and return it', async () => {
      const input: CreateDecisionInput = {
        service_id: 'svc-1',
        title: 'New Decision',
        background: 'Some background',
      };
      const createdDecision = createMockDecision({ title: 'New Decision' });
      const client = createMockClient({ data: createdDecision, error: null });

      const result = await createDecision(client, input);

      expect(client.from).toHaveBeenCalledWith('decisions');
      expect(client.insert).toHaveBeenCalledWith({ ...input, user_id: 'user-1' });
      expect(result).toEqual(createdDecision);
    });

    it('should throw an error when creation fails', async () => {
      const input: CreateDecisionInput = { service_id: 'svc-1', title: 'Fail' };
      const client = createMockClient({
        data: null,
        error: { message: 'Insert failed', code: '500' },
      });

      await expect(createDecision(client, input)).rejects.toThrow('Insert failed');
    });
  });

  describe('updateDecision', () => {
    it('should update a decision and return the updated data', async () => {
      const updateData: UpdateDecisionInput = { title: 'Updated Title' };
      const updatedDecision = createMockDecision({ title: 'Updated Title' });
      const client = createMockClient({ data: updatedDecision, error: null });

      const result = await updateDecision(client, 'dec-1', updateData);

      expect(client.from).toHaveBeenCalledWith('decisions');
      expect(client.update).toHaveBeenCalledWith(updateData);
      expect(client.eq).toHaveBeenCalledWith('id', 'dec-1');
      expect(result).toEqual(updatedDecision);
    });

    it('should throw an error when update fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Update failed', code: '500' },
      });

      await expect(updateDecision(client, 'dec-1', { title: 'X' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteDecision', () => {
    it('should delete a decision by id', async () => {
      const client = createMockClient({ data: null, error: null });

      await deleteDecision(client, 'dec-1');

      expect(client.from).toHaveBeenCalledWith('decisions');
      expect(client.delete).toHaveBeenCalled();
      expect(client.eq).toHaveBeenCalledWith('id', 'dec-1');
    });

    it('should throw an error when deletion fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Delete failed', code: '500' },
      });

      await expect(deleteDecision(client, 'dec-1')).rejects.toThrow('Delete failed');
    });
  });
});
