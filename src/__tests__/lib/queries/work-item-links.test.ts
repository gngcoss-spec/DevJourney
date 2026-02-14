// @TASK Work Item Links Query Functions Tests
// @SPEC Tests for getWorkItemLinks, createWorkItemLink, deleteWorkItemLink

import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getWorkItemLinks,
  createWorkItemLink,
  deleteWorkItemLink,
} from '@/lib/supabase/queries/work-item-links';
import type { WorkItemLink, CreateWorkItemLinkInput } from '@/types/database';

// --- Mock helpers ---

function createMockLink(overrides: Partial<WorkItemLink> = {}): WorkItemLink {
  return {
    id: 'link-1',
    source_id: 'wi-1',
    target_id: 'wi-2',
    link_type: 'relates_to',
    user_id: 'user-1',
    created_at: '2026-02-14T00:00:00Z',
    ...overrides,
  };
}

/**
 * Creates a mock SupabaseClient with chainable methods.
 * The `terminateWith` parameter sets the final result of the chain.
 *
 * The mock object is both chainable (returns this) and thenable (returns terminateWith).
 * This allows patterns like:
 *   - `await client.from().select().or().order()` (order resolves)
 *   - `await client.from().insert().select().single()` (single resolves)
 *   - `await client.from().delete().eq()` (eq resolves via thenable)
 */
function createMockClient(terminateWith: { data: unknown; error: unknown }) {
  const mock: Record<string, unknown> = {};

  // Make mock thenable so `await mock.from().delete().eq()` works
  // when eq is the last call in the chain.
  mock.then = vi.fn((resolve: (value: unknown) => void) => resolve(terminateWith));

  mock.from = vi.fn(() => mock);
  mock.select = vi.fn(() => mock);
  mock.insert = vi.fn(() => mock);
  mock.delete = vi.fn(() => mock);
  mock.eq = vi.fn(() => mock);
  mock.or = vi.fn(() => mock);
  mock.order = vi.fn(() => Promise.resolve(terminateWith));
  mock.single = vi.fn(() => Promise.resolve(terminateWith));

  // Auth mock for user_id injection
  mock.auth = {
    getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })),
  };

  return mock as unknown as SupabaseClient & {
    from: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    or: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };
}

// --- Tests ---

describe('Work Item Links Query Functions', () => {
  describe('getWorkItemLinks', () => {
    it('should return links for a work item using .or() filter', async () => {
      // Arrange
      const mockLinks = [
        createMockLink({
          id: 'link-1',
          source_id: 'wi-1',
          target_id: 'wi-2',
          link_type: 'blocks',
        }),
        createMockLink({
          id: 'link-2',
          source_id: 'wi-3',
          target_id: 'wi-1',
          link_type: 'relates_to',
        }),
      ];
      const client = createMockClient({ data: mockLinks, error: null });

      // Act
      const result = await getWorkItemLinks(client, 'wi-1');

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_item_links');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.or).toHaveBeenCalledWith('source_id.eq.wi-1,target_id.eq.wi-1');
      expect(client.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result).toEqual(mockLinks);
      expect(result).toHaveLength(2);
    });

    it('should throw an error when query fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Database connection failed', code: '500' },
      });

      // Act & Assert
      await expect(getWorkItemLinks(client, 'wi-1')).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should return empty array when no links exist', async () => {
      // Arrange
      const client = createMockClient({ data: [], error: null });

      // Act
      const result = await getWorkItemLinks(client, 'wi-orphan');

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('createWorkItemLink', () => {
    it('should create and return link with user_id injected', async () => {
      // Arrange
      const input: CreateWorkItemLinkInput = {
        source_id: 'wi-1',
        target_id: 'wi-2',
        link_type: 'blocks',
      };
      const createdLink = createMockLink({
        id: 'link-new',
        source_id: 'wi-1',
        target_id: 'wi-2',
        link_type: 'blocks',
        user_id: 'user-1',
      });
      const client = createMockClient({ data: createdLink, error: null });

      // Act
      const result = await createWorkItemLink(client, input);

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_item_links');
      expect(client.insert).toHaveBeenCalledWith({
        source_id: 'wi-1',
        target_id: 'wi-2',
        link_type: 'blocks',
        user_id: 'user-1',
      });
      expect(client.select).toHaveBeenCalled();
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(createdLink);
      expect(result.user_id).toBe('user-1');
    });

    it('should use default link_type "relates_to" when not provided', async () => {
      // Arrange
      const input: CreateWorkItemLinkInput = {
        source_id: 'wi-1',
        target_id: 'wi-3',
      };
      const createdLink = createMockLink({
        id: 'link-default',
        source_id: 'wi-1',
        target_id: 'wi-3',
        link_type: 'relates_to',
        user_id: 'user-1',
      });
      const client = createMockClient({ data: createdLink, error: null });

      // Act
      const result = await createWorkItemLink(client, input);

      // Assert
      expect(client.insert).toHaveBeenCalledWith({
        source_id: 'wi-1',
        target_id: 'wi-3',
        link_type: 'relates_to',
        user_id: 'user-1',
      });
      expect(result.link_type).toBe('relates_to');
    });

    it('should throw an error when creation fails', async () => {
      // Arrange
      const input: CreateWorkItemLinkInput = {
        source_id: 'wi-invalid',
        target_id: 'wi-2',
      };
      const client = createMockClient({
        data: null,
        error: { message: 'Foreign key constraint violation', code: '23503' },
      });

      // Act & Assert
      await expect(createWorkItemLink(client, input)).rejects.toThrow(
        'Foreign key constraint violation'
      );
    });
  });

  describe('deleteWorkItemLink', () => {
    it('should delete link by id', async () => {
      // Arrange
      const client = createMockClient({ data: null, error: null });

      // Act
      await deleteWorkItemLink(client, 'link-1');

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_item_links');
      expect(client.delete).toHaveBeenCalled();
      expect(client.eq).toHaveBeenCalledWith('id', 'link-1');
    });

    it('should throw an error when deletion fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Link not found', code: '404' },
      });

      // Act & Assert
      await expect(deleteWorkItemLink(client, 'non-existent')).rejects.toThrow('Link not found');
    });
  });
});
