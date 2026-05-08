import { describe, it, expect, vi, beforeEach } from 'vitest'

// OpenAI mock — use vi.hoisted so the variable is available inside the hoisted vi.mock factory
const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }))

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      embeddings = { create: mockCreate }
    },
  }
})

import { extractTextFromTipTap, chunkText, generateEmbedding, generateChunkEmbeddings } from '@/lib/embedding'

function getMockCreate() {
  return mockCreate
}

describe('extractTextFromTipTap', () => {
  it('TipTap JSON에서 텍스트를 추출한다', () => {
    const tiptapJson = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello' }, { type: 'text', text: ' World' }],
        },
      ],
    })
    expect(extractTextFromTipTap(tiptapJson)).toBe('Hello\n World')
  })

  it('유효하지 않은 JSON이면 원본 문자열을 반환한다', () => {
    expect(extractTextFromTipTap('plain text')).toBe('plain text')
  })

  it('빈 content 노드를 처리한다', () => {
    const tiptapJson = JSON.stringify({ type: 'doc' })
    expect(extractTextFromTipTap(tiptapJson)).toBe('')
  })

  it('중첩된 노드에서 텍스트를 재귀 추출한다', () => {
    const tiptapJson = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '인용문' }],
            },
          ],
        },
      ],
    })
    const result = extractTextFromTipTap(tiptapJson)
    expect(result).toContain('인용문')
  })
})

describe('chunkText', () => {
  it('빈 텍스트이면 빈 배열을 반환한다', () => {
    expect(chunkText('')).toEqual([])
  })

  it('단어 수가 chunkSize 이하이면 청크 1개를 반환한다', () => {
    const text = 'one two three'
    const chunks = chunkText(text, 512, 50)
    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toBe('one two three')
  })

  it('chunkSize만큼 나누어 여러 청크를 생성한다', () => {
    const words = Array.from({ length: 10 }, (_, i) => `word${i}`)
    const text = words.join(' ')
    const chunks = chunkText(text, 4, 1)
    // step = 4-1 = 3, so: [0-3], [3-6], [6-9], [9-12(end)]
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks[0]).toBe('word0 word1 word2 word3')
  })

  it('overlap이 chunkSize 이상이면 에러를 던진다', () => {
    expect(() => chunkText('hello world', 50, 50)).toThrow('overlap must be less than chunkSize')
    expect(() => chunkText('hello world', 50, 60)).toThrow('overlap must be less than chunkSize')
  })

  it('각 청크가 비어있지 않다', () => {
    const words = Array.from({ length: 20 }, (_, i) => `w${i}`)
    const chunks = chunkText(words.join(' '), 5, 1)
    chunks.forEach(chunk => expect(chunk.trim()).not.toBe(''))
  })
})

describe('generateEmbedding', () => {
  beforeEach(() => {
    getMockCreate().mockReset()
  })

  it('OpenAI API를 호출하고 embedding 배열을 반환한다', async () => {
    const fakeEmbedding = [0.1, 0.2, 0.3]
    getMockCreate().mockResolvedValue({
      data: [{ embedding: fakeEmbedding }],
    })

    const result = await generateEmbedding('test text')
    expect(result).toEqual(fakeEmbedding)
    expect(getMockCreate()).toHaveBeenCalledWith({
      model: 'text-embedding-3-small',
      input: 'test text',
    })
  })

  it('API가 빈 data를 반환하면 에러를 던진다', async () => {
    getMockCreate().mockResolvedValue({ data: [] })
    await expect(generateEmbedding('test')).rejects.toThrow('No embedding returned')
  })
})

describe('generateChunkEmbeddings', () => {
  beforeEach(() => {
    getMockCreate().mockReset()
  })

  it('빈 텍스트이면 빈 배열을 반환한다', async () => {
    const result = await generateChunkEmbeddings(JSON.stringify({ type: 'doc', content: [] }))
    expect(result).toEqual([])
    expect(getMockCreate()).not.toHaveBeenCalled()
  })

  it('청크별 임베딩을 배치로 생성하고 chunk_index를 포함한다', async () => {
    const text = Array.from({ length: 600 }, (_, i) => `word${i}`).join(' ')
    const content = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    })

    const fakeEmbeddings = [
      { embedding: [0.1, 0.2] },
      { embedding: [0.3, 0.4] },
    ]
    getMockCreate().mockResolvedValue({ data: fakeEmbeddings })

    const result = await generateChunkEmbeddings(content)

    // 배치 호출 1회만 발생해야 함
    expect(getMockCreate()).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(fakeEmbeddings.length)
    result.forEach((item, i) => {
      expect(item.chunk_index).toBe(i)
      expect(item.embedding).toEqual(fakeEmbeddings[i].embedding)
      expect(typeof item.content).toBe('string')
    })
  })
})
