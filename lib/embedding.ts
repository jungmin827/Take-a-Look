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
  return response.data[0].embedding
}

export async function generateChunkEmbeddings(
  content: string
): Promise<Array<{ chunk_index: number; content: string; embedding: number[] }>> {
  const text = extractTextFromTipTap(content)
  const chunks = chunkText(text)
  const results: Array<{ chunk_index: number; content: string; embedding: number[] }> = []
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i])
    results.push({ chunk_index: i, content: chunks[i], embedding })
  }
  return results
}
