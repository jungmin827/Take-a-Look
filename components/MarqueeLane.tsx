import { Essay } from '@/types'

interface Props {
  essays: Essay[]
  direction: 'left' | 'right'
  speed: number
  reverseList?: boolean
  paused: boolean
  renderCard: (essay: Essay, index: number) => React.ReactNode
}

export default function MarqueeLane({
  essays,
  direction,
  speed,
  reverseList = false,
  paused,
  renderCard,
}: Props) {
  const list = reverseList ? [...essays].reverse() : essays
  const doubled = [...list, ...list]
  const animName = direction === 'left' ? 'marq-left' : 'marq-right'

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="marq-track flex h-full w-max will-change-transform"
        style={{
          animation: `${animName} ${speed}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {doubled.map((essay, i) => (
          <div key={`${essay.id}-${i}`} className="h-full flex-none">
            {renderCard(essay, i % list.length)}
          </div>
        ))}
      </div>
    </div>
  )
}
