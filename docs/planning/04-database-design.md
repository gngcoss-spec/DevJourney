# Database Design - DevJourney

## 1. ERD 개요

```
users (Supabase Auth)
  │
  ├── 1:N ── services
  │            │
  │            ├── 1:N ── work_items
  │            │            │
  │            │            ├── 1:N ── ai_sessions
  │            │            └── 1:N ── work_item_comments
  │            │
  │            └── 1:N ── dev_logs
  │
  └── (2차) servers, documents, teams
```

---

## 2. 테이블 설계

### 2.1 services

서비스(프로젝트) 정보. DevJourney의 최상위 단위.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users, NOT NULL | 소유자 |
| name | text | NOT NULL | 서비스명 |
| description | text | | 설명 |
| goal | text | | 목표 |
| target_users | text | | 주요 사용자 |
| current_stage | text | NOT NULL, DEFAULT 'idea' | 현재 단계 |
| current_server | text | | 현재 서버 |
| tech_stack | text[] | DEFAULT '{}' | 기술 스택 (배열) |
| ai_role | text | | AI 역할 정의 |
| status | text | NOT NULL, DEFAULT 'active' | active/stalled/paused |
| progress | integer | DEFAULT 0, CHECK 0-100 | 진행률 % |
| next_action | text | | 다음 액션 |
| last_activity_at | timestamptz | DEFAULT now() | 마지막 활동일 |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**인덱스:**
- `idx_services_user_id` ON user_id
- `idx_services_status` ON status

**RLS:**
- SELECT/INSERT/UPDATE/DELETE: `auth.uid() = user_id`

**단계 값:**
- idea, planning, design, development, testing, launch, enhancement

---

### 2.2 work_items

작업 + 의사결정 통합 엔티티. DevJourney의 핵심.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| service_id | uuid | FK → services(id) ON DELETE CASCADE, NOT NULL | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| title | text | NOT NULL | 제목 |
| description | text | | 설명 |
| type | text | NOT NULL, DEFAULT 'feature' | feature/bug/refactor/infra/ai-prompt |
| priority | text | NOT NULL, DEFAULT 'medium' | low/medium/high/urgent |
| status | text | NOT NULL, DEFAULT 'backlog' | backlog/ready/in-progress/review/done |
| assignee_id | uuid | FK → auth.users | 담당자 (2차) |
| problem | text | | 왜 필요한가 (Problem) |
| options | text | | 고려한 선택지 |
| decision_reason | text | | 최종 결정 이유 |
| result | text | | 결과 |
| position | integer | NOT NULL, DEFAULT 0 | Kanban 내 정렬 순서 |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**인덱스:**
- `idx_work_items_service_id` ON service_id
- `idx_work_items_status` ON status
- `idx_work_items_service_status` ON (service_id, status)

**RLS:**
- SELECT/INSERT/UPDATE/DELETE: `auth.uid() = user_id`

---

### 2.3 ai_sessions

Work Item에 연결된 AI 대화 세션.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| work_item_id | uuid | FK → work_items(id) ON DELETE CASCADE, NOT NULL | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| url | text | NOT NULL | AI 대화 URL |
| summary | text | NOT NULL | 한 줄 요약 |
| ai_provider | text | DEFAULT 'chatgpt' | chatgpt/gemini/claude/other |
| created_at | timestamptz | DEFAULT now() | |

**인덱스:**
- `idx_ai_sessions_work_item_id` ON work_item_id

**RLS:**
- SELECT/INSERT/UPDATE/DELETE: `auth.uid() = user_id`

---

### 2.4 dev_logs

일일 개발 로그.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| service_id | uuid | FK → services(id) ON DELETE CASCADE, NOT NULL | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| done | text | | 오늘 한 것 |
| decided | text | | 확정한 것 |
| deferred | text | | 보류한 것 |
| next_action | text | | 다음에 할 것 |
| log_date | date | NOT NULL, DEFAULT CURRENT_DATE | 로그 날짜 |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**인덱스:**
- `idx_dev_logs_service_id` ON service_id
- `idx_dev_logs_log_date` ON log_date
- `idx_dev_logs_service_date` ON (service_id, log_date) UNIQUE

**RLS:**
- SELECT/INSERT/UPDATE/DELETE: `auth.uid() = user_id`

**제약:**
- 같은 서비스에 같은 날짜에 하나의 로그만 (UNIQUE)

---

### 2.5 work_item_comments

Work Item 활동 로그 / 커멘트.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| work_item_id | uuid | FK → work_items(id) ON DELETE CASCADE, NOT NULL | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| content | text | NOT NULL | 내용 |
| type | text | NOT NULL, DEFAULT 'comment' | comment/status_change/system |
| metadata | jsonb | DEFAULT '{}' | 추가 데이터 (상태 변경 시 from/to 등) |
| created_at | timestamptz | DEFAULT now() | |

**인덱스:**
- `idx_comments_work_item_id` ON work_item_id

**RLS:**
- SELECT/INSERT/UPDATE/DELETE: `auth.uid() = user_id`

---

## 3. 2차 개발 테이블 (설계만)

### stages (Roadmap)
```sql
-- 서비스별 단계 정의
id, service_id, name, start_date, end_date, summary, order_index
```

### servers
```sql
-- 서버 관리
id, user_id, name, ip, description, status, last_activity_at
```

### decisions (별도 관리)
```sql
-- 독립 의사결정 기록
id, service_id, user_id, title, background, options, selected_option, reason, impact
```

### documents
```sql
-- 문서 관리
id, service_id, user_id, title, file_url, version, uploaded_at
```

### sprints
```sql
-- 스프린트 계획
id, user_id, name, start_date, end_date, goals, status
```

### sprint_items
```sql
-- 스프린트-서비스 연결
id, sprint_id, service_id, goal, status
```

---

## 4. 트리거 / 함수

### 자동 updated_at 갱신
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 모든 테이블에 적용
CREATE TRIGGER tr_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 서비스 last_activity_at 자동 갱신
```sql
-- work_items, dev_logs 변경 시 해당 서비스의 last_activity_at 업데이트
CREATE OR REPLACE FUNCTION update_service_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services SET last_activity_at = now()
  WHERE id = NEW.service_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 서비스 상태 자동 계산
```sql
-- 7일 이상 활동 없으면 'stalled'로 변경하는 cron job (Supabase Edge Function)
-- last_activity_at < now() - interval '7 days' → status = 'stalled'
```
