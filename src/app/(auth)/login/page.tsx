// @TASK P1-S1-T1 - 로그인 페이지
// @SPEC docs/planning/03-user-flow.md#로그인
// @TEST src/__tests__/pages/login.test.tsx

import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: '로그인 - DevJourney',
  description: '개발 여정 관리 플랫폼 로그인',
};

export default function LoginPage() {
  return <LoginForm />;
}
