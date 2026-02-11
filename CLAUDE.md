# DevJourney - CLAUDE.md

## 프로젝트 개요
- **제품명**: DevJourney
- **목적**: 여러 서비스 동시 개발 관리, 개발 여정(의사결정 + 작업 + 변경 이력) 기록
- **기술 스택**: Next.js 14+ (App Router) + Supabase + TailwindCSS + shadcn/ui

## 기술 스택 상세
- **Frontend**: Next.js 14+, TypeScript strict, TailwindCSS, shadcn/ui (Radix)
- **Backend**: Supabase (PostgreSQL + RLS + Auth + Storage)
- **상태관리**: TanStack Query 5.x (서버), Zustand (클라이언트)
- **폼**: React Hook Form + Zod
- **Kanban**: @dnd-kit
- **차트**: Recharts
- **애니메이션**: Framer Motion
- **테스트**: Vitest + React Testing Library + MSW
- **배포**: Vercel

## 코딩 컨벤션
- TypeScript strict mode
- 파일명: kebab-case
- 컴포넌트: named export
- TanStack Query key: `queryKeys` 객체 관리
- 다크 모드 우선 (Slate 950 배경)

## 명령어
- `npm run dev` - 개발 서버
- `npm run build` - 프로덕션 빌드
- `npm test` - Vitest 테스트
- `npm run lint` - ESLint

## Lessons Learned
<!-- 에이전트가 작업 중 발견한 교훈을 기록합니다 -->
