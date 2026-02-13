import { describe, it, expect } from 'vitest';
import { DEFAULT_WBS_TEMPLATE, getWBSTemplateSummary } from '@/lib/wbs/wbs-templates';

describe('WBS Templates', () => {
  it('should have 7 stages covering the full development lifecycle', () => {
    expect(DEFAULT_WBS_TEMPLATE).toHaveLength(7);

    const stageNames = DEFAULT_WBS_TEMPLATE.map((s) => s.stage_name);
    expect(stageNames).toEqual([
      'idea',
      'planning',
      'design',
      'development',
      'testing',
      'launch',
      'enhancement',
    ]);
  });

  it('should have work items for every stage', () => {
    for (const stage of DEFAULT_WBS_TEMPLATE) {
      expect(stage.work_items.length).toBeGreaterThan(0);
    }
  });

  it('should have valid work item types and priorities', () => {
    const validTypes = ['feature', 'bug', 'refactor', 'infra', 'ai-prompt'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];

    for (const stage of DEFAULT_WBS_TEMPLATE) {
      for (const wi of stage.work_items) {
        expect(validTypes).toContain(wi.type);
        expect(validPriorities).toContain(wi.priority);
        expect(wi.title).toBeTruthy();
        expect(wi.description).toBeTruthy();
      }
    }
  });

  it('should have documents for every stage', () => {
    for (const stage of DEFAULT_WBS_TEMPLATE) {
      expect(stage.documents.length).toBeGreaterThan(0);
    }
  });

  it('should have valid document types', () => {
    const validDocTypes = ['planning', 'database', 'api', 'prompt', 'erd', 'architecture', 'other'];

    for (const stage of DEFAULT_WBS_TEMPLATE) {
      for (const doc of stage.documents) {
        expect(validDocTypes).toContain(doc.doc_type);
        expect(doc.title).toBeTruthy();
      }
    }
  });

  it('should have deliverables for every stage', () => {
    for (const stage of DEFAULT_WBS_TEMPLATE) {
      expect(stage.deliverables.length).toBeGreaterThan(0);
      expect(stage.summary).toBeTruthy();
    }
  });

  it('should return correct summary counts', () => {
    const summary = getWBSTemplateSummary();

    expect(summary.stages).toBe(7);
    expect(summary.workItems).toBeGreaterThanOrEqual(20);
    expect(summary.decisions).toBeGreaterThanOrEqual(5);
    expect(summary.documents).toBeGreaterThanOrEqual(7);
  });
});
