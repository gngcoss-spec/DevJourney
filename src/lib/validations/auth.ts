// @TASK P1-S1-T1 - 로그인 Zod 스키마
// @TASK P1-S2-T1 - 회원가입 Zod 스키마
// @SPEC docs/planning/03-user-flow.md#로그인

import { z } from 'zod';

// 로그인 스키마
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상입니다'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// 회원가입 스키마
export const signupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상입니다'),
  confirmPassword: z.string().min(6, '비밀번호 확인을 입력하세요'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

export type SignupInput = z.infer<typeof signupSchema>;
