// @TASK P3-R3-T1 - Work item comments Supabase query functions tests
// @SPEC docs/planning/TASKS.md#work-item-comments-queries

import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getComments,
  createComment,
  createStatusChangeLog,
  type CreateCommentInput,
} from '@/lib/supabase/queries/comments';
import type { WorkItemComment } from '@/types/database';

// --- Mock helpers ---

function createMockComment(overrides: Partial<WorkItemComment> = {}): WorkItemComment {
  return {
    id: 'comment-1',
    work_item_id: 'wi-1',
    user_id: 'user-1',
    author_name: 'Test User',
    content: 'This is a test comment',
    comment_type: 'comment',
    metadata: null,
    created_at: '2026-02-11T00:00:00Z',
    updated_at: '2026-02-12T00:00:00Z',
    is_edited: false,
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
 *   - `await client.from().select().single()` (single resolves)
 *   - `await client.from().insert().select().single()` (single resolves)
 */
function createMockClient(terminateWith: { data: unknown; error: unknown }) {
  const mock: Record<string, unknown> = {};

  // Make mock thenable so `await mock.from().delete().eq()` works
  // when eq is the last call in the chain.
  mock.then = vi.fn((resolve: (value: unknown) => void) => resolve(terminateWith));

  mock.from = vi.fn(() => mock);
  mock.select = vi.fn(() => mock);
  mock.insert = vi.fn(() => mock);
  mock.eq = vi.fn(() => mock);
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
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };
}

// --- Tests ---

describe('Comments Query Functions', () => {
  describe('getComments', () => {
    it('should return all comments for a work item ordered by created_at ASC', async () => {
      // Arrange
      const mockComments = [
        createMockComment({
          id: 'comment-1',
          work_item_id: 'wi-1',
          content: 'First comment',
          created_at: '2026-02-11T10:00:00Z',
        }),
        createMockComment({
          id: 'comment-2',
          work_item_id: 'wi-1',
          content: 'Second comment',
          created_at: '2026-02-11T11:00:00Z',
        }),
      ];
      const client = createMockClient({ data: mockComments, error: null });

      // Act
      const result = await getComments(client, 'wi-1');

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_item_comments');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.eq).toHaveBeenCalledWith('work_item_id', 'wi-1');
      expect(client.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result).toEqual(mockComments);
    });

    it('should throw an error when query fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      // Act & Assert
      await expect(getComments(client, 'wi-1')).rejects.toThrow('Database error');
    });

    it('should return empty array when no comments exist', async () => {
      // Arrange
      const client = createMockClient({ data: [], error: null });

      // Act
      const result = await getComments(client, 'wi-1');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('createComment', () => {
    it('should create a new comment and return it', async () => {
      // Arrange
      const input: CreateCommentInput = {
        work_item_id: 'wi-1',
        author_name: 'John Doe',
        content: 'This is a new comment',
        comment_type: 'comment',
      };
      const createdComment = createMockComment({
        id: 'comment-new',
        work_item_id: 'wi-1',
        author_name: 'John Doe',
        content: 'This is a new comment',
        comment_type: 'comment',
      });
      const client = createMockClient({ data: createdComment, error: null });

      // Act
      const result = await createComment(client, input);

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_item_comments');
      expect(client.insert).toHaveBeenCalledWith({
        work_item_id: 'wi-1',
        user_id: 'user-1',
        author_name: 'John Doe',
        content: 'This is a new comment',
        comment_type: 'comment',
        metadata: {},
      });
      expect(client.select).toHaveBeenCalled();
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(createdComment);
    });

    it('should create a comment with default comment_type and metadata', async () => {
      // Arrange
      const input: CreateCommentInput = {
        work_item_id: 'wi-1',
        author_name: 'Jane Doe',
        content: 'Minimal comment',
      };
      const createdComment = createMockComment({
        id: 'comment-min',
        author_name: 'Jane Doe',
        content: 'Minimal comment',
        comment_type: 'comment',
        metadata: {},
      });
      const client = createMockClient({ data: createdComment, error: null });

      // Act
      const result = await createComment(client, input);

      // Assert
      expect(client.insert).toHaveBeenCalledWith({
        work_item_id: 'wi-1',
        user_id: 'user-1',
        author_name: 'Jane Doe',
        content: 'Minimal comment',
        comment_type: 'comment',
        metadata: {},
      });
      expect(result).toEqual(createdComment);
    });

    it('should create a comment with custom metadata', async () => {
      // Arrange
      const customMetadata = { custom_field: 'custom_value' };
      const input: CreateCommentInput = {
        work_item_id: 'wi-1',
        author_name: 'Test User',
        content: 'Comment with metadata',
        metadata: customMetadata,
      };
      const createdComment = createMockComment({
        id: 'comment-meta',
        content: 'Comment with metadata',
        metadata: customMetadata,
      });
      const client = createMockClient({ data: createdComment, error: null });

      // Act
      const result = await createComment(client, input);

      // Assert
      expect(client.insert).toHaveBeenCalledWith({
        work_item_id: 'wi-1',
        user_id: 'user-1',
        author_name: 'Test User',
        content: 'Comment with metadata',
        comment_type: 'comment',
        metadata: customMetadata,
      });
      expect(result).toEqual(createdComment);
    });

    it('should throw an error when creation fails', async () => {
      // Arrange
      const input: CreateCommentInput = {
        work_item_id: 'wi-1',
        author_name: 'Fail User',
        content: 'This will fail',
      };
      const client = createMockClient({
        data: null,
        error: { message: 'Foreign key constraint violation', code: '23503' },
      });

      // Act & Assert
      await expect(createComment(client, input)).rejects.toThrow(
        'Foreign key constraint violation'
      );
    });
  });

  describe('createStatusChangeLog', () => {
    it('should create a status_change comment with correct metadata', async () => {
      // Arrange
      const createdLog = createMockComment({
        id: 'comment-status',
        work_item_id: 'wi-1',
        author_name: 'System',
        content: 'Status changed from backlog to ready',
        comment_type: 'status_change',
        metadata: {
          from_status: 'backlog',
          to_status: 'ready',
        },
      });
      const client = createMockClient({ data: createdLog, error: null });

      // Act
      const result = await createStatusChangeLog(client, 'wi-1', 'backlog', 'ready');

      // Assert
      expect(client.from).toHaveBeenCalledWith('work_item_comments');
      expect(client.insert).toHaveBeenCalledWith({
        work_item_id: 'wi-1',
        user_id: 'user-1',
        author_name: 'System',
        content: 'Status changed from backlog to ready',
        comment_type: 'status_change',
        metadata: {
          from_status: 'backlog',
          to_status: 'ready',
        },
      });
      expect(client.select).toHaveBeenCalled();
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(createdLog);
    });

    it('should create a status_change log with different status values', async () => {
      // Arrange
      const createdLog = createMockComment({
        id: 'comment-status-2',
        content: 'Status changed from in-progress to review',
        comment_type: 'status_change',
        metadata: {
          from_status: 'in-progress',
          to_status: 'review',
        },
      });
      const client = createMockClient({ data: createdLog, error: null });

      // Act
      const result = await createStatusChangeLog(client, 'wi-1', 'in-progress', 'review');

      // Assert
      expect(client.insert).toHaveBeenCalledWith({
        work_item_id: 'wi-1',
        user_id: 'user-1',
        author_name: 'System',
        content: 'Status changed from in-progress to review',
        comment_type: 'status_change',
        metadata: {
          from_status: 'in-progress',
          to_status: 'review',
        },
      });
      expect(result).toEqual(createdLog);
    });

    it('should throw an error when status change log creation fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Work item not found', code: '23503' },
      });

      // Act & Assert
      await expect(
        createStatusChangeLog(client, 'non-existent', 'backlog', 'ready')
      ).rejects.toThrow('Work item not found');
    });
  });
});
