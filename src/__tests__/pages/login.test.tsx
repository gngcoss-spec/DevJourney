// @TASK P1-S1-T1 - 로그인 페이지 테스트
// @SPEC docs/planning/03-user-flow.md#로그인
// @TEST Vitest + React Testing Library

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from '@/components/auth/login-form';

// Next.js App Router 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('LoginForm', () => {
  it('이메일 입력 필드가 렌더링된다', () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/이메일/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('비밀번호 입력 필드가 렌더링된다', () => {
    render(<LoginForm />);
    const passwordInput = screen.getByLabelText(/비밀번호/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('로그인 버튼이 렌더링된다', () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /로그인/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('회원가입 링크가 존재한다', () => {
    render(<LoginForm />);
    const signupLink = screen.getByText(/회원가입/i);
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });
});
