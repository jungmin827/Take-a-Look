import { Essay } from '@/types'
import Card from './Card'

interface Props {
  essays: Essay[]
}

export default function AutoMarquee({ essays }: Props) {
  if (essays.length === 0) return null

  // 두 레인에 사용할 아이템 — 역순으로 배치해 시각적 변화 주기
  const lane1 = essays
  const lane2 = [...essays].reverse()

  // 각 레인을 두 번 복제 → seamless 무한 루프 (translateX -50% 트릭)
  const track1 = [...lane1, ...lane1]
  const track2 = [...lane2, ...lane2]

  return (
    <div className="overflow-hidden [--pause:running] hover:[--pause:paused] py-2">
      {/* Lane 1 — 왼쪽으로 흐름 */}
      <div
        className="flex gap-5 mb-5 w-max animate-marquee-left"
        style={{ animationPlayState: 'var(--pause)' }}
      >
        {track1.map((essay, i) => (
          <div key={`l1-${essay.slug}-${i}`} className="w-[200px] flex-shrink-0">
            <Card essay={essay} />
          </div>
        ))}
      </div>

      {/* Lane 2 — 오른쪽으로 흐름 (역방향) */}
      <div
        className="flex gap-5 w-max animate-marquee-right"
        style={{ animationPlayState: 'var(--pause)' }}
      >
        {track2.map((essay, i) => (
          <div key={`l2-${essay.slug}-${i}`} className="w-[200px] flex-shrink-0">
            <Card essay={essay} />
          </div>
        ))}
      </div>
    </div>
  )
}
