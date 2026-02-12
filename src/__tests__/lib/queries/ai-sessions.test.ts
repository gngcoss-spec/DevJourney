// @TASK P3-R2-T1 - AI Sessions Supabase query functions tests
// @SPEC docs/planning/TASKS.md#ai-sessions-queries

import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getAISessions,
  createAISession,
  deleteAISession,
} from '@/lib/supabase/queries/ai-sessions';
import type { AISession, CreateAISessionInput } from '@/types/database';

// --- Mock helpers ---

function createMockAISession(overrides: Partial<AISession> = {}): AISession {
  return {
    id: 'ai-session-1',
    work_item_id: 'work-item-1',
    user_id: 'user-1',
    provider: 'chatgpt',
    session_url: 'https://chatgpt.com/session-1',
    title: 'Session Title',
    summary: null,
    key_decisions: null,
    created_at: '2026-02-11T00:00:00Z',
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
  mock.delete = vi.fn(() => mock);
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
    delete: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  };
}

// --- Tests ---

describe('AI Sessions Query Functions', () => {
  describe('getAISessions', () => {
    it('should return all AI sessions for a work item ordered by created_at DESC', async () => {
      // Arrange
      const mockSessions = [
        createMockAISession({
          id: 'ai-session-1',
          title: 'Session 1',
          created_at: '2026-02-11T10:00:00Z',
        }),
        createMockAISession({
          id: 'ai-session-2',
          title: 'Session 2',
          created_at: '2026-02-10T10:00:00Z',
        }),
      ];
      const client = createMockClient({ data: mockSessions, error: null });

      // Act
      const result = await getAISessions(client, 'work-item-1');

      // Assert
      expect(client.from).toHaveBeenCalledWith('ai_sessions');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.eq).toHaveBeenCalledWith('work_item_id', 'work-item-1');
      expect(client.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockSessions);
    });

    it('should throw an error when query fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      // Act & Assert
      await expect(getAISessions(client, 'work-item-1')).rejects.toThrow('Database error');
    });

    it('should return empty array when no AI sessions exist', async () => {
      // Arrange
      const client = createMockClient({ data: [], error: null });

      // Act
      const result = await getAISessions(client, 'work-item-1');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('createAISession', () => {
    it('should create a new AI session and return it', async () => {
      // Arrange
      const input: CreateAISessionInput = {
        work_item_id: 'work-item-1',
        title: 'New Session',
        provider: 'claude',
        session_url: 'https://claude.ai/session-1',
        summary: 'Session summary',
      };
      const createdSession = createMockAISession({
        id: 'ai-session-new',
        work_item_id: 'work-item-1',
        title: 'New Session',
        provider: 'claude',
        session_url: 'https://claude.ai/session-1',
        summary: 'Session summary',
      });
      const client = createMockClient({ data: createdSession, error: null });

      // Act
      const result = await createAISession(client, input);

      // Assert
      expect(client.from).toHaveBeenCalledWith('ai_sessions');
      expect(client.insert).toHaveBeenCalledWith({ ...input, user_id: 'user-1' });
      expect(client.select).toHaveBeenCalled();
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(createdSession);
    });

    it('should create an AI session with only required fields', async () => {
      // Arrange
      const input: CreateAISessionInput = {
        work_item_id: 'work-item-1',
        title: 'Minimal Session',
      };
      const createdSession = createMockAISession({
        id: 'ai-session-min',
        work_item_id: 'work-item-1',
        title: 'Minimal Session',
        provider: 'chatgpt',
      });
      const client = createMockClient({ data: createdSession, error: null });

      // Act
      const result = await createAISession(client, input);

      // Assert
      expect(client.insert).toHaveBeenCalledWith({ ...input, user_id: 'user-1' });
      expect(result).toEqual(createdSession);
    });

    it('should throw an error when creation fails', async () => {
      // Arrange
      const input: CreateAISessionInput = {
        work_item_id: 'work-item-1',
        title: 'Fail Session',
      };
      const client = createMockClient({
        data: null,
        error: { message: 'Foreign key violation', code: '23503' },
      });

      // Act & Assert
      await expect(createAISession(client, input)).rejects.toThrow('Foreign key violation');
    });
  });

  describe('deleteAISession', () => {
    it('should delete an AI session by id', async () => {
      // Arrange
      const client = createMockClient({ data: null, error: null });

      // Act
      await deleteAISession(client, 'ai-session-1');

      // Assert
      expect(client.from).toHaveBeenCalledWith('ai_sessions');
      expect(client.delete).toHaveBeenCalled();
      expect(client.eq).toHaveBeenCalledWith('id', 'ai-session-1');
    });

    it('should throw an error when deletion fails', async () => {
      // Arrange
      const client = createMockClient({
        data: null,
        error: { message: 'Permission denied', code: '403' },
      });

      // Act & Assert
      await expect(deleteAISession(client, 'ai-session-1')).rejects.toThrow('Permission denied');
    });

    it('should not return any data on successful deletion', async () => {
      // Arrange
      const client = createMockClient({ data: null, error: null });

      // Act
      const result = await deleteAISession(client, 'ai-session-1');

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
