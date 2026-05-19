import { useState, useCallback, useRef } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { verifyAdmin } from '@/lib/admin-auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { uploadCoverImage } from '@/lib/upload-image'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

function extractExcerpt(contentJson: string): string {
  if (!contentJson) return ''
  try {
    const doc = JSON.parse(contentJson)
    for (const node of doc.content ?? []) {
      if (node.type === 'paragraph') {
        const text = (node.content ?? [])
          .filter((c: any) => c.type === 'text')
          .map((c: any) => c.text)
          .join('')
          .trim()
        if (text) return text.slice(0, 120)
      }
    }
  } catch {}
  return ''
}

function generateSlug(title: string): string {
  const base = title.trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '')
    .toLowerCase()
    .slice(0, 40)
  const suffix = Date.now().toString(36).slice(-4)
  return base ? `${base}-${suffix}` : suffix
}

export default function WritePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slugRef] = useState({ current: '' })
  const [coverImage, setCoverImage] = useState('')
  const [alt, setAlt] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [readingTime, setReadingTime] = useState('3분')
  const [content, setContent] = useState('')
  const [essayId, setEssayId] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [uploading, setUploading] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>()

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!essayId) {
      slugRef.current = generateSlug(value)
    }
  }

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

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setStatus('이미지 업로드 중...')
    try {
      const url = await uploadCoverImage(file)
      setCoverImage(url)
      setStatus('이미지 업로드 완료')
    } catch {
      setStatus('이미지 업로드 실패')
    } finally {
      setUploading(false)
    }
  }

  const save = async (published: boolean) => {
    const slug = slugRef.current || generateSlug(title || 'untitled')
    slugRef.current = slug

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const excerpt = extractExcerpt(content)
    const body = { slug, title, excerpt, coverImage, alt: alt || title, content, readingTime, published, tags }

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
    { placeholder: '제목', value: title, onChange: handleTitleChange },
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
            disabled={uploading}
            className="text-sm border border-gray-300 px-3 py-1.5 rounded disabled:opacity-40"
          >
            임시저장
          </button>
          <button
            onClick={() => save(true)}
            disabled={uploading}
            className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded disabled:opacity-40"
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

      <div className="border border-gray-200 rounded p-3 space-y-2">
        <label className="text-sm text-gray-500">커버 이미지</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageFile}
          disabled={uploading}
          className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded file:text-sm file:bg-white file:cursor-pointer disabled:opacity-40"
        />
        {coverImage && (
          <img
            src={coverImage}
            alt="커버 미리보기"
            className="h-24 w-auto rounded object-cover border border-gray-100"
          />
        )}
      </div>

      <Editor content={content} onChange={handleContentChange} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  if (!verifyAdmin(req as any)) {
    const supabase = createSupabaseServerClient(req, res)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { redirect: { destination: '/login', permanent: false } }
    }
  }
  return { props: {} }
}
