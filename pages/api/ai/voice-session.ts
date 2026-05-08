import type { NextApiRequest, NextApiResponse } from 'next'
import { getEssayBySlug } from '@/lib/essays-db'
import { extractTextFromTipTap } from '@/lib/embedding'

const MAX_WORDS = 3000 // ~4000 토큰

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end()
  }

  const { slug } = req.body
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'slug is required' })
  }

  const essay = await getEssayBySlug(slug)
  if (!essay) return res.status(404).json({ error: 'Essay not found' })

  const fullText = extractTextFromTipTap(essay.content)
  const words = fullText.split(/\s+/).filter(Boolean)
  const truncated =
    words.length > MAX_WORDS ? words.slice(0, MAX_WORDS).join(' ') + '...' : fullText

  const instructions = `당신은 독자가 에세이를 읽는 도중 대화하는 AI 어시스턴트입니다.
아래 에세이를 읽었으며, 독자의 질문에 에세이 내용을 바탕으로 한국어로 답합니다.
에세이 저자를 흉내내지 않고, 독자와 함께 에세이 내용을 탐구하는 방식으로 대화하세요.
답변은 2-3문장으로 간결하게 합니다. 에세이와 관련 없는 질문은 정중히 에세이 주제로 돌아옵니다.

[에세이 제목: ${essay.title}]

${truncated}`

  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview',
      voice: 'alloy',
      instructions,
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      },
      max_response_output_tokens: 200,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('[voice-session] OpenAI error:', err)
    return res.status(502).json({ error: 'Voice session creation failed' })
  }

  const data = await response.json()
  return res.status(200).json({
    client_secret: data.client_secret.value,
    session_id: data.id,
    expires_at: data.client_secret.expires_at,
  })
}
