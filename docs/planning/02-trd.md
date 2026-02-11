# TRD - DevJourney

## 1. 기술 결정 요약

### 결정 방식
- **사용자 레벨:** L3 (경험자 - PM/PO 경험, 기초 코딩)
- **결정 방식:** AI 추천 + 사용자 승인

---

## 2. 권장 기술 스택

### 2.1 프론트엔드

| 항목 | 선택 | 버전 | 이유 |
|------|------|------|------|
| 프레임워크 | Next.js (App Router) | 14+ | SSR/SSG, Vercel 최적화, 안정적 |
| 스타일링 | Tailwind CSS | 3.x | 유틸리티 퍼스트, 빠른 개발 |
| UI 컴포넌트 | shadcn/ui | latest | Radix 기반, 커스터마이징 용이 |
| 상태 관리 | TanStack Query | 5.x | 서버 상태 캐싱, 낙관적 업데이트 |
| 폼 관리 | React Hook Form + Zod | latest | 타입 안전 폼 검증 |
| 드래그앤드롭 | @dnd-kit | latest | Kanban 보드, 경량, 최신 |
| 차트 | Recharts | 2.x | React 네이티브, 간단한 API |

### 2.2 백엔드

| 항목 | 선택 | 이유 |
|------|------|------|
| BaaS | Supabase | PostgreSQL + Auth + Storage + Realtime 통합 |
| 데이터베이스 | PostgreSQL | Supabase 내장, 관계형 데이터 최적 |
| 인증 | Supabase Auth | 이메일/비밀번호, 향후 소셜 로그인 확장 |
| 파일 저장 | Supabase Storage | 문서 업로드 (2차 개발) |
| 실시간 | Supabase Realtime | 향후 팀 협업 시 실시간 업데이트 |

### 2.3 인프라

| 항목 | 선택 | 이유 |
|------|------|------|
| 배포 | Vercel | Next.js 최적화, 자동 배포 |
| 도메인 | Vercel Domains | 간편한 도메인 연결 |
| 모니터링 | Vercel Analytics | 기본 제공 |

---

## 3. Decision Log

| 결정 | 대안 | 선택 이유 |
|------|------|----------|
| Next.js App Router | Pages Router, React + Vite | App Router가 현재 표준, 서버 컴포넌트 활용 |
| shadcn/ui | Ant Design, MUI, Mantine | 커스터마이징 자유도, Tailwind 호환, 번들 크기 최소 |
| @dnd-kit | react-beautiful-dnd, react-dnd | react-beautiful-dnd 유지보수 중단, dnd-kit이 현재 표준 |
| Recharts | Chart.js, Nivo, Victory | React 친화적, 간단한 API, 충분한 기능 |
| TanStack Query | SWR, 직접 구현 | 강력한 캐싱, 낙관적 업데이트, devtools 제공 |
| React Hook Form + Zod | Formik + Yup | 성능 우수 (비제어 컴포넌트), Zod의 타입 추론 |
| Supabase | Firebase, PlanetScale + Prisma | PostgreSQL 관계형 쿼리, RLS 보안, 올인원 |

---

## 4. 프로젝트 구조

```
devjourney/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 인증 그룹
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/        # 대시보드 그룹
│   │   │   ├── page.tsx        # Dashboard
│   │   │   └── services/
│   │   │       ├── page.tsx    # Services 목록
│   │   │       ├── new/        # 서비스 등록
│   │   │       └── [id]/       # Service Detail
│   │   │           ├── page.tsx      # Overview
│   │   │           ├── board/        # Kanban Board
│   │   │           ├── work-items/   # Work Items 목록
│   │   │           └── dev-logs/     # Dev Logs
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   ├── dashboard/          # Dashboard 전용
│   │   ├── service/            # Service 관련
│   │   ├── work-item/          # Work Item 관련
│   │   ├── kanban/             # Kanban Board
│   │   ├── dev-log/            # Dev Log 관련
│   │   └── layout/             # 레이아웃 (사이드바, 헤더)
│   ├── lib/
│   │   ├── supabase/           # Supabase 클라이언트
│   │   ├── hooks/              # 커스텀 훅
│   │   ├── utils/              # 유틸리티
│   │   └── types/              # TypeScript 타입
│   └── styles/
├── public/
├── supabase/
│   ├── migrations/             # DB 마이그레이션
│   └── seed.sql                # 시드 데이터
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. 비기능 요구사항

| 항목 | 목표 | 측정 방법 |
|------|------|----------|
| 페이지 로드 | 2초 이내 | Lighthouse |
| First Contentful Paint | 1.5초 이내 | Lighthouse |
| 번들 크기 | 200KB 이내 (gzipped) | 빌드 분석 |
| 모바일 반응형 | 768px 이하 지원 | 브라우저 테스트 |
| 브라우저 지원 | Chrome, Safari, Firefox 최신 | 수동 테스트 |

---

## 6. 보안

| 항목 | 방법 |
|------|------|
| 인증 | Supabase Auth (JWT) |
| API 보안 | Supabase RLS (Row Level Security) |
| 데이터 격리 | user_id 기반 RLS 정책 |
| HTTPS | Vercel 자동 SSL |
| 환경 변수 | .env.local (Supabase URL, Anon Key) |
