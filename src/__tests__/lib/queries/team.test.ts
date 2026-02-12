import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '@/lib/supabase/queries/team';
import type { TeamMember, CreateTeamMemberInput, UpdateTeamMemberInput } from '@/types/database';

function createMockTeamMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: 'tm-1',
    user_id: 'user-1',
    invited_by: 'user-1',
    display_name: 'John Doe',
    email: 'john@example.com',
    role: 'contributor',
    status: 'active',
    joined_at: '2026-02-01T00:00:00Z',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
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

describe('Team Query Functions', () => {
  describe('getTeamMembers', () => {
    it('should return all team members ordered by created_at DESC', async () => {
      const mockMembers = [
        createMockTeamMember({ id: 'tm-1' }),
        createMockTeamMember({ id: 'tm-2', display_name: 'Jane' }),
      ];
      const client = createMockClient({ data: mockMembers, error: null });

      const result = await getTeamMembers(client);

      expect(client.from).toHaveBeenCalledWith('team_members');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockMembers);
    });

    it('should throw an error when query fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      await expect(getTeamMembers(client)).rejects.toThrow('Database error');
    });

    it('should return empty array when no members exist', async () => {
      const client = createMockClient({ data: [], error: null });

      const result = await getTeamMembers(client);

      expect(result).toEqual([]);
    });
  });

  describe('getTeamMemberById', () => {
    it('should return a single team member by id', async () => {
      const mockMember = createMockTeamMember({ id: 'tm-1' });
      const client = createMockClient({ data: mockMember, error: null });

      const result = await getTeamMemberById(client, 'tm-1');

      expect(client.from).toHaveBeenCalledWith('team_members');
      expect(client.eq).toHaveBeenCalledWith('id', 'tm-1');
      expect(result).toEqual(mockMember);
    });

    it('should return null when not found (PGRST116)', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });

      const result = await getTeamMemberById(client, 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createTeamMember', () => {
    it('should create a new team member and return it', async () => {
      const input: CreateTeamMemberInput = { display_name: 'New Member', email: 'new@example.com' };
      const createdMember = createMockTeamMember({ display_name: 'New Member' });
      const client = createMockClient({ data: createdMember, error: null });

      const result = await createTeamMember(client, input);

      expect(client.from).toHaveBeenCalledWith('team_members');
      expect(client.insert).toHaveBeenCalledWith({ ...input, user_id: 'user-1', invited_by: 'user-1' });
      expect(result).toEqual(createdMember);
    });

    it('should throw an error when creation fails', async () => {
      const input: CreateTeamMemberInput = { display_name: 'Fail' };
      const client = createMockClient({
        data: null,
        error: { message: 'Insert failed', code: '500' },
      });

      await expect(createTeamMember(client, input)).rejects.toThrow('Insert failed');
    });
  });

  describe('updateTeamMember', () => {
    it('should update a team member and return it', async () => {
      const updateData: UpdateTeamMemberInput = { role: 'owner' };
      const updatedMember = createMockTeamMember({ role: 'owner' });
      const client = createMockClient({ data: updatedMember, error: null });

      const result = await updateTeamMember(client, 'tm-1', updateData);

      expect(client.from).toHaveBeenCalledWith('team_members');
      expect(client.update).toHaveBeenCalledWith(updateData);
      expect(client.eq).toHaveBeenCalledWith('id', 'tm-1');
      expect(result).toEqual(updatedMember);
    });
  });

  describe('deleteTeamMember', () => {
    it('should delete a team member by id', async () => {
      const client = createMockClient({ data: null, error: null });

      await deleteTeamMember(client, 'tm-1');

      expect(client.from).toHaveBeenCalledWith('team_members');
      expect(client.delete).toHaveBeenCalled();
      expect(client.eq).toHaveBeenCalledWith('id', 'tm-1');
    });

    it('should throw an error when deletion fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Delete failed', code: '500' },
      });

      await expect(deleteTeamMember(client, 'tm-1')).rejects.toThrow('Delete failed');
    });
  });
});
