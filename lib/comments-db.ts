import { prisma } from './db'

export interface CommentNode {
  id: string
  essayId: string
  authorName: string
  body: string
  parentId: string | null
  createdAt: string
  replies: CommentNode[]
}

export async function getComments(essayId: string): Promise<CommentNode[]> {
  const rows = await prisma.comment.findMany({
    where: { essayId },
    orderBy: { createdAt: 'asc' },
  })

  const roots = rows.filter(r => !r.parentId)
  const replies = rows.filter(r => !!r.parentId)

  return roots.map(root => ({
    id: root.id,
    essayId: root.essayId,
    authorName: root.authorName,
    body: root.body,
    parentId: null,
    createdAt: root.createdAt.toISOString(),
    replies: replies
      .filter(r => r.parentId === root.id)
      .map(r => ({
        id: r.id,
        essayId: r.essayId,
        authorName: r.authorName,
        body: r.body,
        parentId: r.parentId,
        createdAt: r.createdAt.toISOString(),
        replies: [],
      })),
  }))
}
