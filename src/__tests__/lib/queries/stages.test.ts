import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getStages,
  getStageById,
  createStage,
  updateStage,
  deleteStage,
} from '@/lib/supabase/queries/stages';
import type { Stage, CreateStageInput, UpdateStageInput } from '@/types/database';

function createMockStage(overrides: Partial<Stage> = {}): Stage {
  return {
    id: 'stage-1',
    service_id: 'svc-1',
    user_id: 'user-1',
    stage_name: 'planning',
    start_date: '2026-01-01',
    end_date: '2026-01-15',
    summary: 'Planning phase completed',
    deliverables: ['PRD', 'TRD'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
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

describe('Stages Query Functions', () => {
  describe('getStages', () => {
    it('should return all stages for a service ordered by created_at ASC', async () => {
      const mockStages = [
        createMockStage({ id: 'stage-1', stage_name: 'idea' }),
        createMockStage({ id: 'stage-2', stage_name: 'planning' }),
      ];
      const client = createMockClient({ data: mockStages, error: null });

      const result = await getStages(client, 'svc-1');

      expect(client.from).toHaveBeenCalledWith('stages');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.eq).toHaveBeenCalledWith('service_id', 'svc-1');
      expect(client.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result).toEqual(mockStages);
    });

    it('should throw an error when query fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      await expect(getStages(client, 'svc-1')).rejects.toThrow('Database error');
    });

    it('should return empty array when no stages exist', async () => {
      const client = createMockClient({ data: [], error: null });

      const result = await getStages(client, 'svc-1');

      expect(result).toEqual([]);
    });
  });

  describe('getStageById', () => {
    it('should return a single stage by id', async () => {
      const mockStage = createMockStage({ id: 'stage-1' });
      const client = createMockClient({ data: mockStage, error: null });

      const result = await getStageById(client, 'stage-1');

      expect(client.from).toHaveBeenCalledWith('stages');
      expect(client.eq).toHaveBeenCalledWith('id', 'stage-1');
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(mockStage);
    });

    it('should return null when not found (PGRST116)', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });

      const result = await getStageById(client, 'non-existent');

      expect(result).toBeNull();
    });

    it('should throw an error for non-PGRST116 errors', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Permission denied', code: '403' },
      });

      await expect(getStageById(client, 'stage-1')).rejects.toThrow('Permission denied');
    });
  });

  describe('createStage', () => {
    it('should create a new stage and return it', async () => {
      const input: CreateStageInput = {
        service_id: 'svc-1',
        stage_name: 'design',
        summary: 'Design phase',
      };
      const createdStage = createMockStage({ stage_name: 'design', summary: 'Design phase' });
      const client = createMockClient({ data: createdStage, error: null });

      const result = await createStage(client, input);

      expect(client.from).toHaveBeenCalledWith('stages');
      expect(client.insert).toHaveBeenCalledWith({ ...input, user_id: 'user-1' });
      expect(result).toEqual(createdStage);
    });

    it('should throw an error when creation fails', async () => {
      const input: CreateStageInput = { service_id: 'svc-1', stage_name: 'idea' };
      const client = createMockClient({
        data: null,
        error: { message: 'Unique constraint violation', code: '23505' },
      });

      await expect(createStage(client, input)).rejects.toThrow('Unique constraint violation');
    });
  });

  describe('updateStage', () => {
    it('should update a stage and return the updated data', async () => {
      const updateData: UpdateStageInput = { summary: 'Updated summary' };
      const updatedStage = createMockStage({ summary: 'Updated summary' });
      const client = createMockClient({ data: updatedStage, error: null });

      const result = await updateStage(client, 'stage-1', updateData);

      expect(client.from).toHaveBeenCalledWith('stages');
      expect(client.update).toHaveBeenCalledWith(updateData);
      expect(client.eq).toHaveBeenCalledWith('id', 'stage-1');
      expect(result).toEqual(updatedStage);
    });

    it('should throw an error when update fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Update failed', code: '500' },
      });

      await expect(updateStage(client, 'stage-1', { summary: 'X' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteStage', () => {
    it('should delete a stage by id', async () => {
      const client = createMockClient({ data: null, error: null });

      await deleteStage(client, 'stage-1');

      expect(client.from).toHaveBeenCalledWith('stages');
      expect(client.delete).toHaveBeenCalled();
      expect(client.eq).toHaveBeenCalledWith('id', 'stage-1');
    });

    it('should throw an error when deletion fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Delete failed', code: '500' },
      });

      await expect(deleteStage(client, 'stage-1')).rejects.toThrow('Delete failed');
    });
  });
});
