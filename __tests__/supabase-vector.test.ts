import { describe, it, expect, vi, beforeEach } from 'vitest'

// Supabase mock
const mockFrom = vi.fn()
const mockRpc = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}))

import { upsertEssayEmbeddings, getTopChunksForEssay } from '@/lib/supabase-vector'

const sampleChunks = [
  { chunk_index: 0, content: 'first chunk', embedding: [0.1, 0.2] },
  { chunk_index: 1, content: 'second chunk', embedding: [0.3, 0.4] },
]

describe('upsertEssayEmbeddings', () => {
  beforeEach(() => {
    mockFrom.mockReset()
    mockRpc.mockReset()
  })

  it('기존 임베딩 삭제 후 새 임베딩을 삽입한다', async () => {
    const mockDelete = { error: null }
    const mockInsert = { error: null }

    mockFrom.mockImplementation(() => ({
      delete: () => ({ eq: () => mockDelete }),
      insert: () => mockInsert,
    }))

    await expect(upsertEssayEmbeddings('essay-1', sampleChunks)).resolves.toBeUndefined()
    expect(mockFrom).toHaveBeenCalledWith('essay_embeddings')
  })

  it('삭제 실패 시 에러를 던진다', async () => {
    mockFrom.mockImplementation(() => ({
      delete: () => ({ eq: () => ({ error: { message: 'delete failed' } }) }),
    }))

    await expect(upsertEssayEmbeddings('essay-1', sampleChunks)).rejects.toThrow('Delete old embeddings failed')
  })

  it('삽입 실패 시 에러를 던진다', async () => {
    mockFrom.mockImplementation(() => ({
      delete: () => ({ eq: () => ({ error: null }) }),
      insert: () => ({ error: { message: 'insert failed' } }),
    }))

    await expect(upsertEssayEmbeddings('essay-1', sampleChunks)).rejects.toThrow('Embedding insert failed')
  })
})

describe('getTopChunksForEssay', () => {
  beforeEach(() => {
    mockFrom.mockReset()
    mockRpc.mockReset()
  })

  it('유사도 검색 결과에서 content 배열을 반환한다', async () => {
    const mockData = [
      { content: 'relevant chunk 1' },
      { content: 'relevant chunk 2' },
    ]
    mockRpc.mockResolvedValue({ data: mockData, error: null })

    const result = await getTopChunksForEssay('essay-1', [0.1, 0.2], 2)
    expect(result).toEqual(['relevant chunk 1', 'relevant chunk 2'])
    expect(mockRpc).toHaveBeenCalledWith('match_essay_chunks', {
      query_embedding: [0.1, 0.2],
      essay_id_filter: 'essay-1',
      match_count: 2,
    })
  })

  it('데이터가 null이면 빈 배열을 반환한다', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })
    const result = await getTopChunksForEssay('essay-1', [0.1], 5)
    expect(result).toEqual([])
  })

  it('RPC 실패 시 에러를 던진다', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'rpc failed' } })
    await expect(getTopChunksForEssay('essay-1', [0.1], 5)).rejects.toThrow('Similarity search failed')
  })
})
