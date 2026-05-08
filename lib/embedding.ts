import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function extractTextFromNode(node: any): string {
  if (node.type === 'text') return node.text ?? ''
  if (!node.content) return ''
  return node.content.map(extractTextFromNode).join('\n')
}

export function extractTextFromTipTap(content: string): string {
  try {
    const doc = JSON.parse(content)
    return extractTextFromNode(doc).trim()
  } catch {
    return content.trim()
  }
}

export function chunkText(text: string, chunkSize = 512, overlap = 50): string[] {
  if (overlap >= chunkSize) throw new Error('overlap must be less than chunkSize')
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const chunks: string[] = []
  let start = 0
  while (start < words.length) {
    const chunk = words.slice(start, start + chunkSize).join(' ')
    if (chunk.trim()) chunks.push(chunk)
    start += chunkSize - overlap
  }
  return chunks
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  if (!response.data[0]) throw new Error('No embedding returned')
  return response.data[0].embedding
}

export async function generateChunkEmbeddings(
  content: string
): Promise<Array<{ chunk_index: number; content: string; embedding: number[] }>> {
  const text = extractTextFromTipTap(content)
  const chunks = chunkText(text)
  if (chunks.length === 0) return []
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: chunks,
  })
  return response.data.map((d, i) => ({
    chunk_index: i,
    content: chunks[i],
    embedding: d.embedding,
  }))
}
