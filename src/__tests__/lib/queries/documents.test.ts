import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from '@/lib/supabase/queries/documents';
import type { Document, CreateDocumentInput, UpdateDocumentInput } from '@/types/database';

function createMockDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc-1',
    service_id: 'svc-1',
    user_id: 'user-1',
    title: 'API Specification',
    description: 'REST API spec for v1',
    doc_type: 'api',
    file_url: null,
    external_url: 'https://docs.example.com/api',
    version: '1.0',
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

describe('Documents Query Functions', () => {
  describe('getDocuments', () => {
    it('should return all documents for a service', async () => {
      const mockDocs = [
        createMockDocument({ id: 'doc-1' }),
        createMockDocument({ id: 'doc-2', title: 'ERD' }),
      ];
      const client = createMockClient({ data: mockDocs, error: null });

      const result = await getDocuments(client, 'svc-1');

      expect(client.from).toHaveBeenCalledWith('documents');
      expect(client.select).toHaveBeenCalledWith('*');
      expect(client.eq).toHaveBeenCalledWith('service_id', 'svc-1');
      expect(client.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockDocs);
    });

    it('should throw an error when query fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      await expect(getDocuments(client, 'svc-1')).rejects.toThrow('Database error');
    });

    it('should return empty array when no documents exist', async () => {
      const client = createMockClient({ data: [], error: null });

      const result = await getDocuments(client, 'svc-1');

      expect(result).toEqual([]);
    });
  });

  describe('getDocumentById', () => {
    it('should return a single document by id', async () => {
      const mockDoc = createMockDocument({ id: 'doc-1' });
      const client = createMockClient({ data: mockDoc, error: null });

      const result = await getDocumentById(client, 'doc-1');

      expect(client.from).toHaveBeenCalledWith('documents');
      expect(client.eq).toHaveBeenCalledWith('id', 'doc-1');
      expect(client.single).toHaveBeenCalled();
      expect(result).toEqual(mockDoc);
    });

    it('should return null when not found (PGRST116)', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });

      const result = await getDocumentById(client, 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createDocument', () => {
    it('should create a new document and return it', async () => {
      const input: CreateDocumentInput = {
        service_id: 'svc-1',
        title: 'New Document',
        doc_type: 'planning',
      };
      const createdDoc = createMockDocument({ title: 'New Document', doc_type: 'planning' });
      const client = createMockClient({ data: createdDoc, error: null });

      const result = await createDocument(client, input);

      expect(client.from).toHaveBeenCalledWith('documents');
      expect(client.insert).toHaveBeenCalledWith({ ...input, user_id: 'user-1' });
      expect(result).toEqual(createdDoc);
    });

    it('should throw an error when creation fails', async () => {
      const input: CreateDocumentInput = { service_id: 'svc-1', title: 'Fail' };
      const client = createMockClient({
        data: null,
        error: { message: 'Insert failed', code: '500' },
      });

      await expect(createDocument(client, input)).rejects.toThrow('Insert failed');
    });
  });

  describe('updateDocument', () => {
    it('should update a document and return it', async () => {
      const updateData: UpdateDocumentInput = { title: 'Updated Title' };
      const updatedDoc = createMockDocument({ title: 'Updated Title' });
      const client = createMockClient({ data: updatedDoc, error: null });

      const result = await updateDocument(client, 'doc-1', updateData);

      expect(client.from).toHaveBeenCalledWith('documents');
      expect(client.update).toHaveBeenCalledWith(updateData);
      expect(client.eq).toHaveBeenCalledWith('id', 'doc-1');
      expect(result).toEqual(updatedDoc);
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document by id', async () => {
      const client = createMockClient({ data: null, error: null });

      await deleteDocument(client, 'doc-1');

      expect(client.from).toHaveBeenCalledWith('documents');
      expect(client.delete).toHaveBeenCalled();
      expect(client.eq).toHaveBeenCalledWith('id', 'doc-1');
    });

    it('should throw an error when deletion fails', async () => {
      const client = createMockClient({
        data: null,
        error: { message: 'Delete failed', code: '500' },
      });

      await expect(deleteDocument(client, 'doc-1')).rejects.toThrow('Delete failed');
    });
  });
});
