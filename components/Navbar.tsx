import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/hooks/useUser'

export default function Navbar() {
  const router = useRouter()
  const { user, loading } = useUser()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
          Take a Look
        </Link>
        <div className="flex items-center gap-3">
          {!loading && (
            user ? (
              <>
                <Link
                  href="/my"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  회원가입
                </Link>
              </>
            )
          )}
          <Link
            href="/admin/write"
            className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors"
          >
            글쓰기
          </Link>
        </div>
      </div>
    </nav>
  )
}
