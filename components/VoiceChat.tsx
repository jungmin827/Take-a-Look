import { useState, useRef, useCallback, useEffect } from 'react'

type Status = 'idle' | 'connecting' | 'connected' | 'error'

interface Props {
  slug: string
}

function float32ToInt16(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]))
    int16[i] = clamped * 0x7fff
  }
  return int16
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export default function VoiceChat({ slug }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [timeLeft, setTimeLeft] = useState(300)
  const [showWarning, setShowWarning] = useState(false)

  const statusRef = useRef<Status>('idle')
  const wsRef = useRef<WebSocket | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const retryRef = useRef(0)
  const audioQueueRef = useRef<ArrayBuffer[]>([])
  const playingRef = useRef(false)
  const nextPlayTimeRef = useRef(0)

  const updateStatus = (s: Status) => {
    statusRef.current = s
    setStatus(s)
  }

  const stopAudio = () => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const disconnect = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    stopAudio()
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.close()
      wsRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    audioQueueRef.current = []
    playingRef.current = false
    nextPlayTimeRef.current = 0
    updateStatus('idle')
    setTimeLeft(300)
    setShowWarning(false)
  }, [])

  const scheduleAudioChunk = useCallback((pcm16Buffer: ArrayBuffer) => {
    const ctx = audioCtxRef.current
    if (!ctx) return

    const int16 = new Int16Array(pcm16Buffer)
    const float32 = new Float32Array(int16.length)
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 0x7fff

    const audioBuffer = ctx.createBuffer(1, float32.length, 24000)
    audioBuffer.copyToChannel(float32, 0)

    const source = ctx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(ctx.destination)

    const startAt = Math.max(ctx.currentTime, nextPlayTimeRef.current)
    source.start(startAt)
    nextPlayTimeRef.current = startAt + audioBuffer.duration
  }, [])

  const connect = useCallback(async () => {
    updateStatus('connecting')

    try {
      const sessionRes = await fetch('/api/ai/voice-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (!sessionRes.ok) throw new Error('Session API error')
      const { client_secret } = await sessionRes.json()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioCtx = new AudioContext({ sampleRate: 24000 })
      audioCtxRef.current = audioCtx
      nextPlayTimeRef.current = audioCtx.currentTime

      const ws = new WebSocket(
        'wss://api.openai.com/v1/realtime?model=gpt-realtime-2',
        ['realtime', `openai-insecure-api-key.${client_secret}`]
      )
      wsRef.current = ws

      ws.onopen = () => {
        updateStatus('connected')
        retryRef.current = 0

        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev === 30) setShowWarning(true)
            if (prev <= 1) {
              disconnect()
              return 0
            }
            return prev - 1
          })
        }, 1000)

        const source = audioCtx.createMediaStreamSource(stream)
        const processor = audioCtx.createScriptProcessor(4096, 1, 1)
        processorRef.current = processor

        const silentGain = audioCtx.createGain()
        silentGain.gain.value = 0
        processor.connect(silentGain)
        silentGain.connect(audioCtx.destination)

        processor.onaudioprocess = e => {
          if (ws.readyState !== WebSocket.OPEN) return
          const float32 = e.inputBuffer.getChannelData(0)
          const int16 = float32ToInt16(float32)
          ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: arrayBufferToBase64(int16.buffer as ArrayBuffer),
          }))
        }

        source.connect(processor)
      }

      ws.onmessage = e => {
        const event = JSON.parse(e.data)

        if (event.type === 'response.audio.delta' && event.delta) {
          scheduleAudioChunk(base64ToArrayBuffer(event.delta))
        }

        if (event.type === 'error') {
          console.error('[VoiceChat] Realtime API error:', event.error)
        }
      }

      ws.onclose = () => {
        if (statusRef.current === 'connected' && retryRef.current < 3) {
          retryRef.current++
          stopAudio()
          setTimeout(() => connect(), 1500)
        } else if (statusRef.current !== 'idle') {
          updateStatus('error')
          stopAudio()
        }
      }

      ws.onerror = () => {
        updateStatus('error')
        disconnect()
      }
    } catch (err) {
      console.error('[VoiceChat] connect error:', err)
      updateStatus('error')
      disconnect()
    }
  }, [slug, disconnect, scheduleAudioChunk])

  useEffect(() => () => disconnect(), [disconnect])

  const isConnected = status === 'connected'
  const isConnecting = status === 'connecting'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {showWarning && isConnected && (
        <div
          style={{
            background: '#0a0a0a',
            border: '0.5px solid rgba(245,243,238,0.5)',
            color: '#f5f3ee',
            padding: '4px 14px',
            fontSize: 11,
            fontFamily: 'Noto Sans KR, sans-serif',
            letterSpacing: '0.04em',
          }}
        >
          30초 후 세션이 종료됩니다
        </div>
      )}

      {isConnected && (
        <div
          style={{
            color: 'rgba(245,243,238,0.5)',
            fontSize: 11,
            fontFamily: 'Noto Sans KR, sans-serif',
            letterSpacing: '0.06em',
          }}
        >
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      )}

      <button
        onClick={isConnected ? disconnect : connect}
        disabled={isConnecting}
        aria-label={isConnected ? '음성 대화 종료' : '음성 대화 시작'}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: '0.5px solid',
          borderColor: isConnected ? '#f5f3ee' : 'rgba(245,243,238,0.35)',
          background: isConnected ? '#f5f3ee' : '#0a0a0a',
          color: isConnected ? '#0a0a0a' : '#f5f3ee',
          cursor: isConnecting ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.2s, background 0.2s',
          outline: 'none',
        }}
      >
        {isConnecting && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        )}
        {isConnected && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" />
          </svg>
        )}
        {(status === 'idle' || status === 'error') && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeLinecap="round" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>

      {status === 'error' && (
        <div
          style={{
            color: 'rgba(245,243,238,0.55)',
            fontSize: 11,
            fontFamily: 'Noto Sans KR, sans-serif',
          }}
        >
          연결에 실패했습니다
        </div>
      )}
    </div>
  )
}
