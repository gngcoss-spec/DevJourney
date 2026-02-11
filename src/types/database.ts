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

export interface WorkItem {
  id: string;
  service_id: string;
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

export interface AISession {
  id: string;
  work_item_id: string;
  provider: AIProvider;
  session_url: string | null;
  title: string;
  summary: string | null;
  key_decisions: string | null;
  created_at: string;
}

export interface DevLog {
  id: string;
  service_id: string;
  log_date: string;
  done: string | null;
  decided: string | null;
  deferred: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkItemComment {
  id: string;
  work_item_id: string;
  author_name: string;
  content: string;
  comment_type: CommentType;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
