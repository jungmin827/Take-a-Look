import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function upsertEssayEmbeddings(
  essayId: string,
  chunks: Array<{ chunk_index: number; content: string; embedding: number[] }>
): Promise<void> {
  const supabase = getAdminClient()

  const { error: deleteError } = await supabase
    .from('essay_embeddings')
    .delete()
    .eq('essay_id', essayId)

  if (deleteError) throw new Error(`Delete old embeddings failed: ${deleteError.message}`)

  const rows = chunks.map(c => ({
    essay_id: essayId,
    chunk_index: c.chunk_index,
    content: c.content,
    embedding: c.embedding,
  }))

  const { error } = await supabase.from('essay_embeddings').insert(rows)
  if (error) throw new Error(`Embedding insert failed: ${error.message}`)
}

export async function getTopChunksForEssay(
  essayId: string,
  queryEmbedding: number[],
  topK = 5
): Promise<string[]> {
  const supabase = getAdminClient()

  const { data, error } = await supabase.rpc('match_essay_chunks', {
    query_embedding: queryEmbedding,
    essay_id_filter: essayId,
    match_count: topK,
  })

  if (error) throw new Error(`Similarity search failed: ${error.message}`)
  return (data ?? []).map((row: { content: string }) => row.content)
}
