# 비주류 Phase A MVP 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js + MDX 기반 취향 에세이 카드 피드를 이번 주 안에 공개 URL로 배포한다.

**Architecture:** MDX 파일을 `content/`에 직접 작성하고, `lib/essays.ts`가 빌드 타임에 파싱한다. `pages/index.tsx`는 카드 피드, `pages/[slug].tsx`는 에세이 본문을 SSG로 제공한다. 소셜/DB/관리자 기능 없음.

**Tech Stack:** Next.js 14 (Pages Router), TypeScript strict, Tailwind CSS, next-mdx-remote, gray-matter, @tailwindcss/typography, Vercel

---

## 파일 맵

| 파일 | 역할 |
|------|------|
| `types/index.ts` | Essay 인터페이스 단일 진실 공급원 |
| `lib/essays.ts` | MDX 파싱 유틸 + 빌드 타임 방어 |
| `components/TagChip.tsx` | 태그 칩 UI (재사용) |
| `components/Card.tsx` | 에세이 카드 (next/image + 호버) |
| `pages/_document.tsx` | `<html lang="ko">` SEO 설정 |
| `pages/_app.tsx` | Noto Sans KR 전역 폰트 |
| `pages/index.tsx` | 3열 카드 피드 (getStaticProps) |
| `pages/[slug].tsx` | 에세이 본문 (getStaticPaths + getStaticProps) |
| `content/[slug].mdx` | 에세이 콘텐츠 (창업자 직접 작성) |
| `public/images/` | 커버 이미지 |
| `public/og/` | 정적 OG 썸네일 |
| `next.config.js` | Next.js 설정 |
| `tailwind.config.js` | Tailwind + typography 플러그인 |
| `styles/globals.css` | Tailwind 디렉티브 |

---

## Task 1: Next.js 프로젝트 초기화

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.js`, `tsconfig.json`, `postcss.config.js`, `styles/globals.css`

- [ ] **Step 1: create-next-app 실행**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --no-app --no-src-dir --import-alias "@/*"
```

프롬프트가 뜨면:
- Would you like to use App Router? → **No** (Pages Router 사용)
- Would you like to customize the default import alias? → **Yes**, `@/*`

- [ ] **Step 2: 생성된 보일러플레이트 정리**

`pages/index.tsx` 전체 내용을 임시로 비운다 (Task 6에서 작성):

```tsx
export default function Home() {
  return <div>비주류</div>
}
```

`pages/api/` 폴더 삭제:

```bash
rm -rf pages/api
```

`public/` 안의 next.svg, vercel.svg 삭제:

```bash
rm -f public/next.svg public/vercel.svg
```

`styles/globals.css`를 Tailwind 디렉티브만 남기도록 교체:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: MDX + typography 의존성 설치**

```bash
npm install next-mdx-remote gray-matter @tailwindcss/typography
```

- [ ] **Step 4: tailwind.config.js 업데이트**

`tailwind.config.js`를 다음으로 교체:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

- [ ] **Step 5: next.config.js 교체**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

- [ ] **Step 6: 빌드 통과 확인**

```bash
npm run dev
```

Expected: `http://localhost:3000`에서 "비주류" 텍스트 노출. 에러 없음.

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "chore: initialize Next.js project with TypeScript, Tailwind, MDX deps"
```

---

## Task 2: Essay 타입 정의

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: types/index.ts 생성**

```bash
mkdir -p types
```

```ts
// types/index.ts
export interface Essay {
  title: string
  slug: string
  date: string
  tags: string[]
  excerpt: string
  coverImage: string
  alt: string
  readingTime: string
}
```

- [ ] **Step 2: 타입 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add types/index.ts
git commit -m "feat: add Essay TypeScript interface"
```

---

## Task 3: Essay 유틸 라이브러리

**Files:**
- Create: `lib/essays.ts`

- [ ] **Step 1: lib/ 디렉토리 생성**

```bash
mkdir -p lib content
```

- [ ] **Step 2: lib/essays.ts 작성**

```ts
// lib/essays.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Essay } from '@/types'

const contentDir = path.join(process.cwd(), 'content')

export function getAllEssays(): Essay[] {
  if (!fs.existsSync(contentDir)) return []

  const filenames = fs.readdirSync(contentDir).filter(f => f.endsWith('.mdx'))

  const essays = filenames.map(filename => {
    const filePath = path.join(contentDir, filename)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(fileContent)

    if (!data.slug) throw new Error(`Missing slug in ${filename}`)
    if (!data.coverImage) throw new Error(`Missing coverImage in ${filename}`)

    return data as Essay
  })

  return essays.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getAllSlugs(): string[] {
  return getAllEssays().map(e => e.slug)
}

export function getEssayBySlug(slug: string): Essay | undefined {
  return getAllEssays().find(e => e.slug === slug)
}
```

- [ ] **Step 3: 타입 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add lib/essays.ts
git commit -m "feat: add essay MDX parsing library with build-time validation"
```

---

## Task 4: TagChip 컴포넌트

**Files:**
- Create: `components/TagChip.tsx`

- [ ] **Step 1: components/ 디렉토리 생성**

```bash
mkdir -p components
```

- [ ] **Step 2: components/TagChip.tsx 작성**

```tsx
// components/TagChip.tsx
interface Props {
  tag: string
  variant?: 'default' | 'light'
}

export default function TagChip({ tag, variant = 'default' }: Props) {
  const base = 'text-xs px-2 py-0.5 rounded-full'
  const styles =
    variant === 'light'
      ? `${base} bg-white/20 text-white`
      : `${base} bg-gray-100 text-gray-600`

  return <span className={styles}>{tag}</span>
}
```

- [ ] **Step 3: 타입 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add components/TagChip.tsx
git commit -m "feat: add TagChip component"
```

---

## Task 5: Card 컴포넌트

**Files:**
- Create: `components/Card.tsx`

- [ ] **Step 1: components/Card.tsx 작성**

```tsx
// components/Card.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Essay } from '@/types'
import TagChip from './TagChip'

interface Props {
  essay: Essay
}

export default function Card({ essay }: Props) {
  return (
    <Link href={`/${essay.slug}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={essay.coverImage}
          alt={essay.alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h2 className="text-white font-bold text-lg mb-2 leading-snug">
            {essay.title}
          </h2>
          <div className="flex flex-wrap gap-1">
            {essay.tags.map(tag => (
              <TagChip key={tag} tag={tag} variant="light" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 px-0.5">
        <p className="text-xs text-gray-400">
          {essay.date} · {essay.readingTime}
        </p>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{essay.excerpt}</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: 타입 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add components/Card.tsx
git commit -m "feat: add Card component with hover overlay and next/image"
```

---

## Task 6: _document.tsx — SEO 기본

**Files:**
- Create: `pages/_document.tsx`

- [ ] **Step 1: pages/_document.tsx 작성**

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ko">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add pages/_document.tsx
git commit -m "feat: set html lang=ko for SEO"
```

---

## Task 7: _app.tsx — Noto Sans KR 폰트

**Files:**
- Modify: `pages/_app.tsx`

- [ ] **Step 1: pages/_app.tsx 교체**

```tsx
// pages/_app.tsx
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
```

- [ ] **Step 2: 개발 서버에서 폰트 확인**

```bash
npm run dev
```

브라우저 → `http://localhost:3000` → DevTools Network 탭 → Noto Sans KR 폰트 로드 확인.

- [ ] **Step 3: 커밋**

```bash
git add pages/_app.tsx
git commit -m "feat: add Noto Sans KR via next/font"
```

---

## Task 8: 홈 페이지 — 카드 피드

**Files:**
- Modify: `pages/index.tsx`

- [ ] **Step 1: pages/index.tsx 작성**

```tsx
// pages/index.tsx
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
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
  const essays = getAllEssays()
  return { props: { essays } }
}
```

- [ ] **Step 2: 개발 서버에서 확인**

```bash
npm run dev
```

`http://localhost:3000` → "첫 에세이를 기다리는 중입니다." 텍스트 노출. 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add pages/index.tsx
git commit -m "feat: add home page with 3-column card grid"
```

---

## Task 9: 에세이 본문 페이지

**Files:**
- Create: `pages/[slug].tsx`

- [ ] **Step 1: pages/[slug].tsx 작성**

```tsx
// pages/[slug].tsx
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
  const slugs = getAllSlugs()
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
```

- [ ] **Step 2: 타입 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add pages/\[slug\].tsx
git commit -m "feat: add essay page with MDX rendering, OG meta, JSON-LD"
```

---

## Task 10: 첫 MDX 에세이 작성

**Files:**
- Create: `content/[slug].mdx`
- Create: `public/images/[cover].jpg`
- Create: `public/og/[slug].png`

> **이 태스크는 창업자 본인이 직접 수행합니다.** AI가 대신 쓰면 "비주류 에세이"가 아닙니다.

- [ ] **Step 1: public/ 디렉토리 준비**

```bash
mkdir -p public/images public/og
```

- [ ] **Step 2: 커버 이미지 준비**

파고 있는 주제를 대표하는 사진을 `public/images/` 에 저장.  
파일명 예: `cassette-cover.jpg` (영문 소문자 + 하이픈만 사용)

- [ ] **Step 3: OG 썸네일 준비**

`public/og/[slug].png` — 1200×630px 이미지.  
Figma, Canva, 또는 직접 캡처. 카카오톡 공유 시 이 이미지가 썸네일로 노출됨.

- [ ] **Step 4: MDX 파일 작성**

`content/[slug].mdx` 를 아래 frontmatter 스키마로 시작:

```mdx
---
title: "왜 나는 [주제]를 파게 됐는가"
slug: "[영문-로마자-슬러그]"
date: "2026-04-27"
tags: ["태그1", "태그2"]
excerpt: "한 줄 요약 — 카드 하단과 OG description에 노출됨"
coverImage: "/images/[cover파일명].jpg"
alt: "커버 이미지 설명 (접근성)"
readingTime: "X분"
---

여기서부터 본문을 씁니다.

"왜 이걸 파게 됐는지"가 반드시 들어가야 합니다.
```

**슬러그 규칙:** `cassette-tape-obsession` 형식. 한글 슬러그 금지.

- [ ] **Step 5: 개발 서버에서 에세이 확인**

```bash
npm run dev
```

- `http://localhost:3000` → 카드 1장 노출 확인
- 카드 클릭 → 에세이 본문 페이지 확인
- 모바일 뷰포트 (375px)에서 레이아웃 확인

- [ ] **Step 6: 커밋**

```bash
git add content/ public/images/ public/og/
git commit -m "content: add first essay — [제목 요약]"
```

---

## Task 11: 빌드 검증

- [ ] **Step 1: 프로덕션 빌드**

```bash
npm run build
```

Expected: `✓ Compiled successfully` + `○ (Static)` 페이지 목록 노출. 에러 없음.

- [ ] **Step 2: 빌드 결과 로컬 실행**

```bash
npm run start
```

`http://localhost:3000` 에서 프로덕션 빌드 동작 확인.

- [ ] **Step 3: 없는 슬러그 404 확인**

`http://localhost:3000/nonexistent-slug` → 404 페이지 노출 확인 (`fallback: false` 동작).

- [ ] **Step 4: OG 메타 확인**

브라우저 DevTools → Elements → `<head>` 내 `og:image`, `og:title`, `og:locale` 존재 확인.

---

## Task 12: Vercel 배포

- [ ] **Step 1: GitHub에 push**

```bash
git push origin main
```

- [ ] **Step 2: Vercel 프로젝트 연결**

[vercel.com/new](https://vercel.com/new) → GitHub 레포 선택 → **Import**

설정:
- Framework Preset: **Next.js** (자동 감지됨)
- Root Directory: `.` (변경 없음)
- Build Command: `npm run build` (기본값)
- Output Directory: `.next` (기본값)

→ **Deploy** 클릭

- [ ] **Step 3: 배포 URL 확인**

Vercel 대시보드 → 배포된 URL (`https://[project-name].vercel.app`) 복사.

- [ ] **Step 4: 카카오톡 공유 테스트**

카카오톡에서 배포 URL을 직접 입력하거나 공유 → 썸네일, 제목, 설명 노출 확인.

> OG 이미지가 캐시될 수 있음. 처음에 안 보이면 [카카오 공유 디버거](https://developers.kakao.com/tool/clear/og)에서 캐시 초기화.

- [ ] **Step 5: Vercel Analytics 활성화**

Vercel 대시보드 → 프로젝트 → **Analytics** 탭 → **Enable** (무료 티어).

- [ ] **Step 6: 배포 완료 커밋 없음**

배포 자체는 Vercel 대시보드에서 완료됨. GitHub push-to-deploy 자동 연결 확인으로 마무리.

---

## 배포 후 수동 체크리스트

- [ ] `npm run build` 성공
- [ ] 모바일 375px 뷰포트에서 카드 피드 정상
- [ ] 카드 클릭 → 에세이 본문 정상
- [ ] 카카오톡 공유 시 OG 썸네일 노출
- [ ] 없는 슬러그 → 404 페이지
- [ ] Vercel Analytics 대시보드 접근 가능

---

## 다음 단계 (Phase B 트리거)

에세이 3개 공유 후 1명이 자발적으로 재공유하면 Phase B 시작:

1. Supabase DB + 관리자 에디터
2. App Router 마이그레이션
3. @vercel/og 자동 OG 이미지
4. 이메일 캡처
