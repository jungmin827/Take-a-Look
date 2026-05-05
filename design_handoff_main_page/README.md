# Handoff: Take a Look — 메인 페이지 (Index Wall · 안 B)

## Overview

Take a Look(취향 에세이 플랫폼)의 새 메인 페이지 디자인입니다. 슬로건은 **"내가 왜 이걸 파게 됐는지를 씁니다"**. 기존의 단순한 헤더 + 단일 마퀴 구조를 **풀스크린 두 줄 무한 마퀴**로 교체합니다. 카드 자체가 화면을 가득 채우는 풀블리드 미디어가 되고, 좌상단 로고와 우하단 인덱스(01/08)·화살표만 떠있는 미니멀한 잡지 톤 레이아웃입니다.

이 핸드오프는 **B안 (Index Wall)** — 다크 모노톤 + 거대한 인덱스 숫자 + 비대칭 두 레인 — 의 구현 사양입니다.

## About the Design Files

`reference/` 폴더의 HTML / JSX 파일들은 **디자인 레퍼런스**입니다. 즉 의도한 룩과 동작을 보여주는 프로토타입이지 그대로 복붙할 production 코드가 아닙니다.

목표는 이 디자인을 **기존 Take a Look Next.js 14 (Pages Router) + TypeScript 5 + Tailwind CSS 3 코드베이스에 이식**하는 것입니다. 기존의 `Navbar`, `Card`, `TagChip`, `AutoMarquee` 컴포넌트 구조와 패턴(`getStaticProps + revalidate: 60`)을 따라 새 컴포넌트로 재작성하세요.

`reference/index.html`을 브라우저에서 열어서 실제 동작을 확인할 수 있습니다 (3개 변형이 design canvas에 나열되며, 우상단 ↗ 버튼으로 풀스크린 포커스 모드 진입). 이번 핸드오프 대상은 **두 번째 변형 (B · Index Wall)** 입니다.

## Fidelity

**High-fidelity.** 색상, 타이포그래피, 간격, 인터랙션이 모두 확정된 픽셀 단위 목업입니다. 정확한 hex 값과 레이아웃 비율을 그대로 재현해주세요. Tailwind 토큰으로 매핑할 때만 가장 가까운 값으로 치환해도 됩니다 (예: `#0a0a0a` → `bg-neutral-950`).

---

## Screens / Views

### `/` — 메인 페이지

#### Purpose
방문자에게 "Take a Look이 어떤 매체인지" 즉시 시각적으로 전달. 큐레이션된 에세이 풀을 한눈에 보여주고, 카드 호버 → 클릭으로 상세 페이지(`/[slug]`)로 진입.

#### Layout (1920×1080 기준)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]                              내가 왜 이걸          │  ← 100px top padding
│  Take a Look                         파게 됐는지를 씁니다.  │
│  ESSAYS ON OBSESSIONS                                       │
│                                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌──────────────┐     │
│  │  ↑ 62% height (BigCard lane, flows LEFT)         │ ... │  ← Lane 1
│  │  480px wide cards, 12px gap                       │     │
│  │  → 거대한 ID 숫자(№01) + 큰 제목                   │     │
│  └───────────────┘ └───────────────┘ └──────────────┘     │
│                                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ...                      │  ← Lane 2
│  │ 280px slim cards, flows RIGHT, reversed list       │     │  flex 1 (~38%)
│  │ → 좌측 100px 썸네일 + 우측 메타·제목                │     │
│  └────────┘ └────────┘ └────────┘                          │
│                                                             │
│  AN INDEX OF OBSESSIONS              01 / 08  ← →           │  ← 80px bottom padding
└─────────────────────────────────────────────────────────────┘
배경 좌하단에 거대한 ghost 타이포 "Take a Look." (rgba(245,243,238,0.04))
```

루트 컨테이너:
- `position: relative`, full viewport (`100vw × 100vh`), `overflow: hidden`
- `background: #0a0a0a`
- `color: #f5f3ee` (기본 텍스트)
- `font-family: "Noto Sans KR", system-ui, sans-serif`

**기존 `<Navbar />`는 메인 페이지에서는 숨기거나 투명 처리**해야 합니다. 좌상단 로고가 그 역할을 대체합니다. (다른 페이지에서는 그대로 표시)

#### Components

##### 1. `<MainHeroMarquee />` (새 컴포넌트, 이 페이지의 메인)

루트 wrapper. 자식: 두 개의 `<MarqueeLane />` + `<HeroChrome />` (로고/태그라인/HUD/배경 ghost type).

```
flex-col, gap: 14px
padding: 100px 0 80px 0  (top/bottom only — 카드는 좌우 전체로 흐름)
```

##### 2. `<MarqueeLane direction="left|right" speed={s} reverseList />` 

기존 `AutoMarquee`를 확장. 단일 레인으로 분리해서 두 번 사용.
- 내부 div: `display: flex; width: max-content; will-change: transform;`
- 자식 리스트를 **두 번 반복** (seamless loop을 위해)
- 애니메이션:
  - left: `@keyframes marq-left { from { transform: translate3d(0,0,0) } to { transform: translate3d(-50%,0,0) } }`
  - right: `@keyframes marq-right { from { transform: translate3d(-50%,0,0) } to { transform: translate3d(0,0,0) } }`
- `animation: <name> <speed>s linear infinite`
- 부모에 호버 발생 시 `animation-play-state: paused`
- `reverseList`가 true면 essays 배열을 reverse해서 시각적 다양성 확보

**Lane 1 (BigCard):**
- 높이: `flex: 0 0 62%` of parent height
- direction: left
- speed: 60s (Tweaks로 조정 가능)
- card width: 480px, gap (margin-right): 12px

**Lane 2 (SlimCard):**
- 높이: `flex: 1` (나머지 ~38%)
- direction: right
- speed: 60s × 0.7 = 42s (slim card가 더 빠르게 흐름)
- card width: 280px, gap (margin-right): 10px
- `reverseList`

##### 3. `<BigCard essay={...} />`

```
width: 480px
height: 100%
margin-right: 12px
position: relative
overflow: hidden
background: #0a0a0a
cursor: pointer
```

레이어 (z-order, 아래→위):

a. **커버 이미지** (`<img>` 또는 `next/image`)
- `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover`
- `filter: grayscale(1)`
- `opacity: 0.65` (호버 시 `0.85`)
- `transition: opacity .4s`

b. **거대한 ID 숫자** (essay 번호 "01"~"08")
- `position: absolute; top: -30px; left: -10px`
- `font-family: "Instrument Serif", "Times New Roman", serif`
- `font-style: italic`
- `font-size: 280px`
- `line-height: 1`
- `letter-spacing: -0.06em`
- `color: #f5f3ee`
- **`mix-blend-mode: difference`** ← 핵심. 이미지 위에서 자동 반전됨
- `pointer-events: none`

c. **하단 텍스트 블록** (`position: absolute; left: 24px; right: 24px; bottom: 22px;`)
- flex column, gap 8px
- color `#f5f3ee`

  c-1. 카테고리 줄 (flex row, gap 10px, align baseline):
  - `<span>` 카테고리 (예: "OBJECT") — `font-size: 9px; letter-spacing: 0.22em; font-weight: 500; opacity: 0.85;`
  - 가로선 (18px × 1px, `background: currentColor; opacity: 0.5;`)
  - `<span>` 읽기 시간 ("7 min read") — `font-family: "Instrument Serif" italic; font-size: 12px;`

  c-2. 한글 제목 (`<h3>`):
  - `font-family: "Noto Sans KR"`
  - `font-weight: 500`
  - `font-size: 28px`
  - `line-height: 1.18`
  - `letter-spacing: -0.025em`
  - `text-wrap: balance`
  - `max-width: 380px`

  c-3. 영문 제목 (`<div>`):
  - `font-family: "Instrument Serif"; font-style: italic;`
  - `font-size: 14px; opacity: 0.7; letter-spacing: -0.005em;`

  c-4. 태그 줄 (density !== "minimal" 때만):
  - flex row, gap 6px, wrap
  - 각 태그: `font-size: 10px; padding: 2px 8px; border: 0.5px solid rgba(245,243,238,0.5); color: rgba(245,243,238,0.9);` (border-radius 0)
  - 텍스트 형식: `#태그명`

##### 4. `<SlimCard essay={...} />`

```
width: 280px; height: 100%; margin-right: 10px;
display: flex; align-items: stretch;
background: #1a1a1a; overflow: hidden; cursor: pointer;
```

좌측 thumb (`width: 100px; flex: 0 0 auto; position: relative; background: #0a0a0a;`):
- 안에 `<img>` 풀커버, `filter: grayscale(1) contrast(1.1)`, `opacity: 0.85` (hover 시 1)

우측 텍스트 영역 (`flex: 1; padding: 14px 16px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0;`):
- 상단 메타 줄 (flex justify-between, baseline):
  - 좌: `№ 01` — `font-family: "Instrument Serif" italic; font-size: 12px; opacity: 0.6;`
  - 우: 날짜 `2026.04.28` — 같은 스타일
- 중간 한글 제목 `<h4>`:
  - `font-family: "Noto Sans KR"; font-weight: 500;`
  - `font-size: 15px; line-height: 1.3; letter-spacing: -0.015em;`
  - `text-wrap: balance`
- 하단 카테고리:
  - `font-size: 9px; letter-spacing: 0.18em; font-weight: 500; opacity: 0.55;`

##### 5. `<HeroChrome />` (오버레이 UI)

a. **좌상단 로고** (`position: absolute; top: 26px; left: 30px; z-index: 5;`)
- column flex, gap 2px
- `<div>` "Take a Look" — `font-family: "Instrument Serif" italic; font-size: 22px; letter-spacing: -0.01em; color: #f5f3ee;`
- `<div>` "ESSAYS ON OBSESSIONS" — `font-family: "Noto Sans KR"; font-size: 9px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.55;`

b. **우상단 태그라인** (`position: absolute; top: 32px; right: 30px; z-index: 5; text-align: right; max-width: 280px;`)
- `font-family: "Instrument Serif" italic; font-size: 16px; line-height: 1.35; color: rgba(245,243,238,0.7);`
- 텍스트 (줄바꿈 포함):
  ```
  내가 왜 이걸
  파게 됐는지를 씁니다.
  ```

c. **우하단 HUD** (`position: absolute; bottom: 28px; right: 30px; z-index: 5;`)
- flex row, align center, gap 18px
- 인덱스: `<span>` italic, `font-family: "Instrument Serif"`, tabular-nums
  - 큰 부분: `font-size: 26px;` (현재 활성 인덱스, 01-padded)
  - `/` 구분: `color: rgba(245,243,238,0.4); margin: 0 4px;`
  - 총 개수: `color: rgba(245,243,238,0.4); font-size: 14px;`
- 화살표 버튼 두 개 (←, →):
  - `width: 30px; height: 30px; border-radius: 50%;`
  - `border: 0.5px solid rgba(245,243,238,0.22);`
  - `background: transparent; color: #f5f3ee;`
  - `font-family: "Instrument Serif"; font-size: 14px;`
  - 클릭 시 activeIdx 변경

d. **좌하단 라벨** (`position: absolute; bottom: 30px; left: 30px; z-index: 5;`)
- `font-family: "Noto Sans KR"; font-size: 10px; font-weight: 500; letter-spacing: 0.22em; color: rgba(245,243,238,0.45);`
- 텍스트: `AN INDEX OF OBSESSIONS · 08 ENTRIES` (08은 essays.length)

e. **배경 ghost 타이포** (`aria-hidden`, `position: absolute; left: -40px; bottom: -120px; z-index: 0; pointer-events: none; user-select: none; white-space: nowrap;`)
- `font-family: "Instrument Serif" italic;`
- `font-size: 480px; line-height: 0.85; letter-spacing: -0.05em;`
- `color: rgba(245,243,238,0.04)` ← 거의 안 보일 정도로 옅게
- 텍스트: `Take a Look.`

## Interactions & Behavior

### 자동 마퀴
- 페이지 로드 직후 자동 흐름 시작
- Lane 1: 좌측으로 60s/loop
- Lane 2: 우측으로 42s/loop (1.43배 빠름)
- 두 lane이 다른 속도로 흘러서 시각적 리듬을 만듦

### 호버 일시정지
- 두 lane을 감싸는 wrapper 또는 각 카드의 onMouseEnter/Leave에서 paused 상태 토글
- paused가 true면 두 lane 모두 `animation-play-state: paused`
- 어떤 카드든 호버하면 전체 마퀴 정지
- 호버 중인 카드 인덱스를 activeIdx로 동기화 → HUD의 인덱스 표시가 그 카드 번호로 갱신

### BigCard 호버
- 이미지 `opacity: 0.65 → 0.85` (.4s ease)

### SlimCard 호버
- 썸네일 `opacity: 0.85 → 1` (.3s)

### 카드 클릭
- `next/link`로 `/[slug]` 이동 (`href={\`/${essay.slug}\`}`)
- BigCard, SlimCard 둘 다 `<Link>`로 감쌈

### HUD 화살표
- 좌(←): `setActiveIdx((i - 1 + total) % total)`
- 우(→): `setActiveIdx((i + 1) % total)`
- 현재 디자인에서는 화살표가 마퀴 위치를 jump시키지는 않고, 표시 인덱스만 바꿉니다 (시각적 카운터 역할). 만약 화살표로 마퀴 스크롤 위치까지 옮기고 싶다면 추가 작업 필요 (선택사항 — 핵심 명세에는 포함하지 않음).

### 키보드
- 우선순위 낮음. 추가하려면 `useEffect`로 `keydown` 리스너 → ←/→ 이동.

## State Management

```ts
// MainHeroMarquee 컴포넌트 내부
const [hover, setHover] = useState<number | null>(null);  // 호버된 essay.id
const [activeIdx, setActiveIdx] = useState<number>(0);    // HUD에 표시할 index
const paused = hover !== null;
```

데이터:
- 기존 `getStaticProps + revalidate: 60` 패턴 유지
- `essays: Essay[]` props로 받음
- 메인에서는 최신 8개만 표시 (`prisma.essay.findMany({ where: { published: true }, orderBy: { date: 'desc' }, take: 8, include: { tags: true } })`)
- 8개 미만이면 그대로, 8개 이상이어도 8개로 cap

## Design Tokens

### Colors

| 용도 | Hex | 비고 |
|---|---|---|
| 배경 | `#0a0a0a` | near-black |
| 텍스트 (light on dark) | `#f5f3ee` | warm off-white |
| SlimCard 배경 | `#1a1a1a` | |
| 텍스트 muted 70 | `rgba(245,243,238,0.7)` | 태그라인 |
| 텍스트 muted 55 | `rgba(245,243,238,0.55)` | 로고 부제 |
| 텍스트 muted 45 | `rgba(245,243,238,0.45)` | 좌하단 라벨 |
| 텍스트 muted 40 | `rgba(245,243,238,0.4)` | HUD `/` 구분 |
| Border subtle | `rgba(245,243,238,0.22)` | HUD 버튼 테두리 (0.5px) |
| Border tag | `rgba(245,243,238,0.5)` | 태그 칩 테두리 (0.5px) |
| Ghost type | `rgba(245,243,238,0.04)` | 배경 거대 타이포 |

Tailwind 매핑 가이드:
- `#0a0a0a` ≈ `bg-neutral-950`
- `#1a1a1a` ≈ `bg-neutral-900`
- `#f5f3ee` ≈ 커스텀 토큰 추천 (warm-white). 가장 가까운 기본은 `text-stone-100`이지만 정확하지 않음

`tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      ink: '#0a0a0a',
      paper: '#f5f3ee',
    },
    fontFamily: {
      sans: ['"Noto Sans KR"', 'system-ui', 'sans-serif'],
      serif: ['"Instrument Serif"', '"Times New Roman"', 'serif'],
    },
    keyframes: {
      'marq-left':  { from: { transform: 'translate3d(0,0,0)' }, to: { transform: 'translate3d(-50%,0,0)' } },
      'marq-right': { from: { transform: 'translate3d(-50%,0,0)' }, to: { transform: 'translate3d(0,0,0)' } },
    },
    animation: {
      'marq-left':  'marq-left  var(--marq-speed, 60s) linear infinite',
      'marq-right': 'marq-right var(--marq-speed, 42s) linear infinite',
    },
  },
}
```

### Typography

| 토큰 | Family | Weight | Size | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| 로고 | Instrument Serif italic | 400 | 22px | -0.01em | 1 |
| 로고 부제 | Noto Sans KR | 500 | 9px | 0.18em uppercase | 1 |
| 태그라인 | Instrument Serif italic | 400 | 16px | normal | 1.35 |
| BigCard 한글 제목 | Noto Sans KR | 500 | 28px | -0.025em | 1.18 |
| BigCard 영문 제목 | Instrument Serif italic | 400 | 14px | -0.005em | 1.35 |
| BigCard 카테고리 | Noto Sans KR | 500 | 9px | 0.22em uppercase | 1 |
| BigCard 인덱스 (giant) | Instrument Serif italic | 400 | 280px | -0.06em | 1 |
| SlimCard 제목 | Noto Sans KR | 500 | 15px | -0.015em | 1.3 |
| SlimCard 메타 | Instrument Serif italic | 400 | 12px | normal | 1.3 |
| HUD 큰 인덱스 | Instrument Serif italic | 400 | 26px | normal | 1 |
| 좌하단 라벨 | Noto Sans KR | 500 | 10px | 0.22em uppercase | 1 |
| 배경 ghost | Instrument Serif italic | 400 | 480px | -0.05em | 0.85 |

폰트 로딩:
```
import { Noto_Sans_KR, Instrument_Serif } from 'next/font/google';

const notoKR = Noto_Sans_KR({ subsets: ['latin'], weight: ['400','500','700'], variable: '--font-sans' });
const serif  = Instrument_Serif({ subsets: ['latin'], weight: ['400'], style: ['normal','italic'], variable: '--font-serif' });
```
`_app.tsx` body에 두 variable 클래스 적용. `Instrument_Serif`는 next/font에 등록되어 있지 않을 수 있으니, 그 경우 `<link>` import 또는 self-host로 대체.

### Spacing
- 외부 padding: 100px top, 80px bottom (1080p 기준). 작은 viewport에서는 80/60 정도로 축소 권장
- Lane 사이 gap: 14px
- BigCard gap (margin-right): 12px
- SlimCard gap: 10px
- HUD 위치: bottom 28px right 30px
- 로고 위치: top 26px left 30px

### Filters
- 모든 커버 이미지: `filter: grayscale(1)` (B안은 다크 모노톤). BigCard 기본 `opacity: 0.65`, hover `0.85`
- SlimCard 썸네일: `filter: grayscale(1) contrast(1.1)`, opacity 0.85→1

## Assets

- **커버 이미지**: 현재 프로토타입은 `https://picsum.photos/seed/<slug>/1200/1600` 더미. 실제 구현에서는 `Essay.coverImage`(DB 컬럼)를 사용. `next/image`로 감싸고 `fill object-cover` 사용 권장. `priority`는 첫 viewport에 보이는 BigCard 2-3장에만 적용.
- **로고**: 현재는 텍스트만. SVG 로고가 있다면 그 자리에 swap 가능.
- **아이콘**: 화살표는 단순 ←/→ 글자 (Instrument Serif italic). 별도 아이콘 셋 불필요.

## 반응형

이 디자인은 1280px 이상 데스크탑 우선입니다. 모바일 대응 가이드:
- ≥ 1024px: 사양 그대로
- 768–1024px: BigCard width 360px, SlimCard 240px, ghost type 320px, 외부 padding 70/50
- < 768px: BigCard width 280px, SlimCard 220px, ghost type 220px, 외부 padding 60/40, 우상단 태그라인 숨김 또는 좌상단 로고 아래로 이동

세부는 디자이너와 추가 협의 필요. (이번 핸드오프는 데스크탑 사양 확정만 포함)

## 기존 코드베이스 연계

### 유지
- `prisma` 스키마 (Essay, Tag, Comment) 변경 없음
- `getStaticProps + revalidate: 60` 데이터 페치 패턴
- 라우팅 (`/`, `/[slug]`, `/admin/*`) 변경 없음
- `Card`, `TagChip`, `HorizontalScroll` 컴포넌트는 다른 페이지 (`/[slug]` 관련 글 strip 등)에서 계속 사용

### 변경
- `pages/index.tsx`: 헤더 + AutoMarquee 구조를 `<MainHeroMarquee />`로 교체. `Navbar`는 메인에서는 렌더하지 않음 (또는 `transparent over hero` variant)
- `components/AutoMarquee.tsx`: 현재 컴포넌트는 다른 곳에서 안 쓰면 삭제, 쓰면 유지하고 새로 `MainHeroMarquee.tsx` + `MarqueeLane.tsx` 추가
- `_app.tsx`: Instrument Serif 폰트 추가
- `tailwind.config.js`: 위 토큰 + keyframes 추가

### SEO / 메타 (이전 메모에서 확인된 정리 사항)
- `<Head>` title/description에 남아 있는 "비주류" → "Take a Look"으로 교체. JSON-LD `name` 필드도 확인.

## Files

`reference/` 폴더에 포함된 파일:

| 파일 | 역할 |
|---|---|
| `index.html` | 전체 데모. design canvas에 3개 변형이 나란히 배치됨 |
| `data.jsx` | 8개 샘플 에세이 데이터 (실제로는 DB에서 불러옴) |
| `marquee.jsx` | `MarqueeLane` 컴포넌트 — left/right 무한 흐름, 호버 일시정지 |
| `variations.jsx` | `VariationA/B/C` 세 가지 안. **B만 사용** (`VariationB` 함수) |
| `app.jsx` | design canvas 마운트 + Tweaks 패널 |

**핵심 참고 코드**: `reference/variations.jsx` 의 `VariationB`, `BigCard`, `SlimCard` 함수가 이 핸드오프의 ground truth입니다. 모든 수치(280px 거대 인덱스, 480px BigCard 폭, 0.04 ghost opacity 등)는 그 코드에서 가져왔습니다.

## Tweaks (선택)

원래 프로토타입에는 두 개의 라이브 노브가 있었습니다. 코드베이스에 직접 옮기지 않아도 되지만, 디자인 의도를 이해하는 데 참고:

- **Loop duration**: 20s ~ 140s (기본 60s). CSS variable `--marq-speed`로 노출하면 운영 중 튜닝 가능.
- **Information density**: `minimal` / `balanced` / `rich`
  - `minimal`: 태그 칩 숨김, 카테고리·제목만
  - `balanced`: 기본 (현재 명세)
  - `rich`: 태그 칩 표시 + excerpt 추가 (현재는 BigCard에 태그까지만)

## Open questions / Notes

1. 카드 클릭 시 essay 상세로 이동할 때, 마퀴가 멈춘 시점에서 자연스럽게 transition할지(예: 클릭한 카드의 이미지가 상세 페이지 hero로 morphing) 결정 필요. 일단은 단순 `Link` 이동으로 시작 권장.
2. 모바일 대응이 핵심 요구사항이면 별도 모바일 레이아웃(단일 lane vertical scroll 등) 디자인이 필요할 수 있음.
3. 접근성: 자동 마퀴는 `prefers-reduced-motion: reduce` 시 정지하도록 CSS 추가 권장:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .marq-left, .marq-right { animation: none !important; }
   }
   ```
4. `next/image` + `picsum.photos` 또는 실제 이미지 도메인을 `next.config.js` `images.domains`에 추가 필요.
