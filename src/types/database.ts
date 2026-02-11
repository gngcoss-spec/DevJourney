// Supabase 데이터베이스 타입 정의
// 실제 마이그레이션 후 `supabase gen types typescript` 명령으로 자동 생성 교체 예정

export type ServiceStatus = 'active' | 'stalled' | 'paused';
export type ServiceStage = 'idea' | 'planning' | 'design' | 'development' | 'testing' | 'launch' | 'enhancement';
export type WorkItemType = 'feature' | 'bug' | 'refactor' | 'infra' | 'ai-prompt';
export type WorkItemPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WorkItemStatus = 'backlog' | 'ready' | 'in-progress' | 'review' | 'done';
export type AIProvider = 'chatgpt' | 'gemini' | 'claude' | 'other';
export type CommentType = 'comment' | 'status_change' | 'system';

// @TASK P2-R1-T1 - Service interface updated with new fields
// @SPEC docs/planning/TASKS.md#services-table
export interface Service {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  goal: string | null;
  target_users: string | null;
  current_stage: ServiceStage;
  current_server: string | null;
  tech_stack: string[];
  ai_role: string | null;
  status: ServiceStatus;
  progress: number;
  next_action: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export type CreateServiceInput = Pick<Service, 'name'> & Partial<Pick<Service, 'description' | 'goal' | 'target_users' | 'current_stage' | 'current_server' | 'tech_stack' | 'ai_role' | 'status' | 'progress' | 'next_action'>>;

export type UpdateServiceInput = Partial<Omit<Service, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_activity_at'>>;

// @TASK P3-R1-T1 - Work item interface with decision tracking fields
// @SPEC docs/planning/TASKS.md#work-items-table
export interface WorkItem {
  id: string;
  service_id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: WorkItemType;
  priority: WorkItemPriority;
  status: WorkItemStatus;
  problem: string | null;
  options_considered: string | null;
  decision_reason: string | null;
  result: string | null;
  assignee_name: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CreateWorkItemInput = Pick<WorkItem, 'service_id' | 'title'> & Partial<Pick<WorkItem, 'description' | 'type' | 'priority' | 'status' | 'problem' | 'options_considered' | 'decision_reason' | 'result' | 'assignee_name' | 'sort_order'>>;

export type UpdateWorkItemInput = Partial<Omit<WorkItem, 'id' | 'user_id' | 'service_id' | 'created_at' | 'updated_at'>>;

// @TASK P3-R2-T1 - AI Session interface updated with user_id
// @SPEC docs/planning/TASKS.md#ai-sessions-table
export interface AISession {
  id: string;
  work_item_id: string;
  user_id: string;
  provider: AIProvider;
  session_url: string | null;
  title: string;
  summary: string | null;
  key_decisions: string | null;
  created_at: string;
}

export type CreateAISessionInput = Pick<AISession, 'work_item_id' | 'title'> & Partial<Pick<AISession, 'provider' | 'session_url' | 'summary' | 'key_decisions'>>;

// @TASK P4-R1-T1 - Dev Log interface with user tracking
// @SPEC docs/planning/TASKS.md#dev-logs-table
export interface DevLog {
  id: string;
  service_id: string;
  user_id: string;
  log_date: string;
  done: string | null;
  decided: string | null;
  deferred: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateDevLogInput = Pick<DevLog, 'service_id'> & Partial<Pick<DevLog, 'done' | 'decided' | 'deferred' | 'next_action' | 'log_date'>>;

export type UpdateDevLogInput = Partial<Pick<DevLog, 'done' | 'decided' | 'deferred' | 'next_action'>>;

// @TASK P3-R3-T1 - Work item comments interface with user tracking
// @SPEC docs/planning/TASKS.md#work-item-comments-table
export interface WorkItemComment {
  id: string;
  work_item_id: string;
  user_id: string;
  author_name: string;
  content: string;
  comment_type: CommentType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type CreateCommentInput = Pick<WorkItemComment, 'work_item_id' | 'author_name' | 'content'> & Partial<Pick<WorkItemComment, 'comment_type' | 'metadata'>>;
