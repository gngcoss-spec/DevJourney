// @TASK P1-S2-T1 - 회원가입 폼 컴포넌트
// @SPEC docs/planning/03-user-flow.md#회원가입
// @TEST src/__tests__/pages/signup.test.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { signupSchema, type SignupInput } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const response = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      // 응답 검증
      if (!response) {
        setError('회원가입 중 오류가 발생했습니다.');
        return;
      }

      const { error: signUpError } = response;

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // 성공: 이메일 인증 안내
      setSuccess(true);
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 성공 상태 렌더링
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </motion.div>
            <CardTitle className="text-slate-50">이메일 인증이 필요합니다</CardTitle>
            <CardDescription className="text-slate-400">
              회원가입이 성공적으로 완료되었습니다.
              <br />
              이메일로 전송된 인증 링크를 클릭하여 계정을 활성화하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full" variant="default">
                로그인 페이지로 이동
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // 폼 렌더링
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">회원가입</CardTitle>
          <CardDescription className="text-slate-400">
            이메일로 새 계정을 만드세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 이메일 필드 */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                이메일
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" role="alert" className="text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* 비밀번호 필드 */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                placeholder="6자 이상 입력하세요"
                className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              {errors.password && (
                <p id="password-error" role="alert" className="text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* 비밀번호 확인 필드 */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                비밀번호 확인
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" role="alert" className="text-sm text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-red-900/20 border border-red-800"
              >
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              </motion.div>
            )}

            {/* 제출 버튼 */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {isLoading ? '처리 중...' : '가입하기'}
            </Button>

            {/* 로그인 링크 */}
            <div className="text-center text-sm text-slate-400">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-slate-300 hover:text-slate-50 underline">
                로그인
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
