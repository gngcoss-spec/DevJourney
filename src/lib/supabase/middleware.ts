// @TASK P1-R1-T1 - Supabase Auth 미들웨어 유틸리티
// @SPEC specs/screens/01-login.yaml
// @TEST src/__tests__/lib/auth.test.ts

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * 보호된 라우트 패턴 목록.
 * 이 경로들은 인증된 사용자만 접근 가능합니다.
 */
const PROTECTED_ROUTES = ['/', '/services', '/servers', '/team', '/activity'];

/**
 * 인증 전용 (auth-only) 라우트 패턴 목록.
 * 인증된 사용자가 접근하면 메인 페이지로 리다이렉트됩니다.
 */
const AUTH_ROUTES = ['/login', '/signup'];

/**
 * 주어진 pathname이 보호된 라우트인지 확인합니다.
 */
function isProtectedRoute(pathname: string): boolean {
  // 정확히 '/'이거나 보호 패턴으로 시작하는 경로
  return PROTECTED_ROUTES.some((route) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

/**
 * 주어진 pathname이 인증 전용 라우트인지 확인합니다.
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * 미들웨어에서 Supabase 세션을 갱신하고 인증 상태에 따라 리다이렉트를 처리합니다.
 *
 * 동작:
 * 1. Supabase 서버 클라이언트를 쿠키 기반으로 생성
 * 2. getUser()를 호출하여 세션 토큰을 자동 갱신
 * 3. 미인증 사용자가 보호된 라우트 접근 시 /login으로 리다이렉트
 * 4. 인증된 사용자가 /login 또는 /signup 접근 시 /로 리다이렉트
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // Supabase 인증 쿠키 존재 여부 확인
  const hasAuthCookies = request.cookies.getAll().some((c) => c.name.startsWith('sb-'));

  // 개발 환경에서 인증 쿠키가 없으면 (로그인한 적 없음) 인증 체크를 건너뜁니다.
  // UI 개발에 집중할 수 있도록 하며, 데이터 쿼리는 빈 상태/에러로 표시됩니다.
  if (process.env.NODE_ENV === 'development' && !hasAuthCookies) {
    return supabaseResponse;
  }

  // getUser()는 Supabase 서버에 토큰을 검증하고, 만료 시 자동으로 갱신합니다.
  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    // Supabase 연결 실패 시 — 요청을 차단하지 않고 통과시킵니다.
    return supabaseResponse;
  }

  // 미인증 사용자가 보호된 라우트에 접근 시 /login으로 리다이렉트
  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 인증된 사용자가 auth 라우트(/login, /signup)에 접근 시 /로 리다이렉트
  if (user && isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
