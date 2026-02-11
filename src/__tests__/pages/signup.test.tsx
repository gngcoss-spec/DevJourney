// @TASK P1-S2-T1 - 회원가입 페이지 테스트
// @SPEC docs/planning/03-user-flow.md#회원가입

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm } from '@/components/auth/signup-form';

// Mock function
const mockSignUp = vi.fn();

// Supabase client mock
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}));

// Next.js router mock
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp.mockReset();
  });

  it('이메일, 비밀번호, 비밀번호 확인 필드가 렌더링된다', () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^비밀번호$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호 확인/i)).toBeInTheDocument();
  });

  it('제출 버튼이 렌더링된다', () => {
    render(<SignupForm />);

    const submitButton = screen.getByRole('button', { name: /가입하기/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('로그인 링크가 존재한다', () => {
    render(<SignupForm />);

    const loginLink = screen.getByRole('link', { name: /로그인/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('비밀번호 불일치 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/^비밀번호$/i);
    const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/i);
    const submitButton = screen.getByRole('button', { name: /가입하기/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/비밀번호가 일치하지 않습니다/i)).toBeInTheDocument();
    });
  });

  it('가입 성공 시 이메일 인증 안내 메시지를 표시한다', async () => {
    const user = userEvent.setup();

    // 성공 응답 mock
    mockSignUp.mockResolvedValueOnce({
      data: {
        user: { id: '123', email: 'test@example.com' },
        session: null,
      },
      error: null,
    });

    render(<SignupForm />);

    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/^비밀번호$/i);
    const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/i);
    const submitButton = screen.getByRole('button', { name: /가입하기/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/이메일 인증이 필요합니다/i)).toBeInTheDocument();
    });

    // 로그인 페이지 이동 버튼 확인
    expect(screen.getByRole('button', { name: /로그인 페이지로 이동/i })).toBeInTheDocument();
  });

  it('필수 필드가 비어있으면 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    const submitButton = screen.getByRole('button', { name: /가입하기/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/올바른 이메일을 입력하세요/i)).toBeInTheDocument();
    });
  });

  it('로딩 중일 때 버튼이 비활성화된다', async () => {
    const user = userEvent.setup();

    // 지연된 응답 mock
    mockSignUp.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { user: null, session: null }, error: null }), 1000))
    );

    render(<SignupForm />);

    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/^비밀번호$/i);
    const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/i);
    const submitButton = screen.getByRole('button', { name: /가입하기/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    // 로딩 상태 확인
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /처리 중/i })).toBeDisabled();
    });
  });
});
