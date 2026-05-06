import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Essay } from '@/types'
import MarqueeLane from './MarqueeLane'

interface Props {
  essays: Essay[]
}

function BigCard({
  essay,
  index,
  isHover,
  onMouseEnter,
  onMouseLeave,
}: {
  essay: Essay
  index: number
  isHover: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const category = essay.tags[0]?.toUpperCase() ?? 'ESSAY'
  const displayNum = String(index + 1).padStart(2, '0')
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/${essay.slug}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative block overflow-hidden cursor-pointer bg-ink flex-none"
      style={{ width: 480, height: '100%', marginRight: 12 }}
    >
      {!imgError && (
        <Image
          src={essay.coverImage}
          alt={essay.alt}
          fill
          className="object-cover grayscale"
          style={{ opacity: isHover ? 0.85 : 0.65, transition: 'opacity 0.4s' }}
          sizes="480px"
          priority={index < 3}
          onError={() => setImgError(true)}
        />
      )}
      {/* Giant index number with mix-blend-mode: difference */}
      <div
        aria-hidden
        className="absolute pointer-events-none select-none font-serif italic"
        style={{
          top: -30,
          left: -10,
          fontSize: 280,
          lineHeight: 1,
          letterSpacing: '-0.06em',
          color: '#f5f3ee',
          mixBlendMode: 'difference',
        }}
      >
        {displayNum}
      </div>
      {/* Bottom text block */}
      <div
        className="absolute flex flex-col text-paper"
        style={{ left: 24, right: 24, bottom: 22, gap: 8 }}
      >
        <div
          className="flex items-center font-sans font-medium uppercase"
          style={{ gap: 10, fontSize: 9, letterSpacing: '0.22em', opacity: 0.85 }}
        >
          <span>{category}</span>
          <span
            style={{
              width: 18,
              height: 1,
              background: 'currentColor',
              opacity: 0.5,
              flexShrink: 0,
              display: 'inline-block',
            }}
          />
          <span className="font-serif italic" style={{ fontSize: 12, letterSpacing: 0 }}>
            {essay.readingTime}
          </span>
        </div>
        <h3
          className="m-0 font-sans font-medium"
          style={{
            fontSize: 28,
            lineHeight: 1.18,
            letterSpacing: '-0.025em',
            maxWidth: 380,
            textWrap: 'balance',
          } as React.CSSProperties}
        >
          {essay.title}
        </h3>
        <div
          className="font-serif italic"
          style={{ fontSize: 14, opacity: 0.7, letterSpacing: '-0.005em' }}
        >
          {essay.excerpt.length > 60 ? essay.excerpt.slice(0, 60) + '…' : essay.excerpt}
        </div>
        <div className="flex flex-wrap" style={{ gap: 6, marginTop: 2 }}>
          {essay.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                color: 'rgba(245,243,238,0.9)',
                border: '0.5px solid rgba(245,243,238,0.5)',
                padding: '2px 8px',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

function SlimCard({
  essay,
  index,
  isHover,
  onMouseEnter,
  onMouseLeave,
}: {
  essay: Essay
  index: number
  isHover: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const category = essay.tags[0]?.toUpperCase() ?? 'ESSAY'
  const displayNum = String(index + 1).padStart(2, '0')
  const date = essay.date.slice(0, 10).replace(/-/g, '.')
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/${essay.slug}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative flex items-stretch overflow-hidden cursor-pointer flex-none"
      style={{ width: 280, height: '100%', marginRight: 10, background: '#1a1a1a' }}
    >
      {/* Thumbnail */}
      <div className="relative flex-none bg-ink" style={{ width: 100 }}>
        {!imgError && (
          <Image
            src={essay.coverImage}
            alt={essay.alt}
            fill
            style={{
              objectFit: 'cover',
              filter: 'grayscale(1) contrast(1.1)',
              opacity: isHover ? 1 : 0.85,
              transition: 'opacity 0.3s',
            }}
            sizes="100px"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      {/* Text area */}
      <div
        className="flex flex-col justify-between min-w-0 text-paper"
        style={{ flex: 1, padding: '14px 16px' }}
      >
        <div
          className="flex justify-between items-baseline font-serif italic"
          style={{ fontSize: 12, opacity: 0.6 }}
        >
          <span>№ {displayNum}</span>
          <span>{date}</span>
        </div>
        <h4
          className="m-0 font-sans font-medium"
          style={{
            fontSize: 15,
            lineHeight: 1.3,
            letterSpacing: '-0.015em',
            textWrap: 'balance',
          } as React.CSSProperties}
        >
          {essay.title}
        </h4>
        <div
          className="font-sans font-medium uppercase"
          style={{ fontSize: 9, letterSpacing: '0.18em', opacity: 0.55 }}
        >
          {category}
        </div>
      </div>
    </Link>
  )
}

export default function MainHeroMarquee({ essays }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const total = essays.length
  const paused = hoverId !== null

  if (essays.length === 0) {
    return (
      <div className="w-full h-full bg-ink flex items-center justify-center text-paper text-sm font-sans opacity-40">
        에세이를 기다리는 중입니다.
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-ink overflow-hidden font-sans text-paper">
      {/* Ghost background typography */}
      <div
        aria-hidden
        className="absolute pointer-events-none select-none font-serif italic whitespace-nowrap"
        style={{
          left: -40,
          bottom: -120,
          fontSize: 480,
          lineHeight: 0.85,
          letterSpacing: '-0.05em',
          color: 'rgba(245,243,238,0.04)',
        }}
      >
        Take a Look.
      </div>

      {/* Two-lane marquee */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{ padding: '100px 0 80px', gap: 14 }}
      >
        {/* Lane 1: BigCard, 62% height, flows left */}
        <div style={{ flex: '0 0 62%', minHeight: 0 }}>
          <MarqueeLane
            essays={essays}
            direction="left"
            speed={60}
            paused={paused}
            renderCard={(essay, idx) => (
              <BigCard
                essay={essay}
                index={idx}
                isHover={hoverId === essay.id}
                onMouseEnter={() => { setHoverId(essay.id); setActiveIdx(idx) }}
                onMouseLeave={() => setHoverId(null)}
              />
            )}
          />
        </div>
        {/* Lane 2: SlimCard, ~38% height, flows right */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <MarqueeLane
            essays={essays}
            direction="right"
            speed={42}
            reverseList
            paused={paused}
            renderCard={(essay, idx) => (
              <SlimCard
                essay={essay}
                index={idx}
                isHover={hoverId === essay.id}
                onMouseEnter={() => { setHoverId(essay.id); setActiveIdx(idx) }}
                onMouseLeave={() => setHoverId(null)}
              />
            )}
          />
        </div>
      </div>

      {/* Top-left: Logo */}
      <div className="absolute z-10" style={{ top: 26, left: 30 }}>
        <div className="flex flex-col" style={{ gap: 2, lineHeight: 1 }}>
          <div
            className="font-serif italic text-paper"
            style={{ fontSize: 22, letterSpacing: '-0.01em' }}
          >
            Take a Look
          </div>
          <div
            className="font-sans font-medium uppercase text-paper"
            style={{ fontSize: 9, letterSpacing: '0.18em', opacity: 0.55 }}
          >
            Essays on Obsessions
          </div>
        </div>
      </div>

      {/* Top-right: Nav */}
      <nav className="absolute z-10 flex items-center" style={{ top: 28, right: 30, gap: 24 }}>
        {[
          { label: '글쓰기', href: '/admin/write' },
          { label: '로그인', href: '/admin' },
          { label: '회원가입', href: '/signup' },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="font-sans font-medium uppercase"
            style={{
              fontSize: 10,
              letterSpacing: '0.2em',
              color: 'rgba(245,243,238,0.45)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,243,238,0.85)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,243,238,0.45)')}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom-right: HUD */}
      <div
        className="absolute z-10 flex items-center"
        style={{ bottom: 28, right: 30, gap: 18 }}
      >
        <span
          className="font-serif italic"
          style={{ fontVariantNumeric: 'tabular-nums', fontSize: 14, color: '#f5f3ee' }}
        >
          <span style={{ fontSize: 26 }}>{String(activeIdx + 1).padStart(2, '0')}</span>
          <span style={{ color: 'rgba(245,243,238,0.4)', margin: '0 4px' }}>/</span>
          <span style={{ color: 'rgba(245,243,238,0.4)', fontSize: 14 }}>
            {String(total).padStart(2, '0')}
          </span>
        </span>
        <div className="flex" style={{ gap: 6 }}>
          <button
            onClick={() => setActiveIdx((activeIdx - 1 + total) % total)}
            className="flex items-center justify-center font-serif italic"
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: '0.5px solid rgba(245,243,238,0.22)',
              background: 'transparent',
              color: '#f5f3ee',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ←
          </button>
          <button
            onClick={() => setActiveIdx((activeIdx + 1) % total)}
            className="flex items-center justify-center font-serif italic"
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: '0.5px solid rgba(245,243,238,0.22)',
              background: 'transparent',
              color: '#f5f3ee',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Bottom-left: Label */}
      <div
        className="absolute z-10 font-sans font-medium uppercase"
        style={{
          bottom: 30,
          left: 30,
          fontSize: 10,
          letterSpacing: '0.22em',
          color: 'rgba(245,243,238,0.45)',
        }}
      >
        AN INDEX OF OBSESSIONS · {total} ENTRIES
      </div>
    </div>
  )
}
