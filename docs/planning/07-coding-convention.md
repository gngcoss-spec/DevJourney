# Coding Convention - DevJourney

## 1. 일반 규칙

### 언어 & 타입
- **TypeScript** 사용 필수 (strict mode)
- `any` 타입 사용 금지 (정말 필요한 경우 `unknown` 사용)
- 인터페이스보다 `type` alias 선호 (일관성)

### 파일 네이밍
- **컴포넌트**: `kebab-case.tsx` (예: `service-card.tsx`)
- **유틸리티**: `kebab-case.ts` (예: `format-date.ts`)
- **타입**: `kebab-case.ts` (예: `service.types.ts`)
- **훅**: `use-kebab-case.ts` (예: `use-services.ts`)
- **상수**: `kebab-case.ts` (예: `kanban-columns.ts`)

### 폴더 구조
```
src/
├── app/              # Next.js App Router 페이지
├── components/       # 재사용 컴포넌트
│   ├── ui/          # shadcn/ui 기본 컴포넌트
│   └── [feature]/   # 기능별 컴포넌트
├── lib/
│   ├── supabase/    # Supabase 클라이언트 & 쿼리
│   ├── hooks/       # 커스텀 훅
│   ├── types/       # 공유 타입
│   └── utils/       # 유틸리티 함수
└── styles/          # 글로벌 스타일
```

---

## 2. React / Next.js

### 컴포넌트
- **함수형 컴포넌트** 사용 (클래스 컴포넌트 금지)
- `export default` 대신 `named export` 사용
- Props 타입은 컴포넌트 파일 상단에 정의

```tsx
// Good
type ServiceCardProps = {
  service: Service
  onClick: (id: string) => void
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  return (...)
}
```

### Server vs Client 컴포넌트
- **기본값**: Server Component
- **클라이언트 필요 시**: 파일 상단에 `'use client'`
- 인터랙션, 브라우저 API, 상태 관리가 필요한 경우만 Client Component

### 데이터 패칭
- **서버**: `fetch` + Next.js 캐싱
- **클라이언트**: TanStack Query (`useQuery`, `useMutation`)

```tsx
// 서버 컴포넌트에서 데이터 페칭
async function DashboardPage() {
  const services = await getServices()
  return <ServiceList services={services} />
}

// 클라이언트 컴포넌트에서 데이터 페칭
'use client'
function ServiceBoard({ serviceId }: { serviceId: string }) {
  const { data: workItems } = useQuery({
    queryKey: ['work-items', serviceId],
    queryFn: () => getWorkItems(serviceId),
  })
  return (...)
}
```

---

## 3. Supabase

### 클라이언트 사용
```tsx
// lib/supabase/client.ts - 브라우저 클라이언트
import { createBrowserClient } from '@supabase/ssr'

// lib/supabase/server.ts - 서버 클라이언트
import { createServerClient } from '@supabase/ssr'
```

### 쿼리 함수
- `lib/supabase/queries/` 폴더에 테이블별로 분리
- 함수명: `get`, `create`, `update`, `delete` 접두사

```tsx
// lib/supabase/queries/services.ts
export async function getServices(userId: string) { ... }
export async function getServiceById(id: string) { ... }
export async function createService(data: CreateServiceInput) { ... }
export async function updateService(id: string, data: UpdateServiceInput) { ... }
export async function deleteService(id: string) { ... }
```

### RLS 정책
- 모든 테이블에 `user_id` 기반 RLS 적용
- 쿼리에서 `user_id` 필터 중복 적용하지 않음 (RLS가 처리)

---

## 4. 스타일링

### Tailwind CSS
- 인라인 스타일 금지 (Tailwind 클래스 사용)
- 반복되는 스타일은 `@apply`보다 컴포넌트 추출 선호
- 색상은 Design System 정의값 사용

### shadcn/ui
- UI 컴포넌트는 `components/ui/`에 설치
- 커스터마이징 시 원본 수정보다 래핑 선호

```tsx
// components/ui/status-badge.tsx
import { Badge } from '@/components/ui/badge'

export function StatusBadge({ status }: { status: string }) {
  const colors = {
    active: 'bg-green-500',
    stalled: 'bg-yellow-500',
    paused: 'bg-red-500',
  }
  return <Badge className={colors[status]}>{status}</Badge>
}
```

---

## 5. 상태 관리

### 원칙
- **서버 상태**: TanStack Query (Supabase 데이터)
- **UI 상태**: React useState/useReducer (로컬 상태)
- **글로벌 상태**: 최소화 (필요 시 Zustand)

### TanStack Query 키 네이밍
```tsx
// Query Key 컨벤션
['services']                          // 서비스 목록
['services', serviceId]               // 서비스 상세
['work-items', serviceId]             // 서비스별 Work Items
['work-items', serviceId, status]     // 상태별 필터
['dev-logs', serviceId]               // 서비스별 Dev Logs
['dev-logs', 'all']                   // 통합 Dev Logs
['ai-sessions', workItemId]           // AI 세션 목록
```

---

## 6. 에러 처리

```tsx
// 일관된 에러 처리 패턴
try {
  const result = await createService(data)
  toast.success('서비스가 생성되었습니다')
  return result
} catch (error) {
  toast.error('서비스 생성에 실패했습니다')
  throw error
}
```

---

## 7. Git 컨벤션

### 브랜치
- `main` - 프로덕션
- `develop` - 개발
- `feat/[feature-name]` - 기능 개발
- `fix/[bug-name]` - 버그 수정

### 커밋 메시지
```
feat: 서비스 CRUD 기능 구현
fix: Kanban 드래그 시 상태 미갱신 버그 수정
refactor: Work Item 모달 탭 구조 개선
style: Dashboard 카드 레이아웃 조정
docs: 기획 문서 업데이트
chore: 패키지 업데이트
```

### PR 규칙
- 1 기능 = 1 PR
- PR 설명에 변경 사항 요약 포함
