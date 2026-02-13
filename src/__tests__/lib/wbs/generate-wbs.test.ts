import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateWBS } from '@/lib/wbs/generate-wbs';
import type { WBSStageTemplate } from '@/lib/wbs/wbs-templates';

vi.mock('@/lib/supabase/queries/auth-helper', () => ({
  getAuthUser: vi.fn(() => Promise.resolve({ id: 'user-1' })),
}));

// Minimal template for focused testing
const MINI_TEMPLATE: WBSStageTemplate[] = [
  {
    stage_name: 'idea',
    summary: 'Test stage',
    deliverables: ['deliverable-1'],
    work_items: [
      { title: 'WI-1', description: 'desc', type: 'feature', priority: 'high' },
    ],
    decisions: [
      { title: 'DEC-1', background: 'bg' },
    ],
    documents: [
      { title: 'DOC-1', description: 'desc', doc_type: 'planning' },
    ],
  },
  {
    stage_name: 'planning',
    summary: 'Test stage 2',
    deliverables: ['deliverable-2'],
    work_items: [
      { title: 'WI-2', description: 'desc2', type: 'infra', priority: 'medium' },
    ],
    decisions: [],
    documents: [],
  },
];

function createMockClient() {
  const insertMock = vi.fn();
  const fromMock = vi.fn(() => ({ insert: insertMock }));
  insertMock.mockResolvedValue({ error: null });

  return {
    client: { from: fromMock, auth: { getUser: vi.fn() } } as any,
    fromMock,
    insertMock,
  };
}

describe('generateWBS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should insert stages, work items, decisions, and documents', async () => {
    const { client, fromMock, insertMock } = createMockClient();

    const result = await generateWBS(client, 'service-1', MINI_TEMPLATE);

    expect(result).toEqual({
      stages: 2,
      workItems: 2,
      decisions: 1,
      documents: 1,
    });

    // Verify all 4 tables were called
    const calledTables = fromMock.mock.calls.map((c: any[]) => c[0]);
    expect(calledTables).toContain('stages');
    expect(calledTables).toContain('work_items');
    expect(calledTables).toContain('decisions');
    expect(calledTables).toContain('documents');

    // Verify insert was called 4 times (one per table)
    expect(insertMock).toHaveBeenCalledTimes(4);
  });

  it('should set correct user_id and service_id on all rows', async () => {
    const { client, insertMock } = createMockClient();

    await generateWBS(client, 'svc-42', MINI_TEMPLATE);

    // Check all insert calls for user_id and service_id
    for (const call of insertMock.mock.calls) {
      const rows = call[0];
      const rowArray = Array.isArray(rows) ? rows : [rows];
      for (const row of rowArray) {
        expect(row.user_id).toBe('user-1');
        expect(row.service_id).toBe('svc-42');
      }
    }
  });

  it('should assign sequential sort_order to work items', async () => {
    const { client, fromMock, insertMock } = createMockClient();

    await generateWBS(client, 'service-1', MINI_TEMPLATE);

    // Find the work_items insert call
    const wiCallIndex = fromMock.mock.calls.findIndex((c: any[]) => c[0] === 'work_items');
    const wiRows = insertMock.mock.calls[wiCallIndex][0];

    expect(wiRows[0].sort_order).toBe(0);
    expect(wiRows[1].sort_order).toBe(1);
  });

  it('should set all work items to backlog status', async () => {
    const { client, fromMock, insertMock } = createMockClient();

    await generateWBS(client, 'service-1', MINI_TEMPLATE);

    const wiCallIndex = fromMock.mock.calls.findIndex((c: any[]) => c[0] === 'work_items');
    const wiRows = insertMock.mock.calls[wiCallIndex][0];

    for (const row of wiRows) {
      expect(row.status).toBe('backlog');
    }
  });

  it('should throw on stage insert failure', async () => {
    const { client, insertMock } = createMockClient();
    insertMock.mockResolvedValueOnce({ error: { message: 'duplicate key' } });

    await expect(generateWBS(client, 'service-1', MINI_TEMPLATE))
      .rejects.toThrow('WBS stages 생성 실패: duplicate key');
  });

  it('should skip empty decisions/documents arrays without error', async () => {
    const templateNoExtras: WBSStageTemplate[] = [
      {
        stage_name: 'idea',
        summary: 'Test',
        deliverables: [],
        work_items: [
          { title: 'WI', description: 'd', type: 'feature', priority: 'low' },
        ],
        decisions: [],
        documents: [],
      },
    ];

    const { client, fromMock, insertMock } = createMockClient();

    const result = await generateWBS(client, 'service-1', templateNoExtras);

    expect(result.decisions).toBe(0);
    expect(result.documents).toBe(0);

    // Only stages and work_items should be inserted (decisions/documents skipped)
    const calledTables = fromMock.mock.calls.map((c: any[]) => c[0]);
    expect(calledTables).toContain('stages');
    expect(calledTables).toContain('work_items');
    expect(calledTables).not.toContain('decisions');
    expect(calledTables).not.toContain('documents');
    expect(insertMock).toHaveBeenCalledTimes(2);
  });
});
