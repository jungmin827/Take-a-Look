import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { verifyAdmin } from '@/lib/admin-auth'
import { getAllEssays } from '@/lib/essays'
import { Essay } from '@/types'

interface Props { isLoggedIn: boolean; essays: Essay[] }

export default function AdminIndex({ isLoggedIn, essays }: Props) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  const login = async () => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) window.location.reload()
    else setErr('비밀번호가 틀렸습니다.')
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-sm mx-auto mt-24 space-y-3 px-4">
        <h1 className="text-xl font-bold">어드민 로그인</h1>
        <input
          type="password"
          className="w-full border border-gray-200 rounded px-3 py-2"
          placeholder="비밀번호"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
        />
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button onClick={login} className="w-full bg-gray-900 text-white py-2 rounded">
          로그인
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">어드민</h1>
        <Link href="/admin/write" className="bg-gray-900 text-white text-sm px-4 py-2 rounded">
          + 새 글
        </Link>
      </div>
      <ul className="space-y-1">
        {essays.map(e => (
          <li key={e.slug} className="flex justify-between items-center border-b border-gray-100 py-3">
            <div>
              <span className="font-medium text-sm">{e.title}</span>
              {!e.published && (
                <span className="ml-2 text-xs text-gray-400">(임시저장)</span>
              )}
            </div>
            <Link href={`/admin/edit/${e.slug}`} className="text-xs text-gray-400 hover:text-gray-700">
              수정
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  const isLoggedIn = verifyAdmin(req as any)
  if (!isLoggedIn) return { props: { isLoggedIn: false, essays: [] } }
  const essays = await getAllEssays(true)
  return { props: { isLoggedIn: true, essays } }
}
