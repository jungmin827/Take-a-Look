import { useState, useCallback, useRef } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { verifyAdmin } from '@/lib/admin-auth'
import { getEssayBySlug } from '@/lib/essays'
import { Essay } from '@/types'
import { uploadCoverImage } from '@/lib/upload-image'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

interface Props { essay: Essay }

export default function EditPage({ essay }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(essay.title)
  const [excerpt, setExcerpt] = useState(essay.excerpt)
  const [coverImage, setCoverImage] = useState(essay.coverImage)
  const [alt, setAlt] = useState(essay.alt)
  const [tagsInput, setTagsInput] = useState(essay.tags.join(', '))
  const [readingTime, setReadingTime] = useState(essay.readingTime)
  const [content, setContent] = useState(essay.content)
  const [status, setStatus] = useState('')
  const [uploading, setUploading] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>()

  const autoSave = useCallback((newContent: string) => {
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      setStatus('저장 중...')
      await fetch(`/api/essays/${essay.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      })
      setStatus('자동 저장됨')
    }, 3000)
  }, [essay.id])

  const handleContentChange = (json: string) => {
    setContent(json)
    autoSave(json)
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
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    await fetch(`/api/essays/${essay.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, excerpt, coverImage, alt, content, readingTime, published, tags }),
    })
    if (published) router.push(`/${essay.slug}`)
    else setStatus('저장됨')
  }

  const fields = [
    { placeholder: '제목', value: title, onChange: setTitle },
    { placeholder: '요약', value: excerpt, onChange: setExcerpt },
    { placeholder: '이미지 alt 텍스트', value: alt, onChange: setAlt },
    { placeholder: '태그 (쉼표 구분)', value: tagsInput, onChange: setTagsInput },
    { placeholder: '읽기 시간', value: readingTime, onChange: setReadingTime },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">글 수정 — {essay.title}</h1>
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

      {/* 커버 이미지 업로드 */}
      <div className="border border-gray-200 rounded p-3 space-y-2">
        <label className="text-sm text-gray-500">커버 이미지</label>
        {coverImage && (
          <img
            src={coverImage}
            alt="현재 커버 이미지"
            className="h-24 w-auto rounded object-cover border border-gray-100"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageFile}
          disabled={uploading}
          className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded file:text-sm file:bg-white file:cursor-pointer disabled:opacity-40"
        />
      </div>

      <Editor content={content} onChange={handleContentChange} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, params }) => {
  if (!verifyAdmin(req as any)) {
    return { redirect: { destination: '/admin', permanent: false } }
  }
  const essay = await getEssayBySlug(params?.slug as string)
  if (!essay) return { notFound: true }
  return { props: { essay } }
}
