// @TASK P1-R1-T1 - Supabase Auth 미들웨어 테스트
// @SPEC specs/screens/01-login.yaml

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock @supabase/ssr
const mockGetUser = vi.fn();
const mockCreateServerClient = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) => {
    mockCreateServerClient(...args);
    return {
      auth: {
        getUser: mockGetUser,
      },
    };
  },
}));

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server');
  return {
    ...actual,
    NextResponse: {
      next: vi.fn((...args: unknown[]) => {
        const response = new Response(null, { status: 200 });
        const headers = new Headers();
        const cookiesMap = new Map<string, { name: string; value: string }>();
        return {
          ...response,
          headers,
          cookies: {
            set: vi.fn(
              (nameOrObj: string | { name: string; value: string }, value?: string) => {
                if (typeof nameOrObj === 'object') {
                  cookiesMap.set(nameOrObj.name, nameOrObj);
                } else {
                  cookiesMap.set(nameOrObj, { name: nameOrObj, value: value ?? '' });
                }
              }
            ),
            get: vi.fn((name: string) => cookiesMap.get(name)),
            getAll: vi.fn(() => [...cookiesMap.values()]),
            delete: vi.fn(),
          },
        };
      }),
      redirect: vi.fn((url: URL | string) => {
        const urlStr = url instanceof URL ? url.toString() : url;
        const response = new Response(null, {
          status: 307,
          headers: { Location: urlStr },
        });
        return {
          ...response,
          status: 307,
          headers: new Headers({ Location: urlStr }),
          redirectUrl: urlStr,
        };
      }),
    },
  };
});

function createMockNextUrl(fullUrl: string) {
  const url = new URL(fullUrl);
  const mock = {
    pathname: url.pathname,
    searchParams: url.searchParams,
    href: url.href,
    origin: url.origin,
    toString() {
      return url.href;
    },
    clone() {
      // Return a mutable clone
      const cloned = createMockNextUrl(url.href);
      // Override pathname setter to update href
      let _pathname = url.pathname;
      Object.defineProperty(cloned, 'pathname', {
        get() {
          return _pathname;
        },
        set(val: string) {
          _pathname = val;
          const newUrl = new URL(url.href);
          newUrl.pathname = val;
          cloned.href = newUrl.href;
          cloned.toString = () => newUrl.href;
        },
      });
      return cloned;
    },
  };
  return mock;
}

function createMockRequest(url: string): NextRequest {
  const fullUrl = `http://localhost:3000${url}`;
  const request = new Request(fullUrl, {
    method: 'GET',
    headers: new Headers({
      cookie: '',
    }),
  });

  const cookiesMap = new Map<string, { name: string; value: string }>();

  return {
    ...request,
    url: fullUrl,
    nextUrl: createMockNextUrl(fullUrl),
    cookies: {
      get: vi.fn((name: string) => cookiesMap.get(name)),
      getAll: vi.fn(() => [...cookiesMap.values()]),
      set: vi.fn(
        (nameOrObj: string | { name: string; value: string }, value?: string) => {
          if (typeof nameOrObj === 'object') {
            cookiesMap.set(nameOrObj.name, nameOrObj);
          } else {
            cookiesMap.set(nameOrObj, { name: nameOrObj, value: value ?? '' });
          }
        }
      ),
      delete: vi.fn(),
      has: vi.fn((name: string) => cookiesMap.has(name)),
      size: 0,
      [Symbol.iterator]: vi.fn(),
    },
    headers: new Headers({ cookie: '' }),
    geo: undefined,
    ip: undefined,
    method: 'GET',
  } as unknown as NextRequest;
}

describe('Supabase Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  describe('updateSession', () => {
    it('should create Supabase client with correct env variables and cookie handlers', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@test.com' } },
        error: null,
      });
      const request = createMockRequest('/');

      // Act
      const { updateSession } = await import('@/lib/supabase/middleware');
      await updateSession(request);

      // Assert
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      );
    });

    it('should redirect unauthenticated user to /login when accessing protected route', async () => {
      // Arrange - getUser returns no user (unauthenticated)
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      const request = createMockRequest('/');

      // Act
      const { updateSession } = await import('@/lib/supabase/middleware');
      const response = await updateSession(request);

      // Assert
      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectArg = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { href: string; pathname: string };
      expect(redirectArg.href).toContain('/login');
      expect(redirectArg.pathname).toBe('/login');
    });

    it('should redirect unauthenticated user to /login when accessing /services route', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      const request = createMockRequest('/services/my-project');

      // Act
      const { updateSession } = await import('@/lib/supabase/middleware');
      const response = await updateSession(request);

      // Assert
      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectArg = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { href: string; pathname: string };
      expect(redirectArg.href).toContain('/login');
      expect(redirectArg.pathname).toBe('/login');
    });

    it('should redirect authenticated user from /login to /', async () => {
      // Arrange - getUser returns authenticated user
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@test.com' } },
        error: null,
      });
      const request = createMockRequest('/login');

      // Act
      const { updateSession } = await import('@/lib/supabase/middleware');
      const response = await updateSession(request);

      // Assert
      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectArg = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { href: string; pathname: string };
      expect(redirectArg.href).toBe('http://localhost:3000/');
      expect(redirectArg.pathname).toBe('/');
    });

    it('should redirect authenticated user from /signup to /', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@test.com' } },
        error: null,
      });
      const request = createMockRequest('/signup');

      // Act
      const { updateSession } = await import('@/lib/supabase/middleware');
      const response = await updateSession(request);

      // Assert
      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectArg = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { href: string; pathname: string };
      expect(redirectArg.href).toBe('http://localhost:3000/');
      expect(redirectArg.pathname).toBe('/');
    });

    it('should allow authenticated user to access protected routes without redirect', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@test.com' } },
        error: null,
      });
      const request = createMockRequest('/');

      // Act
      const { updateSession } = await import('@/lib/supabase/middleware');
      const response = await updateSession(request);

      // Assert - should call next(), not redirect()
      expect(NextResponse.redirect).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should allow unauthenticated user to access /login without redirect', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      const request = createMockRequest('/login');

      // Act
      const { updateSession } = await import('@/lib/supabase/middleware');
      const response = await updateSession(request);

      // Assert - should call next(), not redirect()
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should call supabase.auth.getUser() for session check', async () => {
      // Arrange
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@test.com' } },
        error: null,
      });
      const request = createMockRequest('/');

      // Act
      const { updateSession } = await import('@/lib/supabase/middleware');
      await updateSession(request);

      // Assert
      expect(mockGetUser).toHaveBeenCalled();
    });

    it('should allow request through when Supabase connection fails', async () => {
      // Arrange - Supabase throws (network error, etc.)
      // Need auth cookies so dev bypass doesn't kick in
      mockGetUser.mockRejectedValue(new Error('Network error'));
      const request = createMockRequest('/');
      request.cookies.set('sb-test-auth-token', 'some-token');

      // Act
      const { updateSession } = await import('@/lib/supabase/middleware');
      const response = await updateSession(request);

      // Assert - should NOT redirect, just pass through
      expect(NextResponse.redirect).not.toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should skip auth check in development when no auth cookies exist', async () => {
      // Arrange - development mode, no Supabase cookies
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const request = createMockRequest('/');
      // No sb-* cookies set

      // Act
      const { updateSession } = await import('@/lib/supabase/middleware');
      const response = await updateSession(request);

      // Assert - should NOT redirect, should NOT call getUser
      expect(NextResponse.redirect).not.toHaveBeenCalled();
      expect(mockGetUser).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
