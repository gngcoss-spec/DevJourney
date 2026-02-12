import { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Safely get the authenticated user from Supabase client.
 * Wraps getUser() with proper error handling for network failures.
 * Throws a clear error message if authentication fails.
 */
export async function getAuthUser(client: SupabaseClient): Promise<User> {
  try {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw new Error(`인증 오류: ${error.message}`);
    if (!user) throw new Error('로그인이 필요합니다');
    return user;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('인증')) throw err;
    if (err instanceof Error && err.message.startsWith('로그인')) throw err;
    throw new Error('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}
