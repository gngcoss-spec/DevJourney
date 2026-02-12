import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getServers,
  getServerById,
  createServer,
  updateServer,
  deleteServer,
} from '@/lib/supabase/queries/servers';
import type { Server, CreateServerInput, UpdateServerInput } from '@/types/database';

function createMockServer(overrides: Partial<Server> = {}): Server {
  return {
    id: 'srv-1',
    user_id: 'user-1',
    name: 'Production Server',
    ip: '192.168.1.100',
    description: 'Main production server',
    purpose: 'Web hosting',
    status: 'active',
    risk_level: 'low',
    last_activity_at: '2026-02-12T00:00:00Z',
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

describe('Servers Query Functions', () => {
  describe('getServers', () => {
    it('should return all servers ordered by last_activity_at DESC', async () => {
      const mockServers = [
        createMockServer({ id: 'srv-1' }),
        createMockServer({ id: 'srv-2', name: 'Staging' }),
      ];
      const client = createMockClient({ data: mockServers, error: null });

      const result = await getServers(client);

      expect(client.from).toHaveBeenCalledWith('servers');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.order).toHaveBeenCalledWith('last_activity_at', { ascending: false });
      expect(result).toEqual(mockServers);
    });

    it('should throw an error when query fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      await expect(getServers(client)).rejects.toThrow('Database error');
    });

    it('should return empty array when no servers exist', async () => {
      const client = createMockClient({ data: [], error: null });

      const result = await getServers(client);

      expect(result).toEqual([]);
    });
  });

  describe('getServerById', () => {
    it('should return a single server by id', async () => {
      const mockServer = createMockServer({ id: 'srv-1' });
      const client = createMockClient({ data: mockServer, error: null });

      const result = await getServerById(client, 'srv-1');

      expect(client.from).toHaveBeenCalledWith('servers');
      expect(client.eq).toHaveBeenCalledWith('id', 'srv-1');
      expect(result).toEqual(mockServer);
    });

    it('should return null when not found (PGRST116)', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });

      const result = await getServerById(client, 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createServer', () => {
    it('should create a new server and return it', async () => {
      const input: CreateServerInput = { name: 'New Server', ip: '10.0.0.1' };
      const createdServer = createMockServer({ name: 'New Server', ip: '10.0.0.1' });
      const client = createMockClient({ data: createdServer, error: null });

      const result = await createServer(client, input);

      expect(client.from).toHaveBeenCalledWith('servers');
      expect(client.insert).toHaveBeenCalledWith({ ...input, user_id: 'user-1' });
      expect(result).toEqual(createdServer);
    });

    it('should throw an error when creation fails', async () => {
      const input: CreateServerInput = { name: 'Fail' };
      const client = createMockClient({
        data: null,
        error: { message: 'Insert failed', code: '500' },
      });

      await expect(createServer(client, input)).rejects.toThrow('Insert failed');
    });
  });

  describe('updateServer', () => {
    it('should update a server and return it', async () => {
      const updateData: UpdateServerInput = { name: 'Updated Server' };
      const updatedServer = createMockServer({ name: 'Updated Server' });
      const client = createMockClient({ data: updatedServer, error: null });

      const result = await updateServer(client, 'srv-1', updateData);

      expect(client.from).toHaveBeenCalledWith('servers');
      expect(client.update).toHaveBeenCalledWith(updateData);
      expect(client.eq).toHaveBeenCalledWith('id', 'srv-1');
      expect(result).toEqual(updatedServer);
    });
  });

  describe('deleteServer', () => {
    it('should delete a server by id', async () => {
      const client = createMockClient({ data: null, error: null });

      await deleteServer(client, 'srv-1');

      expect(client.from).toHaveBeenCalledWith('servers');
      expect(client.delete).toHaveBeenCalled();
      expect(client.eq).toHaveBeenCalledWith('id', 'srv-1');
    });

    it('should throw an error when deletion fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Delete failed', code: '500' },
      });

      await expect(deleteServer(client, 'srv-1')).rejects.toThrow('Delete failed');
    });
  });
});
