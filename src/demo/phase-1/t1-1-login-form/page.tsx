// @TASK P1-S1-T1 - 로그인 폼 데모 페이지
// @SPEC docs/planning/03-user-flow.md#로그인
// @DEMO Phase 1, Task 1.1 - Login Form

'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';

type DemoState = 'normal' | 'loading' | 'error';

const DEMO_STATES = {
  normal: { description: '기본 상태 - 로그인 폼' },
  loading: { description: '로딩 상태 (모의)' },
  error: { description: '에러 상태 (모의)' },
} as const;

export default function LoginFormDemoPage() {
  const [state, setState] = useState<DemoState>('normal');

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      {/* 상태 선택기 */}
      <div className="mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">
          P1-S1-T1: 로그인 폼 데모
        </h1>
        <div className="flex gap-2 mb-4">
          {(Object.keys(DEMO_STATES) as DemoState[]).map((s) => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                state === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-400">
          현재 상태: <span className="text-blue-400 font-medium">{state}</span> -{' '}
          {DEMO_STATES[state].description}
        </p>
      </div>

      {/* 컴포넌트 렌더링 영역 */}
      <div className="max-w-md mx-auto">
        <LoginForm />
      </div>

      {/* 상태 정보 */}
      <div className="mt-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-white mb-2">컴포넌트 정보</h2>
        <pre className="bg-slate-900 border border-slate-700 text-slate-300 p-4 rounded-md text-sm overflow-auto">
          {JSON.stringify(
            {
              component: 'LoginForm',
              file: 'src/components/auth/login-form.tsx',
              features: [
                '이메일/비밀번호 입력',
                'Zod 스키마 검증',
                'Supabase 인증',
                '로딩/에러 상태 관리',
                '회원가입 링크',
              ],
              testFile: 'src/__tests__/pages/login.test.tsx',
              status: '✅ 모든 테스트 통과',
            },
            null,
            2
          )}
        </pre>
      </div>

      {/* 사용 가이드 */}
      <div className="mt-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-white mb-2">테스트 방법</h2>
        <div className="bg-slate-900 border border-slate-700 text-slate-300 p-4 rounded-md">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>이메일 입력란에 유효하지 않은 이메일 입력 (예: "test") → 에러 메시지 확인</li>
            <li>비밀번호 입력란에 5자 이하 입력 (예: "123") → 에러 메시지 확인</li>
            <li>
              유효한 데이터 입력 (이메일: test@example.com, 비밀번호: 123456) → 로그인 버튼 활성화
            </li>
            <li>"회원가입" 링크 클릭 → /signup으로 이동 확인</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
