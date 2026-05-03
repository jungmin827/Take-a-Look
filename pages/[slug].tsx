import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Essay } from '@/types'
import { getEssayBySlug, getRelatedEssays } from '@/lib/essays'
import TagChip from '@/components/TagChip'
import HorizontalScroll from '@/components/HorizontalScroll'
import CommentSection from '@/components/CommentSection'

const EditorViewer = dynamic(() => import('@/components/EditorViewer'), { ssr: false })

interface Props {
  essay: Essay
  related: Essay[]
}

export default function EssayPage({ essay, related }: Props) {
  return (
    <>
      <Head>
        <title>{essay.title} — 비주류</title>
        <meta name="description" content={essay.excerpt} />
        <meta property="og:title" content={`${essay.title} — 비주류`} />
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

      <main className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 block">
          ← 비주류
        </Link>

        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {essay.tags.map(tag => <TagChip key={tag} tag={tag} />)}
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">{essay.title}</h1>
          <p className="text-gray-400 text-sm">
            {essay.date.slice(0, 10)} · {essay.readingTime}
          </p>
        </header>

        <article>
          <EditorViewer content={essay.content} />
        </article>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-lg font-bold mb-4">관련 글</h2>
            <HorizontalScroll essays={related} variant="strip" />
          </section>
        )}

        <CommentSection essayId={essay.id} />
      </main>
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
