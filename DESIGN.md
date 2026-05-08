---
version: "alpha"
name: Take a Look
description: >
  Dark editorial magazine aesthetic for a Korean essay platform.
  Literary, restrained, typographically obsessive.

colors:
  ink: "#0a0a0a"
  paper: "#f5f3ee"
  surface: "#1a1a1a"
  paper-85: "rgba(245,243,238,0.85)"
  paper-70: "rgba(245,243,238,0.70)"
  paper-55: "rgba(245,243,238,0.55)"
  paper-45: "rgba(245,243,238,0.45)"
  paper-30: "rgba(245,243,238,0.30)"
  paper-07: "rgba(245,243,238,0.07)"
  paper-04: "rgba(245,243,238,0.04)"
  error: "#ef4444"

typography:
  micro:
    fontFamily: Noto Sans KR
    fontSize: 9px
    fontWeight: 500
    letterSpacing: 0.22em
    textTransform: uppercase
  label:
    fontFamily: Noto Sans KR
    fontSize: 10px
    fontWeight: 500
    letterSpacing: 0.18em
    textTransform: uppercase
  caption-serif:
    fontFamily: Instrument Serif
    fontSize: 12px
    fontWeight: 400
    fontStyle: italic
    letterSpacing: 0em
  small:
    fontFamily: Noto Sans KR
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: Noto Sans KR
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.78
    letterSpacing: -0.01em
  lead:
    fontFamily: Instrument Serif
    fontSize: 20px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.6
    letterSpacing: -0.005em
  logo:
    fontFamily: Instrument Serif
    fontSize: 22px
    fontWeight: 400
    fontStyle: italic
    letterSpacing: -0.01em
  heading-sm:
    fontFamily: Instrument Serif
    fontSize: 26px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.25
    letterSpacing: -0.02em
  heading-md:
    fontFamily: Noto Sans KR
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.18
    letterSpacing: -0.025em
  heading-lg:
    fontFamily: Noto Sans KR
    fontSize: clamp(26px, 3.6vw, 46px)
    fontWeight: 500
    lineHeight: 1.14
    letterSpacing: -0.03em
  ghost:
    fontFamily: Instrument Serif
    fontSize: 280px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1
    letterSpacing: -0.06em

rounded:
  none: 0px
  full: 9999px

spacing:
  xs: 6px
  sm: 10px
  md: 14px
  lg: 24px
  xl: 30px
  section: 48px
  hero: 72px

components:
  tag:
    backgroundColor: transparent
    textColor: "{colors.paper-70}"
    typography: label
    rounded: "{rounded.none}"
    padding: "3px 10px"
    border: "0.5px solid {colors.paper-30}"

  tag-inline:
    backgroundColor: transparent
    textColor: "rgba(245,243,238,0.9)"
    typography: label
    rounded: "{rounded.none}"
    padding: "2px 8px"
    border: "0.5px solid rgba(245,243,238,0.5)"

  nav-link:
    textColor: "{colors.paper-45}"
    typography: label

  nav-link-hover:
    textColor: "{colors.paper-85}"

  circle-button:
    backgroundColor: transparent
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    width: 30px
    height: 30px
    border: "0.5px solid rgba(245,243,238,0.22)"

  divider:
    height: 1px
    backgroundColor: "{colors.paper-07}"

  card-big:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    width: 480px
    rounded: "{rounded.none}"

  card-slim:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.paper}"
    width: 280px
    rounded: "{rounded.none}"
---

## Overview

**Take a Look**은 한국어 에세이 플랫폼으로, 리터러리 매거진의 미감을 디지털로 구현한다. 다크 배경에 따뜻한 오프화이트 텍스트를 기반으로 하며, 세리프체의 장식적 활용과 절제된 모노크롬 이미지로 "종이 잡지를 디지털로 펼치는" 경험을 만든다.

**핵심 무드**: Editorial · Dark · Literary · Obsessive
**키워드**: 절제, 활자, 흑백, 장식적 타이포그래피, 느린 감상

두 가지 폰트 시스템이 의미를 분담한다.
- **Noto Sans KR** — 기능적 텍스트: 본문, UI 레이블, 제목
- **Instrument Serif italic** — 성격을 드러내는 텍스트: 로고, 날짜, 인용구, 장식 숫자

## Colors

배경은 `ink(#0a0a0a)`, 텍스트는 `paper(#f5f3ee)`의 이색 시스템을 따른다. 순수한 흰색이나 순수한 검정은 사용하지 않는다 — ink는 따뜻한 기운이 없는 어두운 검정, paper는 노르스름한 온기가 있는 오프화이트다.

**불투명도 스케일** (paper 기반):

| 역할 | 값 | 용도 |
|---|---|---|
| Primary | `#f5f3ee` (100%) | 주요 제목, 포커스 텍스트 |
| High | `rgba(245,243,238,0.85)` | 카테고리 레이블 |
| Medium-high | `rgba(245,243,238,0.70)` | 태그, 일반 텍스트 |
| Medium | `rgba(245,243,238,0.55)` | 서브태그라인, 보조 정보 |
| Low | `rgba(245,243,238,0.45)` | 비활성 내비게이션, 날짜 |
| Ghost | `rgba(245,243,238,0.30)` | 아이콘 텍스트, 배경 레이블 |
| Divider | `rgba(245,243,238,0.07)` | 구분선 |
| Watermark | `rgba(245,243,238,0.04)` | 배경 장식 글리프 |

`surface(#1a1a1a)`는 SlimCard와 같이 ink 위에 얹히는 요소의 배경에만 쓴다.

**절대 하지 말 것**: 밝은 배경(`white`, `gray-50`)을 메인 레이아웃에 섞지 않는다. 로그인·폼 페이지도 ink 테마를 따라야 한다.

## Typography

두 폰트 패밀리만 사용한다.

**Noto Sans KR** — CSS class로 기본 적용됨
**Instrument Serif italic** — CSS variable `--font-serif`, `font-family: var(--font-serif, serif)` 로 호출

### 스케일

| 이름 | 폰트 | 크기 | 두께 | 자간 | 용도 |
|---|---|---|---|---|---|
| `micro` | Sans | 9px | 500 | +0.22em | 최소 레이블, 코너 텍스트 |
| `label` | Sans | 10px | 500 | +0.18em | 태그, 내비게이션 |
| `caption-serif` | Serif italic | 12px | 400 | 0 | 날짜, 番号(№), 부가 정보 |
| `small` | Sans | 14px | 400 | — | 메타 정보, 인용 요약 |
| `body` | Sans | 17px | 400 | -0.01em | 에세이 본문 |
| `lead` | Serif italic | 20px | 400 | -0.005em | 리드 인용구(excerpt) |
| `logo` | Serif italic | 22px | 400 | -0.01em | 사이트 로고 |
| `heading-sm` | Serif italic | 26px | 400 | -0.02em | 섹션 헤더("더 읽기") |
| `heading-md` | Sans | 28px | 500 | -0.025em | 카드 제목 |
| `heading-lg` | Sans | clamp(26px, 3.6vw, 46px) | 500 | -0.03em | 에세이 페이지 H1 |
| `ghost` | Serif italic | 280px+ | 400 | -0.06em | 배경 장식 숫자/글리프 |

### 규칙

- `micro`와 `label`은 항상 **대문자(uppercase)** 로 렌더링한다.
- Serif는 기능적 텍스트에 쓰지 않는다 — 날짜, 번호, 인용, 로고, 장식에만 허용.
- 한국어 본문은 sans(Noto Sans KR)만 사용한다.
- 음수 letter-spacing(-0.01em 이하)은 제목급 텍스트에만 적용한다.

## Layout

### 페이지 유형

**홈 (풀스크린 마르키)**: `width: 100vw; height: 100vh; overflow: hidden` — 스크롤 없음. 마르키 두 레인이 화면을 채운다.

**에세이 (독서 뷰)**: `max-width: 720px; margin: 0 auto; padding: 0 24px` — 중앙 정렬, 넉넉한 세로 여백.

### 마르키 레인 구조

```
상단 여백: 100px
레인 1 (BigCard, left): flex 0 0 62%
레인 간 갭: 14px
레인 2 (SlimCard, right): flex 1
하단 여백: 80px
```

### 코너 레이아웃 시스템

풀스크린 페이지에서 UI 요소는 4 코너에 고정 배치한다:

| 위치 | 내용 |
|---|---|
| top-left (26, 30) | 로고 + 서브태그라인 |
| top-right (28, 30) | 내비게이션 링크 |
| bottom-left (30, 30) | 인덱스 레이블 |
| bottom-right (28, 30) | HUD (번호/컨트롤) |

### 여백 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| xs | 6px | 태그 간격, 아이콘 갭 |
| sm | 10px | 카드 간격 |
| md | 14px | 레인 갭, 메타 정보 갭 |
| lg | 24px | 내비게이션 링크 간격 |
| xl | 30px | 페이지 엣지 패딩 |
| section | 48px | 섹션 상단 여백 |
| hero | 72vh | 히어로 높이 |

## Elevation & Depth

레이어는 밝기로 구분한다 — 그림자 없음, 오직 색상.

| 레이어 | 색상 | 용도 |
|---|---|---|
| Base | `#0a0a0a` (ink) | 페이지 배경 |
| Surface | `#1a1a1a` | 카드, 입력 필드 배경 |
| Overlay | `rgba(10,10,10,0.55~0.97)` | 이미지 위 그라디언트 |
| Ghost | `mix-blend-mode: difference` | 장식 타이포그래피 |

**이미지 처리**: 모든 커버 이미지는 `filter: grayscale(1)` 적용, opacity는 상태에 따라:
- 기본: `0.45~0.65`
- 호버: `0.85~1.0`
- 관련 에세이 썸네일: `grayscale(1) contrast(1.1)`, opacity `0.85`

히어로 오버레이:
```css
background: linear-gradient(
  to bottom,
  rgba(10,10,10,0.10) 0%,
  rgba(10,10,10,0.55) 50%,
  rgba(10,10,10,0.97) 100%
);
```

## Shapes

Take a Look의 UI는 **모서리 없음(zero-radius)** 원칙을 따른다. 각진 형태가 에디토리얼 긴장감을 만든다.

| 요소 | border-radius | 이유 |
|---|---|---|
| 카드 (BigCard, SlimCard) | 0 | 인쇄 잡지 감 |
| 태그 | 0 | 날카로운 레이블 |
| 구분선 | — | 직선 |
| 원형 버튼 (nav arrows) | 50% | 기능적 대비 |
| 폼 요소 (레거시) | 4px | 라이트 테마 한정 |

**테두리**: 항상 `0.5px solid` — 1px 이상 사용하지 않는다.
- 태그: `0.5px solid rgba(245,243,238,0.3~0.5)`
- 원형 버튼: `0.5px solid rgba(245,243,238,0.22)`
- 구분선: 별도 요소, `height: 1px`

## Components

### 로고

```
[Serif italic 22px] Take a Look
[Sans 500 uppercase 9px +0.18em opacity-55] ESSAYS ON OBSESSIONS
```
두 줄 구성, gap: 2px. 링크로 홈을 가리킨다.

### 태그 (dark 테마)

```
border: 0.5px solid rgba(245,243,238,0.3)
padding: 3px 10px
font-size: 10px
font-weight: 500
letter-spacing: 0.15em
text-transform: uppercase
color: rgba(245,243,238,0.7)
border-radius: 0
```

인라인(카드 위): `border: 0.5px solid rgba(245,243,238,0.5)`, `padding: 2px 8px`

### 카테고리·읽기시간 메타 행

```
[CATEGORY label] — — [serif italic reading-time]
```
카테고리(sans 500 9px +0.22em)와 읽기시간(serif italic 12px) 사이에 `18×1px` 선으로 구분.

### 내비게이션 링크

```
font-size: 10px
font-weight: 500
letter-spacing: 0.2em
text-transform: uppercase
color: rgba(245,243,238,0.45)  /* 기본 */
color: rgba(245,243,238,0.85)  /* hover */
transition: color 0.2s
```

### 원형 컨트롤 버튼

```
width: 30px; height: 30px
border-radius: 50%
border: 0.5px solid rgba(245,243,238,0.22)
background: transparent
color: #f5f3ee
font-family: serif italic
```

### HUD 카운터

```
[serif italic 26px] 01  [opacity-40] / [opacity-40 14px] 08
```

### 구분선

```html
<div style="height: 1px; background: rgba(245,243,238,0.07); margin: 0 30px" />
```

### 에세이 리드 인용구

```
font-family: serif italic
font-size: 20px
line-height: 1.6
color: rgba(245,243,238,0.6)
letter-spacing: -0.005em
padding-left: 20px
border-left: 1px solid rgba(245,243,238,0.15)
margin-bottom: 52px
```

### 장식 고스트 타이포그래피

```
font-family: serif italic
font-size: 280px ~ 480px
letter-spacing: -0.05em ~ -0.06em
color: rgba(245,243,238,0.04)  /* 배경 워터마크 */
   또는
color: #f5f3ee + mix-blend-mode: difference  /* 전경 장식 */
pointer-events: none; user-select: none; aria-hidden: true
```

## Do's and Don'ts

### Do

- **어두운 배경을 유지한다.** 모든 새 페이지는 `bg-ink text-paper` (또는 `background: #0a0a0a; color: #f5f3ee`) 에서 시작한다.
- **모든 이미지에 grayscale을 적용한다.** `filter: grayscale(1)` 또는 Tailwind `grayscale` 클래스.
- **테두리는 0.5px를 쓴다.** 1px 이상은 너무 두껍다.
- **micro/label 텍스트는 항상 uppercase.** 소문자 레이블은 쓰지 않는다.
- **새 레이아웃에도 코너 시스템을 따른다.** 풀스크린 페이지는 4 코너에 UI를 배치한다.
- **인터랙션에는 opacity transition을 쓴다.** color 변경 0.2s, image opacity 0.3~0.4s.
- **`prefers-reduced-motion`을 존중한다.** 마르키 등 애니메이션 요소에 미디어쿼리를 추가한다.
- **장식 요소에는 `aria-hidden="true"`를 붙인다.** 고스트 숫자, 배경 워터마크 등.

### Don't

- **밝은 배경(`white`, `gray-50`, `bg-white`)을 메인 레이아웃에 쓰지 않는다.** 로그인/폼 페이지도 ink 테마를 따라야 한다.
- **컬러 이미지를 그대로 쓰지 않는다.** 무조건 grayscale 처리.
- **둥근 카드나 둥근 태그를 만들지 않는다.** border-radius는 원형 버튼에만.
- **세 번째 폰트를 추가하지 않는다.** Noto Sans KR + Instrument Serif 이외 폰트는 브랜드를 희석시킨다.
- **컬러 포인트 색상을 추가하지 않는다.** 전체 팔레트는 ink/paper 이색 시스템이다. 파랑, 초록 등 accent color는 금지.
- **그림자(box-shadow)를 쓰지 않는다.** 깊이는 배경색 차이로만 표현한다.
- **serif 폰트를 기능적 UI에 쓰지 않는다.** 버튼 레이블, 폼 라벨, 내비게이션 등에는 sans만.
- **bold(700 이상)를 남발하지 않는다.** 제목은 font-weight: 500(medium)이 기본이다.
