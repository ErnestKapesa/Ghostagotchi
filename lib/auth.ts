import { NextApiRequest, NextApiResponse } from 'next'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export interface AuthResult {
  userId?: string
  error?: string
  status?: number
}

/**
 * Validates authentication and extracts user ID from request
 * Returns userId on success, or error details on failure
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthResult> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name]
        },
        set(name: string, value: string, options: CookieOptions) {
          res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`)
        },
        remove(name: string, options: CookieOptions) {
          res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0`)
        },
      },
    }
  )

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    return {
      error: 'Unauthorized',
      status: 401,
    }
  }

  return {
    userId: session.user.id,
  }
}
