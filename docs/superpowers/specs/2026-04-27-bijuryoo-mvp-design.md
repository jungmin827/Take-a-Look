# 비주류 — 취향 에세이 플랫폼 Phase A MVP 스펙

Generated: 2026-04-27
Status: APPROVED (office-hours + plan-eng-review CLEARED)

---

## 문제 정의

"비주류" 키워드를 중심으로 사람들이 각자 파고 있는 취향/주제를 칼럼 형식으로 쓰고, 공유하고, 의견을 나누는 플랫폼. 머니그라피 '비주류 초대석'이 선풍적 인기를 끌면서 이 감성에 공감하는 2030대가 생겼지만, 그들이 모일 공간이 없다.

**포지셔닝:** 기존 니치 소셜(Letterboxd, Goodreads, Strava)은 전부 소비 트래킹 중심. 이 플랫폼은 "내가 왜 이걸 파게 됐는지"를 쓰는 취향 에세이 플랫폼. 소비 기록이 아닌 발견과 전파가 핵심.

---

## 범위 (Phase A MVP)

### In scope

- Letterboxd-style 카드 피드 (3열 반응형 그리드)
- 카드 클릭 → 칼럼 전문 페이지
- 태그 칩 (카테고리 대신)
- 모바일 퍼스트 읽기 경험
- OG 이미지 메타태그 (카카오톡 공유 썸네일)
- SEO 기본 세팅
- Vercel 배포 (공개 URL)

### NOT in scope (Phase B로 연기)

| 항목 | 이유 |
|------|------|
| 댓글/좋아요/리액션 | 콘텐츠 없이 소셜 기능 먼저 만들면 빈 엔지니어링 |
| 사용자 업로드/에디터 | Phase B (Supabase Storage + 관리자 에디터) |
| App Router 마이그레이션 | Phase B 전환 시 비용 감수 |
| Supabase DB | Phase A는 MDX 파일만 |
| 이메일 캡처 | Phase B |
| Obsession Trails | 콘텐츠 10개 이상 쌓인 후 |
| 다크모드 | Phase B |
| @vercel/og 자동 생성 | MVP는 정적 OG 이미지 수동 제작 |
| next-sitemap | Phase A는 에세이 수가 적어 불필요 |
| 테스트 자동화 | 솔로 MVP는 수동 체크리스트로 대체 |

---

## 기술 스택 (확정)

| 레이어 | 선택 | 근거 |
|--------|------|------|
| 프레임워크 | Next.js (Pages Router) | App Router는 Phase B |
| 스타일 | Tailwind CSS | 빠른 반응형 |
| MDX | next-mdx-remote + gray-matter | Pages Router + getStaticProps 최적 호환 |
| 이미지 | next/image (fill + aspect-[2/3]) | LCP 최적화, WebP 자동 변환 |
| 웹폰트 | next/font (Noto Sans KR) | FOUT 방지 |
| 배포 | Vercel 무료 티어 | push-to-deploy, 100GB/월 |
| 언어 | TypeScript strict | |

---

## 프로젝트 구조

```
types/
  index.ts              ← Essay 인터페이스 (alt 포함)
content/
  [slug].mdx            ← frontmatter 스키마 준수
pages/
  index.tsx             ← getStaticProps + 3열 카드 그리드
  [slug].tsx            ← getStaticProps + getStaticPaths(fallback:false)
components/
  Card.tsx              ← next/image (fill+aspect-[2/3]) + 호버 오버레이
  TagChip.tsx
public/
  images/               ← 커버 이미지 (수동 저장)
  og/                   ← 정적 OG 썸네일 (수동 제작)
lib/
  essays.ts             ← getAllEssays(), getEssayBySlug() + 빌드 타임 방어
next.config.js
tailwind.config.js
tsconfig.json
```

---

## 데이터 모델

### Essay 인터페이스 (`types/index.ts`)

```ts
export interface Essay {
  title: string
  slug: string          // 반드시 영문 로마자 — 공유 URL이 됨
  date: string          // "YYYY-MM-DD"
  tags: string[]
  excerpt: string
  coverImage: string    // "/images/[filename]"
  alt: string           // 접근성 필수
  readingTime: string   // "8분"
}
```

### MDX Frontmatter 스키마

```mdx
---
title: "왜 나는 카세트테이프를 파게 됐는가"
slug: "cassette-tape-obsession"
date: "2026-04-27"
tags: ["카세트테이프", "아날로그", "음악"]
excerpt: "스포티파이로 충분히 들을 수 있는데, 왜 굳이 테이프를 찾게 됐는지에 대하여"
coverImage: "/images/cassette-cover.jpg"
alt: "낡은 카세트 덱 클로즈업"
readingTime: "8분"
---
```

**슬러그 규칙:** 항상 영문 로마자. 한글 슬러그는 URL 인코딩으로 공유 링크가 망가짐.

---

## 핵심 구현 패턴

### lib/essays.ts — 빌드 타임 방어

```ts
// slug 또는 coverImage 누락 시 빌드 타임에 throw
if (!frontmatter.slug) throw new Error(`Missing slug in ${filename}`)
if (!frontmatter.coverImage) throw new Error(`Missing coverImage in ${filename}`)
```

런타임 장애 대신 빌드 실패로 잡아냄.

### pages/[slug].tsx — 라우팅

```ts
export async function getStaticPaths() {
  const slugs = getAllSlugs()
  return {
    paths: slugs.map(s => ({ params: { slug: s } })),
    fallback: false  // 목록 외 슬러그 → 자동 404
  }
}
```

### components/Card.tsx — 이미지

```tsx
<div className="relative aspect-[2/3]">
  <Image
    src={essay.coverImage}
    alt={essay.alt}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 33vw"
  />
</div>
```

---

## SEO 체크리스트

- `<html lang="ko">`
- Open Graph locale `ko_KR`
- Article 구조화 데이터 (JSON-LD)
- OG 이미지: `public/og/[slug].png` 정적 파일

---

## 장애 모드

| 코드패스 | 실패 시나리오 | 에러 핸들링 |
|---------|------------|------------|
| content/*.mdx 읽기 | 폴더 비어있음 | 빈 배열 반환 → 빈 피드 표시 |
| frontmatter 파싱 | slug 필드 누락 | 빌드 타임 throw (방어 코드) |
| 없는 slug 요청 | /essay/nonexistent | fallback:false → 자동 404 |
| coverImage 경로 | public/images/ 파일 없음 | 빌드 타임 throw (방어 코드) |
| OG 이미지 없음 | public/og/[slug].png 없음 | 카카오톡 공유 시 썸네일 없음 — 허용 |

---

## 배포 전 수동 체크리스트

1. `next build` 성공 (빌드 타임 방어 코드 통과)
2. 모바일 뷰포트에서 카드 피드 확인
3. 에세이 페이지 클릭 → 본문 렌더링 확인
4. 카카오톡 공유 시 OG 썸네일 노출 확인
5. 없는 슬러그 접근 시 404 확인
6. Vercel Analytics 대시보드 접근 확인

---

## 성공 기준

- 이번 주 안에 공유할 수 있는 URL 1개 존재
- 3명이 링크를 받아보고 그 중 1명이 자발적으로 다른 사람에게 공유
- "이런 플랫폼 만들어요?"라는 질문이 들어오면 성공

---

## Phase B (반응 확인 후)

- Supabase DB + 관리자 에디터
- App Router 마이그레이션
- @vercel/og 자동 OG 이미지
- 이메일 캡처
- 다크모드
- "나도 파고 있다" 버튼 재검토
- Obsession Trails (콘텐츠 10개 이상)
