import { useState, useCallback, useRef } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { verifyAdmin } from '@/lib/admin-auth'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

export default function WritePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [alt, setAlt] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [readingTime, setReadingTime] = useState('3분')
  const [content, setContent] = useState('')
  const [essayId, setEssayId] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>()

  const autoSave = useCallback((newContent: string, id: string) => {
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      setStatus('저장 중...')
      await fetch(`/api/essays/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      })
      setStatus('자동 저장됨')
    }, 3000)
  }, [])

  const handleContentChange = (json: string) => {
    setContent(json)
    if (essayId) autoSave(json, essayId)
  }

  const save = async (published: boolean) => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const body = { slug, title, excerpt, coverImage, alt, content, readingTime, published, tags }

    if (essayId) {
      await fetch(`/api/essays/${essayId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      const res = await fetch('/api/essays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setEssayId(data.id)
    }

    if (published) router.push(`/${slug}`)
    else setStatus('저장됨')
  }

  const fields = [
    { placeholder: '제목', value: title, onChange: setTitle },
    { placeholder: '슬러그 (URL, 예: my-essay)', value: slug, onChange: setSlug },
    { placeholder: '요약', value: excerpt, onChange: setExcerpt },
    { placeholder: '커버 이미지 URL', value: coverImage, onChange: setCoverImage },
    { placeholder: '이미지 alt 텍스트', value: alt, onChange: setAlt },
    { placeholder: '태그 (쉼표 구분, 예: 음악,음반)', value: tagsInput, onChange: setTagsInput },
    { placeholder: '읽기 시간 (예: 5분)', value: readingTime, onChange: setReadingTime },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">새 글</h1>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-400">{status}</span>
          <button
            onClick={() => save(false)}
            className="text-sm border border-gray-300 px-3 py-1.5 rounded"
          >
            임시저장
          </button>
          <button
            onClick={() => save(true)}
            className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded"
          >
            발행
          </button>
        </div>
      </div>

      {fields.map(f => (
        <input
          key={f.placeholder}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          placeholder={f.placeholder}
          value={f.value}
          onChange={e => f.onChange(e.target.value)}
        />
      ))}

      <Editor content={content} onChange={handleContentChange} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!verifyAdmin(req as any)) {
    return { redirect: { destination: '/admin', permanent: false } }
  }
  return { props: {} }
}
