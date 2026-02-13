import { SupabaseClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/supabase/queries/auth-helper';
import { DEFAULT_WBS_TEMPLATE, type WBSStageTemplate } from './wbs-templates';

export interface GenerateWBSResult {
  stages: number;
  workItems: number;
  decisions: number;
  documents: number;
}

/**
 * Generate a full WBS (Work Breakdown Structure) for a service.
 * Creates stages (roadmap), work items (kanban), decisions, and documents
 * all linked to the given service.
 *
 * Uses bulk inserts for performance. Auth user is resolved once and reused.
 */
export async function generateWBS(
  client: SupabaseClient,
  serviceId: string,
  template: WBSStageTemplate[] = DEFAULT_WBS_TEMPLATE
): Promise<GenerateWBSResult> {
  const user = await getAuthUser(client);
  const userId = user.id;

  // ── 1. Bulk insert stages ──
  const stageRows = template.map((t) => ({
    service_id: serviceId,
    user_id: userId,
    stage_name: t.stage_name,
    summary: t.summary,
    deliverables: t.deliverables,
  }));

  const { error: stageError } = await client
    .from('stages')
    .insert(stageRows);

  if (stageError) {
    throw new Error(`WBS stages 생성 실패: ${stageError.message}`);
  }

  // ── 2. Bulk insert work items ──
  let sortOrder = 0;
  const workItemRows = template.flatMap((t) =>
    t.work_items.map((wi) => ({
      service_id: serviceId,
      user_id: userId,
      title: wi.title,
      description: wi.description,
      type: wi.type,
      priority: wi.priority,
      status: 'backlog' as const,
      sort_order: sortOrder++,
    }))
  );

  if (workItemRows.length > 0) {
    const { error: wiError } = await client
      .from('work_items')
      .insert(workItemRows);

    if (wiError) {
      throw new Error(`WBS work items 생성 실패: ${wiError.message}`);
    }
  }

  // ── 3. Bulk insert decisions ──
  const decisionRows = template.flatMap((t) =>
    t.decisions.map((d) => ({
      service_id: serviceId,
      user_id: userId,
      title: d.title,
      background: d.background,
      options: [],
    }))
  );

  if (decisionRows.length > 0) {
    const { error: decError } = await client
      .from('decisions')
      .insert(decisionRows);

    if (decError) {
      throw new Error(`WBS decisions 생성 실패: ${decError.message}`);
    }
  }

  // ── 4. Bulk insert documents ──
  const documentRows = template.flatMap((t) =>
    t.documents.map((doc) => ({
      service_id: serviceId,
      user_id: userId,
      title: doc.title,
      description: doc.description,
      doc_type: doc.doc_type,
    }))
  );

  if (documentRows.length > 0) {
    const { error: docError } = await client
      .from('documents')
      .insert(documentRows);

    if (docError) {
      throw new Error(`WBS documents 생성 실패: ${docError.message}`);
    }
  }

  return {
    stages: stageRows.length,
    workItems: workItemRows.length,
    decisions: decisionRows.length,
    documents: documentRows.length,
  };
}
