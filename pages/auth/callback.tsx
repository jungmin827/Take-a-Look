import type { GetServerSideProps } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default function AuthCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm">인증 처리 중...</p>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const code = query.code as string | undefined

  if (code) {
    const supabase = createSupabaseServerClient(req, res)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return { redirect: { destination: '/login?error=expired', permanent: false } }
    }
  }

  return { redirect: { destination: '/', permanent: false } }
}
