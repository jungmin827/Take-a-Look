import { GetStaticProps } from 'next'
import Head from 'next/head'
import { Essay } from '@/types'
import { getAllEssays } from '@/lib/essays'
import Card from '@/components/Card'

interface Props {
  essays: Essay[]
}

export default function Home({ essays }: Props) {
  return (
    <>
      <Head>
        <title>비주류</title>
        <meta name="description" content="취향 에세이 플랫폼 — 내가 왜 이걸 파게 됐는지를 씁니다" />
        <meta property="og:title" content="비주류" />
        <meta property="og:description" content="취향 에세이 플랫폼 — 내가 왜 이걸 파게 됐는지를 씁니다" />
        <meta property="og:locale" content="ko_KR" />
      </Head>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">비주류</h1>
          <p className="mt-2 text-gray-500 text-sm">
            내가 왜 이걸 파게 됐는지를 씁니다
          </p>
        </header>

        {essays.length === 0 ? (
          <p className="text-gray-400 text-center py-24">
            첫 에세이를 기다리는 중입니다.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {essays.map(essay => (
              <Card key={essay.slug} essay={essay} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const essays = await getAllEssays()
  return { props: { essays } }
}
