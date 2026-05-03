import { useRef } from 'react'
import { Essay } from '@/types'
import Card from './Card'

interface Props {
  essays: Essay[]
  variant?: 'feed' | 'strip'
}

export default function HorizontalScroll({ essays, variant = 'feed' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    const amount = ref.current.clientWidth * 0.8
    ref.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  const itemClass =
    variant === 'feed'
      ? 'snap-start flex-shrink-0 w-[calc(50%-8px)]'
      : 'snap-start flex-shrink-0 w-[160px] md:w-[220px]'

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm text-lg"
        aria-label="이전"
      >
        ‹
      </button>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-scroll scroll-smooth scrollbar-hide snap-x snap-mandatory"
      >
        {essays.map(essay => (
          <div key={essay.slug} className={itemClass}>
            <Card essay={essay} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm text-lg"
        aria-label="다음"
      >
        ›
      </button>
    </div>
  )
}
