import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { Essay } from '@/types'
import { getAllSlugs } from '@/lib/essays'
import TagChip from '@/components/TagChip'

interface Props {
  essay: Essay
  mdxSource: MDXRemoteSerializeResult
}

export default function EssayPage({ essay, mdxSource }: Props) {
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
            {essay.tags.map(tag => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">{essay.title}</h1>
          <p className="text-gray-400 text-sm">
            {essay.date} · {essay.readingTime}
          </p>
        </header>

        <article className="prose prose-gray max-w-none">
          <MDXRemote {...mdxSource} />
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllSlugs()
  return {
    paths: slugs.map(slug => ({ params: { slug } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string
  const filePath = path.join(process.cwd(), 'content', `${slug}.mdx`)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)
  const mdxSource = await serialize(content)

  return {
    props: {
      essay: data as Essay,
      mdxSource,
    },
  }
}
