import { GetStaticProps } from 'next'
import Head from 'next/head'
import { Essay } from '@/types'
import { getAllEssays } from '@/lib/essays'
import MainHeroMarquee from '@/components/MainHeroMarquee'

interface Props {
  essays: Essay[]
}

export default function Home({ essays }: Props) {
  return (
    <>
      <Head>
        <title>Take a Look</title>
        <meta name="description" content="취향 에세이 플랫폼 — 내가 왜 이걸 파게 됐는지를 씁니다" />
        <meta property="og:title" content="Take a Look" />
        <meta property="og:description" content="취향 에세이 플랫폼 — 내가 왜 이걸 파게 됐는지를 씁니다" />
        <meta property="og:locale" content="ko_KR" />
      </Head>
      <main style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <MainHeroMarquee essays={essays} />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const all = await getAllEssays()
  const essays = all.slice(0, 8)
  return { props: { essays }, revalidate: 60 }
}
