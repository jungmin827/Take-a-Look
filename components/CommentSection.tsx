import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@/lib/hooks/useUser'

interface CommentNode {
  id: string
  authorName: string
  body: string
  parentId: string | null
  createdAt: string
  replies: CommentNode[]
}

interface Props { essayId: string }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function ReplyForm({ essayId, parentId, onPosted, onCancel }: {
  essayId: string
  parentId: string
  onPosted: () => void
  onCancel: () => void
}) {
  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essayId, body, parentId }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '오류가 발생했습니다.')
      return
    }
    onPosted()
  }

  return (
    <div className="mt-3 ml-4 space-y-2">
      <textarea
        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm resize-none"
        rows={2}
        placeholder="답글 (5~500자)"
        value={body}
        onChange={e => setBody(e.target.value)}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          className="text-sm bg-gray-900 text-white px-3 py-1 rounded"
        >
          답글 작성
        </button>
        <button onClick={onCancel} className="text-sm text-gray-400">취소</button>
      </div>
    </div>
  )
}

function CommentItem({ comment, essayId, onPosted, canReply }: {
  comment: CommentNode
  essayId: string
  onPosted: () => void
  canReply: boolean
}) {
  const [showReply, setShowReply] = useState(false)

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-medium text-sm">{comment.authorName}</span>
        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
      {canReply && (
        <button
          onClick={() => setShowReply(!showReply)}
          className="text-xs text-gray-400 mt-1 hover:text-gray-600"
        >
          답글
        </button>
      )}

      {showReply && (
        <ReplyForm
          essayId={essayId}
          parentId={comment.id}
          onPosted={() => { setShowReply(false); onPosted() }}
          onCancel={() => setShowReply(false)}
        />
      )}

      {comment.replies.map(reply => (
        <div key={reply.id} className="ml-4 mt-3 pl-3 border-l-2 border-gray-100">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-medium text-sm">{reply.authorName}</span>
            <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.body}</p>
        </div>
      ))}
    </div>
  )
}

export default function CommentSection({ essayId }: Props) {
  const { user } = useUser()
  const [comments, setComments] = useState<CommentNode[]>([])
  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const res = await fetch(`/api/comments?essayId=${essayId}`)
    if (res.ok) setComments(await res.json())
  }, [essayId])

  useEffect(() => { load() }, [load])

  const submit = async () => {
    setError('')
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essayId, body }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '오류가 발생했습니다.')
      return
    }
    setBody('')
    load()
  }

  return (
    <section className="mt-16">
      <h2 className="text-lg font-bold mb-6">
        댓글{comments.length > 0 ? ` (${comments.length})` : ''}
      </h2>

      <div className="mb-8">
        {user ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">{user.email?.split('@')[0]} 으로 작성됩니다</p>
            <textarea
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm resize-none"
              rows={3}
              placeholder="댓글을 입력하세요 (5~500자)"
              value={body}
              onChange={e => setBody(e.target.value)}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              onClick={submit}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded"
            >
              댓글 작성
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-4 border border-gray-100 rounded px-4 text-center">
            댓글을 작성하려면{' '}
            <Link href="/login" className="text-gray-900 font-medium hover:underline">로그인</Link>
            {' '}이 필요합니다.
          </p>
        )}
      </div>

      <div>
        {comments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">첫 댓글을 남겨보세요.</p>
        ) : (
          comments.map(c => (
            <CommentItem key={c.id} comment={c} essayId={essayId} onPosted={load} canReply={!!user} />
          ))
        )}
      </div>
    </section>
  )
}
