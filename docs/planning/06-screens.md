# Screens - DevJourney

> 이 문서는 /screen-spec의 입력으로 사용됩니다.

---

## 화면 목록

### 1. 로그인 (/login)
- **진입**: 미인증 사용자 → 자동 리다이렉트
- **요소**: 이메일 입력, 비밀번호 입력, 로그인 버튼, 회원가입 링크
- **액션**: 로그인 → Dashboard 이동
- **이동**: 회원가입 → /signup
- **인증**: 불필요

### 2. 회원가입 (/signup)
- **진입**: 로그인 화면에서 링크 클릭
- **요소**: 이메일 입력, 비밀번호 입력, 비밀번호 확인, 가입 버튼, 로그인 링크
- **액션**: 가입 → 로그인 화면으로 (이메일 인증 후)
- **이동**: 로그인 → /login
- **인증**: 불필요

### 3. Dashboard (/)
- **진입**: 로그인 성공, 사이드바 Dashboard 클릭
- **요소**:
  - **요약 카드 영역**: 전체 서비스 수, 진행중, 정체, 중단 위험 (4개 카드)
  - **마일스톤 그래프**: 전체 서비스의 진행률 그래프 (Recharts)
  - **서비스 카드 목록**: 각 카드에 (서비스명, 상태색상, 진행률%, 현재단계, 마지막활동일, 다음액션)
  - **통합 로그 탭**: 모든 서비스의 최근 Dev Log를 타임라인으로 표시
- **액션**: 서비스 카드 클릭 → Service Detail
- **이동**: 서비스 카드 → /services/[id], 사이드바 Services → /services
- **인증**: 필수

### 4. Services 목록 (/services)
- **진입**: 사이드바 "Services" 클릭
- **요소**: 서비스 테이블/카드 목록, "새 서비스" 버튼, 검색/필터
- **액션**: 서비스 클릭 → Service Detail, "새 서비스" → 등록 폼
- **이동**: 서비스 행 클릭 → /services/[id], "새 서비스" → /services/new
- **인증**: 필수

### 5. Service 등록/편집 (/services/new, /services/[id]/edit)
- **진입**: Services 목록에서 "새 서비스" 버튼, 또는 Service Detail에서 편집 버튼
- **요소**: 8개 필드 폼
  - 서비스명 (필수, text)
  - 설명 (textarea)
  - 목표 (textarea)
  - 주요 사용자 (text)
  - 현재 단계 (select: idea/planning/design/development/testing/launch/enhancement)
  - 현재 서버 (text)
  - 기술 스택 (tag 입력)
  - AI 역할 정의 (textarea)
- **액션**: 저장 → Services 목록으로 이동, 취소 → 이전 화면
- **유효성**: 서비스명 필수
- **인증**: 필수

### 6. Service Detail - Overview (/services/[id])
- **진입**: Dashboard 서비스 카드 클릭, Services 목록에서 클릭
- **요소**:
  - 서비스 헤더 (이름, 상태 뱃지, 편집 버튼)
  - 상세 마일스톤 그래프 + 진행률
  - 서비스 정보 요약 (목적, 현재 단계, 핵심 목표)
  - 최근 의사결정 사항 (최근 Work Item의 의사결정 필드)
  - 다음 액션
- **이동**: 탭 전환 → Board, Work Items, Dev Logs
- **인증**: 필수

### 7. Service Detail - Board (/services/[id]/board)
- **진입**: Service Detail 탭 "Board" 클릭
- **요소**:
  - 5개 컬럼: Backlog / Ready / In Progress / Review / Done
  - 각 컬럼 상단: 상태명 + 카운트 + "+" 빠른 생성 버튼
  - Work Item 카드: 제목, 유형뱃지, 우선순위색상, 담당자아바타
  - 드래그앤드롭으로 컬럼 간 이동
- **액션**: 카드 드래그 → 상태 변경, 카드 클릭 → Work Item 모달, "+" → 빠른 생성 모달
- **인증**: 필수

### 8. Service Detail - Work Items (/services/[id]/work-items)
- **진입**: Service Detail 탭 "Work Items" 클릭
- **요소**:
  - Work Item 테이블 목록 (제목, 유형, 우선순위, 상태, 생성일)
  - 필터: 상태, 유형, 우선순위
  - 정렬: 생성일, 우선순위
  - "새 Work Item" 버튼
- **액션**: 항목 클릭 → Work Item 모달
- **인증**: 필수

### 9. Work Item 모달 (오버레이)
- **진입**: Board 카드 클릭, Work Items 목록 항목 클릭
- **요소**:
  - **탭 1 - 기본 정보**: 제목, 설명, 유형(select), 우선순위(select), 담당자, 상태(select)
  - **탭 2 - 의사결정**: Problem(textarea), 고려한 선택지(textarea), 최종 결정 이유(textarea), 결과(textarea)
  - **탭 3 - AI 세션**: AI 세션 목록 (URL + 요약), "세션 추가" 버튼 (URL 입력 + 요약 입력 + AI 제공자 선택)
  - **탭 4 - 활동 로그**: 상태 변경 이력 (자동), 커멘트 목록 + 입력
- **액션**: 저장, 삭제, 모달 닫기
- **인증**: 필수

### 10. Service Detail - Dev Logs (/services/[id]/dev-logs)
- **진입**: Service Detail 탭 "Dev Logs" 클릭
- **요소**:
  - 타임라인 목록 (최신순, 날짜별 그룹)
  - 각 로그 카드: 날짜, 오늘 한 것 미리보기, 다음 액션 미리보기
  - "새 로그 작성" 버튼
- **액션**: 로그 카드 클릭 → 로그 상세 확장, "새 로그" → 작성 폼
- **인증**: 필수

### 11. Dev Log 작성 폼 (모달 또는 인라인)
- **진입**: Dev Logs 탭에서 "새 로그 작성" 버튼
- **요소**:
  - 날짜 (기본값: 오늘)
  - 오늘 한 것 (textarea, 템플릿 프리필)
  - 확정한 것 (textarea)
  - 보류한 것 (textarea)
  - 다음에 할 것 (textarea)
- **액션**: 저장 → Dev Logs 목록에 추가, 취소 → 목록으로
- **유효성**: 최소 하나의 필드는 입력
- **인증**: 필수

---

## 화면 간 연결 요약

```
/login ←→ /signup
  │
  ▼
/ (Dashboard)
  │
  ├── /services (목록)
  │     ├── /services/new (등록)
  │     └── /services/[id] (Detail - Overview)
  │           ├── /services/[id]/board (Kanban)
  │           │     └── [Work Item Modal]
  │           ├── /services/[id]/work-items (목록)
  │           │     └── [Work Item Modal]
  │           └── /services/[id]/dev-logs (타임라인)
  │                 └── [Dev Log 작성 폼]
  │
  └── (통합 Dev Log 탭 - Dashboard 내)
```
