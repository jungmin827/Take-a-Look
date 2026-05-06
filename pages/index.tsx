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
        <meta name="description" content="넓고 얕은 지식을 탐구하는 공간" />
        <meta property="og:title" content="Take a Look" />
        <meta property="og:description" content="넓고 얕은 지식을 탐구하는 공간" />
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
