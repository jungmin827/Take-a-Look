import type { AppProps } from 'next/app'
import { Noto_Sans_KR } from 'next/font/google'
import '@/styles/globals.css'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={notoSansKR.className}>
      <Component {...pageProps} />
    </div>
  )
}
