import { createServerClient } from '@supabase/ssr'
import { serialize, parse } from 'cookie'
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'

export function createSupabaseServerClient(
  req: GetServerSidePropsContext['req'] | NextApiRequest,
  res: GetServerSidePropsContext['res'] | NextApiResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const parsed = parse(req.headers.cookie ?? '')
          return Object.entries(parsed).map(([name, value]) => ({ name, value: value ?? '' }))
        },
        setAll(cookiesToSet) {
          const newCookies = cookiesToSet.map(({ name, value, options }) =>
            serialize(name, value, {
              path: options?.path ?? '/',
              httpOnly: true,
              sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') ?? 'lax',
              maxAge: options?.maxAge,
              expires: options?.expires,
              domain: options?.domain,
              secure: options?.secure ?? process.env.NODE_ENV === 'production',
            })
          )
          const existing = res.getHeader('Set-Cookie')
          const prev = existing
            ? Array.isArray(existing) ? existing.map(String) : [String(existing)]
            : []
          res.setHeader('Set-Cookie', [...prev, ...newCookies])
        },
      },
    }
  )
}
