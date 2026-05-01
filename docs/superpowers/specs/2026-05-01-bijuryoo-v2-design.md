# 비주류 v2 — 서비스 설계 스펙

**날짜:** 2026-05-01  
**스택:** Next.js 14 · Prisma · SQLite(개발) / Postgres(프로덕션) · Tiptap · Tailwind CSS  

---

## 1. 서비스 방향

비주류는 한 사람이 가진 비주류 취향과 지식을 카탈로그 형태로 공유하는 플랫폼이다.  
나무위키처럼 다양한 분야를 탐구하며 콘텐츠를 타고 들어가는 발견의 재미가 핵심 후킹 포인트다.  
댓글 구경하기 + 관련 글 탐색이 체류 시간을 늘리는 두 번째 축이다.

---

## 2. 데이터 모델

### Essay
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | PK |
| slug | String (unique) | URL 식별자 |
| title | String | 제목 |
| excerpt | String | 요약 (카드에 표시) |
| coverImage | String | 커버 이미지 URL |
| alt | String | 이미지 alt |
| content | Json | Tiptap 블록 JSON |
| date | DateTime | 발행일 |
| readingTime | String | 예: "5분" |
| published | Boolean | 발행 여부 (false = 임시저장) |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| tags | Tag[] | 다대다 관계 |

### Tag
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | PK |
| name | String (unique) | 태그명 |
| essays | Essay[] | |

### Comment
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | PK |
| essayId | String | FK → Essay |
| authorName | String | 닉네임 (계정 불필요) |
| body | String | 댓글 내용 (5~500자) |
| parentId | String? | null = 루트 댓글, 값 있음 = 대댓글 |
| createdAt | DateTime | |

기존 `content/*.mdx` 파일은 초기 데이터 시드 스크립트로 DB에 마이그레이션한다.

---

## 3. UI 구조

### 3-1. 메인 피드 (/)

- **2열 가로 슬라이딩** 카드 그리드
- 한 화면에 카드 2개가 나란히 표시, 스와이프/스크롤로 다음 2개
- CSS: `scroll-snap-type: x mandatory`, `overflow-x: scroll`
- 카드 너비: 모바일 `160px` / 데스크탑 `220px`
- 각 카드: `scroll-snap-align: start`

### 3-2. 글 상세 페이지 (/[slug])

```
[커버 이미지 전체폭]
[태그 칩들]
[제목]  [날짜 · 읽기 시간]
─────────────────────────────
[Tiptap 렌더링 본문 — editable: false]
─────────────────────────────
[관련 글] ← 가로 슬라이딩 (태그 교집합 기반, 최대 10개)
─────────────────────────────
[댓글 섹션]
  닉네임 입력 + 댓글 작성 폼
  댓글 목록 (루트 → 대댓글 1단계 인덴트)
```

### 3-3. 어드민 에디터 (/admin)

- `/admin/write` — 새 글 작성
- `/admin/edit/[slug]` — 기존 글 수정
- 비밀번호 보호: `ADMIN_PASSWORD` 환경변수 비교 (세션 쿠키)
- 에디터 상단: 제목 · 태그 · 커버 이미지 URL · 발행 여부 토글
- 에디터 하단: 자동저장(3초 디바운스) + 수동 발행 버튼

---

## 4. Tiptap 에디터

### 적용 익스텐션
- `StarterKit` — H1~H6, Bold, Italic, BulletList, OrderedList, Blockquote, CodeBlock, HorizontalRule
- `Placeholder` — "/ 를 입력해 블록을 추가하세요..."
- `Typography` — 스마트 따옴표 등 타이포그래피 자동 교정
- `Image` — 이미지 삽입
- `Link` — 링크 + 위키링크 스타일 내부 연결

### 마크다운 단축키 (입력 즉시 전환)
| 입력 | 전환 결과 |
|------|-----------|
| `# ` | H1 |
| `## ` | H2 |
| `### ` | H3 |
| `- ` / `* ` | 불릿 리스트 |
| `1. ` | 번호 리스트 |
| `> ` | 인용 블록 |
| ` ``` ` | 코드 블록 |
| `**텍스트**` | 볼드 |
| `*텍스트*` | 이탤릭 |
| `/` | 블록 커맨드 팔레트 |

### 저장
- 자동저장: 변경 3초 후 `PATCH /api/essays/[id]` (content JSON)
- 발행: "발행" 버튼 → `published: true` + slug 확정

### 독자 뷰
- 동일 Tiptap 컴포넌트, `editable: false`
- `@tailwindcss/typography` prose 스타일 적용

---

## 5. 댓글 시스템

### 작성 규칙
- 닉네임: 2자 이상
- 댓글: 5자 이상 · 500자 이하
- 계정 불필요

### 대댓글
- 1단계만 지원 (`parentId` nullable)
- "답글" 버튼 → 인라인 입력창 노출

### 스팸 방지
- 서버사이드 길이 검증
- Rate limiting: 동일 IP 1분에 5개 제한

### API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/comments?essayId=xxx` | 댓글 목록 |
| POST | `/api/comments` | 댓글 작성 |
| DELETE | `/api/comments/[id]` | 어드민 전용 삭제 |

---

## 6. 태그 기반 관련 콘텐츠

- 현재 글의 태그와 교집합 수가 많은 순으로 정렬
- 최대 10개, 자기 자신 제외, published 글만
- API: `GET /api/essays/related?slug=xxx`
- UI: 가로 슬라이딩 카드 (메인 피드와 동일 컴포넌트 재사용)

---

## 7. API 전체 목록

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/essays` | 발행된 글 목록 |
| GET | `/api/essays/[slug]` | 글 상세 |
| GET | `/api/essays/related?slug=xxx` | 관련 글 |
| POST | `/api/essays` | 새 글 생성 (어드민) |
| PATCH | `/api/essays/[id]` | 글 수정 (어드민) |
| DELETE | `/api/essays/[id]` | 글 삭제 (어드민) |
| GET | `/api/comments?essayId=xxx` | 댓글 목록 |
| POST | `/api/comments` | 댓글 작성 |
| DELETE | `/api/comments/[id]` | 댓글 삭제 (어드민) |
| POST | `/api/admin/login` | 어드민 로그인 |

---

## 8. 마이그레이션 전략

1. `prisma init` → `schema.prisma` 작성
2. `npx prisma migrate dev` → DB 생성
3. `scripts/seed.ts` — 기존 `content/*.mdx` 파싱 → DB 삽입
4. `lib/essays.ts` 파일시스템 로직 → Prisma 쿼리로 교체
5. `pages/index.tsx` — SSG → ISR (`revalidate: 60`) 전환 (글 발행 시 피드 자동 갱신)
6. `pages/[slug].tsx` — SSG → SSR 전환 (댓글이 매 요청마다 최신 상태여야 하므로)

---

## 9. 미결 사항

- 이미지 업로드: 현재 URL 직접 입력. 추후 S3/Cloudflare R2 업로드로 확장 가능.
- 검색: v3 범위. 현재는 태그 탐색으로 커버.
- 어드민 인증: 단순 비밀번호 기반. 트래픽 증가 시 NextAuth 전환 고려.
