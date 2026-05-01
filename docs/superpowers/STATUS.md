# 비주류 v2 구현 진행 상황

**마지막 업데이트:** 2026-05-01  
**구현 방식:** Subagent-Driven Development (태스크당 구현 → 스펙 리뷰 → 품질 리뷰)  
**계획 파일:** `docs/superpowers/plans/2026-05-01-bijuryoo-v2.md`

---

## 완료된 태스크 (Task 1~9)

| # | 태스크 | 커밋 | 상태 |
|---|--------|------|------|
| 1 | 의존성 설치 (Prisma, Tiptap, jwt, cookie 등) | `be41630` | ✅ |
| 2 | Prisma 스키마 + DB 초기화 (schema.prisma, migrations, dev.db) | `df83e41`, `b2fec1d` | ✅ |
| 3 | Prisma 클라이언트 싱글턴 (`lib/db.ts`) | `9411bae`, `8d5de28` | ✅ |
| 4 | 시드 스크립트 (`scripts/seed.ts` — MDX → DB) | `1542d36` | ✅ |
| 5 | Essay DB 헬퍼 + 타입 업데이트 (`lib/essays-db.ts`, `types/index.ts`) | `5796c13`, `f1b9952` | ✅ |
| 6 | 어드민 인증 (`lib/admin-auth.ts`, `pages/api/admin/login.ts`) | `7928b0b`, `9b5df3d` | ✅ |
| 7 | Essay API Routes (`pages/api/essays/`) | `3565bb5`, `e878923` | ✅ |
| 8 | Comment API + Rate Limiter (`lib/rate-limit.ts`, `pages/api/comments/`) | `d755b28`, `fb268ca` | ✅ |
| 9 | Tiptap 컴포넌트 (`components/Editor.tsx`, `components/EditorViewer.tsx`) | `4b7ce50` | ✅ |

---

## 남은 태스크 (Task 10~15)

**다음 재개 시작점: Task 10**

### Task 10: HorizontalScroll 컴포넌트
- **파일:** `components/HorizontalScroll.tsx` 생성
- **내용:** CSS scroll-snap 기반 가로 슬라이딩 컨테이너, `variant="feed"` (50% 너비) / `variant="strip"` (160px/220px) 두 모드, 화살표 버튼 (데스크탑만)
- **계획 위치:** `docs/superpowers/plans/2026-05-01-bijuryoo-v2.md` → Task 10 섹션

### Task 11: index 페이지 업데이트 (ISR + 2열 슬라이딩)
- **파일:** `pages/index.tsx` 수정
- **내용:** 기존 3열 그리드 → `HorizontalScroll variant="feed"` 교체, `revalidate: 60` ISR, `getAllEssays()`를 `await`로 (async getStaticProps)

### Task 12: CommentSection 컴포넌트
- **파일:** `components/CommentSection.tsx` 생성
- **내용:** 댓글 목록 + 루트 댓글 작성 폼 + 대댓글(1단계) 인라인 폼, fetch `/api/comments?essayId=xxx`, 닉네임/내용 유효성 표시

### Task 13: [slug] 페이지 업데이트 (SSR + Tiptap 뷰어 + 관련글 + 댓글)
- **파일:** `pages/[slug].tsx` 전체 교체
- **내용:** SSG → SSR (`getServerSideProps`), MDXRemote 제거 → `EditorViewer` (dynamic import, ssr:false), 관련글 `HorizontalScroll variant="strip"`, `CommentSection` 추가

### Task 14: 어드민 페이지
- **파일:** `pages/admin/index.tsx`, `pages/admin/write.tsx`, `pages/admin/edit/[slug].tsx` 생성
- **내용:** 로그인 폼(비로그인) / 글 목록(로그인), 새 글 작성 (Tiptap Editor + 자동저장 3초 디바운스 + 발행 버튼), 기존 글 수정 에디터

### Task 15: 최종 빌드 검증
- **내용:** `npm run build` 성공 확인, `npm run lint` 에러 없음, 전체 라우트 스모크 테스트 (/, /[slug], /admin, /admin/write, /admin/edit/[slug]), 댓글 작성/대댓글 동작 확인

---

## 주요 기술 메모 (재개 시 참고)

- **Prisma 7**: `new PrismaClient()` 단독 사용 불가 → `PrismaBetterSqlite3` 어댑터 필요 (`lib/db.ts` 참고)
- **dev.db 위치**: 프로젝트 루트 (`./dev.db`), `prisma/dev.db` 아님
- **Tiptap 3.x 변경점**: `immediatelyRender: false` 필요, `setContent` 2번째 인자가 `{ emitUpdate: false }`
- **EditorViewer**: `dynamic(() => import(...), { ssr: false })` 으로만 사용 (SSR 불가)
- **어드민 인증**: JWT → `admin_token` httpOnly 쿠키, `verifyAdmin(req)` 함수로 검증
- **Rate Limit**: IP당 1분에 5회, `lib/rate-limit.ts` 인메모리 Map

---

## 재개 방법

이 파일을 참고해서 **"Task 10부터 계속해줘"** 라고 요청하면 됩니다.
