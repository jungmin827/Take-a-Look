import { useRouter } from 'next/router'
import type { GetServerSideProps } from 'next'
import { supabase } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

interface Props {
  email: string
  createdAt: string
}

export default function MyPage({ email, createdAt }: Props) {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const joinDate = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto pt-16 px-4">
        <h1 className="text-2xl font-bold mb-8">마이 페이지</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">이메일</p>
            <p className="text-sm font-medium text-gray-900">{email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">가입일</p>
            <p className="text-sm text-gray-700">{joinDate}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-6 w-full border border-gray-200 text-sm text-gray-600 py-2 rounded hover:bg-gray-100 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const supabaseServer = createSupabaseServerClient(req, res)
  const { data: { user } } = await supabaseServer.auth.getUser()

  if (!user) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  return {
    props: {
      email: user.email ?? '',
      createdAt: user.created_at,
    },
  }
}
