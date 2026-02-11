# User Flow - DevJourney

## 1. 전체 화면 흐름

```
[로그인/회원가입]
       │
       ▼
[Dashboard] ◄──────────────────────── 사이드바
  │  ├─ 요약 카드 (전체/진행중/정체/위험)
  │  ├─ 마일스톤 그래프 + 진행률
  │  ├─ 서비스 카드 목록
  │  └─ [통합 로그 탭]
  │
  ├── 서비스 카드 클릭
  │         │
  │         ▼
  │   [Service Detail]
  │     ├─ [Overview 탭] ─── 상세 그래프 + 목적 + 단계 + 다음 액션
  │     ├─ [Board 탭] ────── 5컨럼 Kanban (드래그 이동)
  │     │     ├─ + 버튼 ──── Work Item 빠른 생성
  │     │     └─ 카드 클릭 ── [Work Item 모달]
  │     ├─ [Work Items 탭] ─ 목록 + 필터
  │     │     └─ 항목 클릭 ── [Work Item 모달]
  │     └─ [Dev Logs 탭] ── 타임라인 목록
  │           └─ 새 로그 ─── [Dev Log 작성 폼]
  │
  └── 사이드바 "Services" 클릭
            │
            ▼
      [Services 목록]
        └─ "새 서비스" 버튼 ── [Service 등록/편집 폼]
```

---

## 2. 시나리오별 사용자 흐름

### 시나리오 1: 최초 서비스 등록

```
1. 로그인
2. Dashboard (비어있음)
3. "서비스 등록" 버튼 클릭
4. Service 등록 폼 → 8개 필드 입력
5. 저장 → Dashboard로 돌아옴 (1개 서비스 카드 표시)
6. 반복 (8개 서비스 모두 등록)
```

### 시나리오 2: 일일 개발 작업

```
1. 로그인 → Dashboard
2. 서비스 카드 확인 (오늘 작업할 서비스 선택)
3. 서비스 카드 클릭 → Service Detail
4. Overview 탭에서 "다음 액션" 확인
5. Board 탭으로 이동 → Kanban에서 Work Item 확인
6. Work Item 카드를 "In Progress"로 드래그
7. 작업 완료 후 "Done"으로 드래그
8. Dev Logs 탭 → "새 로그 작성"
9. 템플릿 채우기 (오늘 한 것 / 확정한 것 / 보류한 것 / 다음에 할 것)
10. 저장
```

### 시나리오 3: 서비스 전환

```
1. Dashboard에서 다음 서비스 카드 클릭
2. Overview 탭 확인:
   - 현재 단계 파악
   - 마지막 활동 확인
   - 다음 액션 확인
3. Dev Logs 탭 → 최근 로그 읽기 (이전 작업 맥락 파악)
4. Board 탭 → Work Items 상태 확인
5. 작업 시작
```

### 시나리오 4: 의사결정 기록

```
1. Board에서 관련 Work Item 클릭 → 모달 열림
2. "의사결정" 탭 클릭
3. Problem 작성 ("왜 이 결정이 필요한가")
4. 고려한 선택지 작성
5. 최종 결정 이유 작성
6. 결과 작성 (결정 실행 후)
7. 저장
```

### 시나리오 5: AI 대화 세션 연결

```
1. AI(ChatGPT/Gemini)와 문제 해결
2. Board에서 관련 Work Item 클릭 → 모달
3. "AI 세션" 탭 클릭
4. "세션 추가" 버튼
5. AI 대화 URL 붙여넣기
6. 요약 한 줄 작성 ("무슨 문제를 해결했는지")
7. 저장
```

---

## 3. 화면 간 이동 매트릭스

| From | To | Trigger |
|------|----|---------|
| 로그인 | Dashboard | 로그인 성공 |
| Dashboard | Service Detail | 서비스 카드 클릭 |
| Dashboard | Services 목록 | 사이드바 "Services" |
| Services 목록 | Service 등록 폼 | "새 서비스" 버튼 |
| Services 목록 | Service Detail | 서비스 항목 클릭 |
| Service 등록 폼 | Services 목록 | 저장/취소 |
| Service Detail | Dashboard | 사이드바 "Dashboard" |
| Service Detail | 다른 탭 | 탭 클릭 |
| Board | Work Item 모달 | 카드 클릭 |
| Board | Work Item 빠른 생성 | 컬럼 + 버튼 |
| Work Items 목록 | Work Item 모달 | 항목 클릭 |
| Dev Logs | Dev Log 작성 폼 | "새 로그" 버튼 |
| Work Item 모달 | Board/Work Items | 모달 닫기 |

---

## 4. 네비게이션 구조

### 사이드바 메뉴
```
[DevJourney 로고]
─────────────────
📊 Dashboard
📦 Services
─────────────────
[사용자 프로필]
[로그아웃]
```

### Service Detail 탭
```
[서비스명]
─────────────────
📋 Overview
📌 Board
📝 Work Items
📓 Dev Logs
```
