import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Essay } from '@/types'
import { getEssayBySlug, getRelatedEssays } from '@/lib/essays'
import CommentSection from '@/components/CommentSection'

const EditorViewer = dynamic(() => import('@/components/EditorViewer'), { ssr: false })
const VoiceChat = dynamic(() => import('@/components/VoiceChat'), { ssr: false })

interface Props {
  essay: Essay
  related: Essay[]
}

export default function EssayPage({ essay, related }: Props) {
  const category = essay.tags[0]?.toUpperCase() ?? 'ESSAY'
  const dateStr = essay.date.slice(0, 10).replace(/-/g, '.')

  return (
    <>
      <Head>
        <title>{essay.title} — Take a Look</title>
        <meta name="description" content={essay.excerpt} />
        <meta property="og:title" content={`${essay.title} — Take a Look`} />
        <meta property="og:description" content={essay.excerpt} />
        <meta property="og:image" content={`/og/${essay.slug}.png`} />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:type" content="article" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: essay.title,
              datePublished: essay.date,
              description: essay.excerpt,
            }),
          }}
        />
      </Head>

      <div className="min-h-screen bg-ink text-paper">

        {/* ── HERO ──────────────────────────────────────────────── */}
        <div className="relative w-full overflow-hidden" style={{ height: '72vh', minHeight: 500 }}>

          <Image
            src={essay.coverImage}
            alt={essay.alt}
            fill
            priority
            className="object-cover grayscale"
            style={{ opacity: 0.45 }}
            sizes="100vw"
          />

          {/* gradient: transparent top → near-black bottom */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.97) 100%)',
            }}
          />

          {/* Ghost decorative glyph */}
          <div
            aria-hidden
            className="absolute pointer-events-none select-none font-serif italic"
            style={{
              top: -60,
              right: -30,
              fontSize: 360,
              lineHeight: 1,
              letterSpacing: '-0.06em',
              color: '#f5f3ee',
              mixBlendMode: 'difference',
            }}
          >
            №
          </div>

          {/* Top-left: logo / back link */}
          <Link
            href="/"
            className="absolute flex flex-col"
            style={{ top: 26, left: 30, zIndex: 5, gap: 2, textDecoration: 'none' }}
          >
            <span
              className="font-serif italic"
              style={{ fontSize: 22, letterSpacing: '-0.01em', color: '#f5f3ee' }}
            >
              Take a Look
            </span>
            <span
              className="font-sans font-medium uppercase"
              style={{ fontSize: 9, letterSpacing: '0.18em', color: 'rgba(245,243,238,0.55)' }}
            >
              ESSAYS ON OBSESSIONS
            </span>
          </Link>

          {/* Top-right: back */}
          <Link
            href="/"
            className="absolute font-serif italic"
            style={{
              top: 32,
              right: 30,
              zIndex: 5,
              fontSize: 14,
              color: 'rgba(245,243,238,0.45)',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            ← 목록으로
          </Link>

          {/* Bottom-left: category · read time · title · date */}
          <div
            className="absolute flex flex-col"
            style={{ left: 30, right: 100, bottom: 36, gap: 14, zIndex: 5 }}
          >
            <div
              className="flex items-center font-sans font-medium uppercase"
              style={{ gap: 10, fontSize: 9, letterSpacing: '0.22em', color: '#f5f3ee', opacity: 0.85 }}
            >
              <span>{category}</span>
              <span
                style={{
                  width: 18,
                  height: 1,
                  background: 'currentColor',
                  opacity: 0.5,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span
                className="font-serif italic"
                style={{ fontSize: 12, letterSpacing: 0, textTransform: 'none' }}
              >
                {essay.readingTime}
              </span>
            </div>

            <h1
              className="font-sans font-medium"
              style={{
                fontSize: 'clamp(26px, 3.6vw, 46px)',
                lineHeight: 1.14,
                letterSpacing: '-0.03em',
                color: '#f5f3ee',
                maxWidth: 760,
              }}
            >
              {essay.title}
            </h1>

            <div
              className="font-serif italic"
              style={{ fontSize: 13, color: 'rgba(245,243,238,0.45)', letterSpacing: '-0.005em' }}
            >
              {dateStr}
            </div>
          </div>

          {/* Bottom-right: index label */}
          <div
            className="absolute font-sans font-medium uppercase"
            style={{
              bottom: 38,
              right: 30,
              zIndex: 5,
              fontSize: 9,
              letterSpacing: '0.22em',
              color: 'rgba(245,243,238,0.3)',
            }}
          >
            AN INDEX OF OBSESSIONS
          </div>
        </div>

        {/* ── ARTICLE ───────────────────────────────────────────── */}
        <div className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>

          {/* Tags */}
          {essay.tags.length > 0 && (
            <div className="flex flex-wrap mb-10" style={{ gap: 6 }}>
              {essay.tags.map(tag => (
                <span
                  key={tag}
                  className="font-sans font-medium"
                  style={{
                    fontSize: 10,
                    padding: '3px 10px',
                    border: '0.5px solid rgba(245,243,238,0.3)',
                    color: 'rgba(245,243,238,0.7)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Excerpt / lead pullquote */}
          {essay.excerpt && (
            <p
              className="font-serif italic"
              style={{
                fontSize: 20,
                lineHeight: 1.6,
                color: 'rgba(245,243,238,0.6)',
                letterSpacing: '-0.005em',
                marginBottom: 52,
                paddingLeft: 20,
                borderLeft: '1px solid rgba(245,243,238,0.15)',
              }}
            >
              {essay.excerpt}
            </p>
          )}

          {/* Body content */}
          <EditorViewer
            content={essay.content}
            className="prose prose-invert prose-essay max-w-none"
          />
        </div>

        {/* ── DIVIDER ───────────────────────────────────────────── */}
        <div style={{ height: 1, background: 'rgba(245,243,238,0.07)', margin: '0 30px' }} />

        {/* ── RELATED ESSAYS ────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="py-14 px-6">
            <div className="flex items-baseline mb-8" style={{ gap: 14 }}>
              <span
                className="font-serif italic"
                style={{ fontSize: 22, color: '#f5f3ee', letterSpacing: '-0.01em' }}
              >
                더 읽기
              </span>
              <span
                className="font-sans font-medium uppercase"
                style={{ fontSize: 9, letterSpacing: '0.22em', color: 'rgba(245,243,238,0.35)' }}
              >
                RELATED ESSAYS
              </span>
            </div>

            {/* SlimCard strip — same design language as main page Lane 2 */}
            <div className="flex overflow-x-auto scrollbar-hide" style={{ gap: 10, paddingBottom: 4 }}>
              {related.map((rel, i) => (
                <Link
                  key={rel.slug}
                  href={`/${rel.slug}`}
                  className="flex-none"
                  style={{
                    width: 280,
                    background: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'stretch',
                    overflow: 'hidden',
                    textDecoration: 'none',
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-none" style={{ width: 100, background: '#0a0a0a' }}>
                    <Image
                      src={rel.coverImage}
                      alt={rel.alt}
                      fill
                      className="object-cover"
                      style={{ filter: 'grayscale(1) contrast(1.1)', opacity: 0.85 }}
                      sizes="100px"
                    />
                  </div>

                  {/* Text */}
                  <div
                    className="flex flex-col justify-between min-w-0"
                    style={{ flex: 1, padding: '14px 16px' }}
                  >
                    <div
                      className="flex justify-between items-baseline font-serif italic"
                      style={{ fontSize: 12, color: 'rgba(245,243,238,0.5)' }}
                    >
                      <span>№ {String(i + 1).padStart(2, '0')}</span>
                      <span>{rel.date.slice(0, 10).replace(/-/g, '.')}</span>
                    </div>
                    <h3
                      className="font-sans font-medium"
                      style={{
                        fontSize: 14,
                        lineHeight: 1.3,
                        letterSpacing: '-0.015em',
                        color: '#f5f3ee',
                        marginTop: 8,
                        flex: 1,
                      }}
                    >
                      {rel.title}
                    </h3>
                    <div
                      className="font-sans font-medium uppercase"
                      style={{
                        fontSize: 9,
                        letterSpacing: '0.18em',
                        color: 'rgba(245,243,238,0.4)',
                        marginTop: 10,
                      }}
                    >
                      {rel.tags[0] ?? 'ESSAY'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── COMMENTS ──────────────────────────────────────────── */}
        <div
          className="mx-auto px-6 pb-20"
          style={{
            maxWidth: 720,
            borderTop: '1px solid rgba(245,243,238,0.07)',
            paddingTop: 48,
            marginTop: related.length > 0 ? 0 : 0,
          }}
        >
          <CommentSection essayId={essay.id} />
        </div>

        {/* ── VOICE CHAT ────────────────────────────────────────── */}
        <VoiceChat slug={essay.slug} />

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <div
          className="flex justify-between items-center"
          style={{
            padding: '22px 30px',
            borderTop: '1px solid rgba(245,243,238,0.07)',
          }}
        >
          <span
            className="font-sans font-medium uppercase"
            style={{ fontSize: 9, letterSpacing: '0.22em', color: 'rgba(245,243,238,0.28)' }}
          >
            AN INDEX OF OBSESSIONS
          </span>
          <Link
            href="/"
            className="font-serif italic"
            style={{
              fontSize: 14,
              letterSpacing: '-0.01em',
              color: 'rgba(245,243,238,0.45)',
              textDecoration: 'none',
            }}
          >
            ← Take a Look
          </Link>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const slug = params?.slug as string
  const essay = await getEssayBySlug(slug)

  if (!essay || !essay.published) return { notFound: true }

  const related = await getRelatedEssays(slug)

  return { props: { essay, related } }
}
