---
description: 에이전트 생성, 유지, 종료 규칙
---

## DevJourney 에이전트 생명주기

### 에이전트 목록
- `backend-specialist`: Supabase 쿼리/RLS/마이그레이션
- `frontend-specialist`: Next.js UI/shadcn/TanStack Query
- `database-specialist`: PostgreSQL 스키마/마이그레이션
- `test-specialist`: Vitest/RTL/Playwright

### 생명주기 규칙

1. **생성**: 오케스트레이터가 Task 도구로 호출
2. **실행**: Phase 기반 Worktree에서 작업
3. **보고**: 완료 시 Handoff 형식으로 결과 전달
4. **종료**: 사용자 승인 후 Worktree 정리

### Phase 전환 규칙
- Phase N 완료 → main 병합 → Phase N+1 시작
- 병렬 작업: 같은 Phase 내 독립 태스크만
- 병합 충돌 시: 오케스트레이터가 조율
