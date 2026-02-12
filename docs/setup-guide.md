# DevJourney 환경 설정 가이드

## Supabase 프로젝트 정보

| 항목 | 값 |
|------|---|
| Project Ref | `pfegcaomullihwvgfnpr` |
| Project URL | `https://pfegcaomullihwvgfnpr.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/pfegcaomullihwvgfnpr |
| API Settings | https://supabase.com/dashboard/project/pfegcaomullihwvgfnpr/settings/api |

## 환경변수 (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://pfegcaomullihwvgfnpr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # API Settings에서 확인
```

## 인증 (Supabase Auth)

### 인증 방식
- Email + Password (기본)
- Supabase Auth 내장 기능 사용
- JWT 기반 세션 관리 (쿠키 저장)

### 라우트 보호 구조

| 라우트 | 접근 권한 | 미인증 시 |
|--------|----------|----------|
| `/login` | 비인증 전용 | - |
| `/signup` | 비인증 전용 | - |
| `/` (Dashboard) | 인증 필요 | `/login`으로 리다이렉트 |
| `/services/**` | 인증 필요 | `/login`으로 리다이렉트 |

### 계정 생성 방법
1. http://localhost:3000/signup 접속
2. 이메일 + 비밀번호 입력
3. 이메일 인증 (Supabase 설정에 따라 다름)
4. http://localhost:3000/login 에서 로그인

### Supabase Auth 설정 확인
- Dashboard > Authentication > Providers > Email 활성화 확인
- Dashboard > Authentication > Email Templates 확인
- 개발 중 이메일 인증 비활성화: Dashboard > Authentication > Providers > Email > Confirm email 해제

## 데이터베이스 마이그레이션

Supabase SQL Editor에서 순서대로 실행:

| 순서 | 파일 | 내용 |
|------|------|------|
| 1 | `supabase/migrations/001_create_services.sql` | services 테이블 + RLS |
| 2 | `supabase/migrations/002_create_work_items.sql` | work_items 테이블 + RLS + 트리거 |
| 3 | `supabase/migrations/003_create_ai_sessions.sql` | ai_sessions 테이블 + RLS |
| 4 | `supabase/migrations/004_create_comments.sql` | work_item_comments 테이블 + RLS |
| 5 | `supabase/migrations/005_create_dev_logs.sql` | dev_logs 테이블 + RLS + 트리거 |

### 실행 방법
1. Supabase Dashboard > SQL Editor 접속
2. 각 파일 내용을 순서대로 복사/붙여넣기 후 실행
3. Table Editor에서 테이블 생성 확인

## 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 테스트 실행
npm test

# 프로덕션 빌드
npm run build
```

- 개발 서버: http://localhost:3000
- 미인증 시 자동으로 `/login` 리다이렉트

## RLS (Row Level Security)

모든 테이블에 RLS가 적용되어 있습니다:
- `auth.uid() = user_id` 조건으로 본인 데이터만 접근 가능
- Supabase Anon Key는 공개 키이며, RLS가 데이터 보호를 담당
