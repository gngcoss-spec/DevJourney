// Supabase 데이터베이스 타입 정의
// 실제 마이그레이션 후 `supabase gen types typescript` 명령으로 자동 생성 교체 예정

export type ServiceStatus = 'active' | 'stalled' | 'paused';
export type ServiceStage = 'idea' | 'planning' | 'design' | 'development' | 'testing' | 'launch' | 'enhancement';
export type WorkItemType = 'feature' | 'bug' | 'refactor' | 'infra' | 'ai-prompt';
export type WorkItemPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WorkItemStatus = 'backlog' | 'ready' | 'in-progress' | 'review' | 'done';
export type AIProvider = 'chatgpt' | 'gemini' | 'claude' | 'other';
export type CommentType = 'comment' | 'status_change' | 'system';

export interface TechStack {
  frontend?: string[];
  backend?: string[];
  ai_engine?: string[];
  visualization?: string[];
  security?: string[];
  integration?: string[];
  deployment?: string[];
}

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
  due_date: string | null;
  labels: string[];
  assignee_id: string | null;
  story_points: number | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CreateWorkItemInput = Pick<WorkItem, 'service_id' | 'title'> & Partial<Pick<WorkItem, 'description' | 'type' | 'priority' | 'status' | 'problem' | 'options_considered' | 'decision_reason' | 'result' | 'assignee_name' | 'sort_order' | 'due_date' | 'labels' | 'assignee_id' | 'story_points' | 'parent_id'>>;

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
  updated_at: string;
  is_edited: boolean;
}

export type CreateCommentInput = Pick<WorkItemComment, 'work_item_id' | 'author_name' | 'content'> & Partial<Pick<WorkItemComment, 'comment_type' | 'metadata'>>;

export type UpdateCommentInput = Pick<WorkItemComment, 'content'>;

// --- Work Item Links ---

export type LinkType = 'blocks' | 'relates_to' | 'duplicates';

export interface WorkItemLink {
  id: string;
  source_id: string;
  target_id: string;
  link_type: LinkType;
  user_id: string;
  created_at: string;
}

export type CreateWorkItemLinkInput = Pick<WorkItemLink, 'source_id' | 'target_id'> & Partial<Pick<WorkItemLink, 'link_type'>>;

// --- Decisions ---

export interface Decision {
  id: string;
  service_id: string;
  user_id: string;
  title: string;
  background: string | null;
  options: Record<string, unknown>[];
  selected_option: string | null;
  reason: string | null;
  impact: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateDecisionInput = Pick<Decision, 'service_id' | 'title'> & Partial<Pick<Decision, 'background' | 'options' | 'selected_option' | 'reason' | 'impact'>>;

export type UpdateDecisionInput = Partial<Omit<Decision, 'id' | 'user_id' | 'service_id' | 'created_at' | 'updated_at'>>;

// --- Stages (Roadmap) ---

export interface Stage {
  id: string;
  service_id: string;
  user_id: string;
  stage_name: ServiceStage;
  start_date: string | null;
  end_date: string | null;
  summary: string | null;
  deliverables: string[];
  created_at: string;
  updated_at: string;
}

export type CreateStageInput = Pick<Stage, 'service_id' | 'stage_name'> & Partial<Pick<Stage, 'start_date' | 'end_date' | 'summary' | 'deliverables'>>;

export type UpdateStageInput = Partial<Omit<Stage, 'id' | 'user_id' | 'service_id' | 'created_at' | 'updated_at'>>;

// --- Documents ---

export type DocType = 'planning' | 'database' | 'api' | 'prompt' | 'erd' | 'architecture' | 'other';

export interface Document {
  id: string;
  service_id: string;
  user_id: string;
  title: string;
  description: string | null;
  doc_type: DocType;
  file_url: string | null;
  external_url: string | null;
  version: string;
  created_at: string;
  updated_at: string;
}

export type CreateDocumentInput = Pick<Document, 'service_id' | 'title'> & Partial<Pick<Document, 'description' | 'doc_type' | 'file_url' | 'external_url' | 'version'>>;

export type UpdateDocumentInput = Partial<Omit<Document, 'id' | 'user_id' | 'service_id' | 'created_at' | 'updated_at'>>;

// --- Servers ---

export type ServerStatus = 'active' | 'maintenance' | 'offline';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Server {
  id: string;
  user_id: string;
  name: string;
  ip: string | null;
  description: string | null;
  purpose: string | null;
  status: ServerStatus;
  risk_level: RiskLevel;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export type CreateServerInput = Pick<Server, 'name'> & Partial<Pick<Server, 'ip' | 'description' | 'purpose' | 'status' | 'risk_level'>>;

export type UpdateServerInput = Partial<Omit<Server, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// --- Team Members ---

export type TeamRole = 'owner' | 'contributor' | 'viewer';
export type MemberStatus = 'active' | 'invited' | 'inactive';

export interface TeamMember {
  id: string;
  user_id: string;
  invited_by: string | null;
  display_name: string;
  email: string | null;
  role: TeamRole;
  status: MemberStatus;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateTeamMemberInput = Pick<TeamMember, 'display_name'> & Partial<Pick<TeamMember, 'email' | 'role' | 'status'>>;

export type UpdateTeamMemberInput = Partial<Omit<TeamMember, 'id' | 'user_id' | 'invited_by' | 'created_at' | 'updated_at'>>;
