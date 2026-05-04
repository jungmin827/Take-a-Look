import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { Noto_Sans_KR, Instrument_Serif } from 'next/font/google'
import '@/styles/globals.css'
import Navbar from '@/components/Navbar'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isHome = router.pathname === '/'

  return (
    <div className={`${notoSansKR.className} ${instrumentSerif.variable}`}>
      {!isHome && <Navbar />}
      <Component {...pageProps} />
    </div>
  )
}
