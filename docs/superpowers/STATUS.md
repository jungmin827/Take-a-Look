# 비주류 v2 구현 진행 상황

**마지막 업데이트:** 2026-05-03  
**상태: ✅ 전체 완료**

---

## 완료된 태스크 (Task 1~15 전체)

| # | 태스크 | 커밋 | 상태 |
|---|--------|------|------|
| 1 | 의존성 설치 (Prisma, Tiptap, jwt, cookie 등) | `be41630` | ✅ |
| 2 | Prisma 스키마 + DB 초기화 | `df83e41`, `b2fec1d` | ✅ |
| 3 | Prisma 클라이언트 싱글턴 (`lib/db.ts`) | `9411bae`, `8d5de28` | ✅ |
| 4 | 시드 스크립트 (`scripts/seed.ts`) | `1542d36` | ✅ |
| 5 | Essay DB 헬퍼 + 타입 업데이트 | `5796c13`, `f1b9952` | ✅ |
| 6 | 어드민 인증 (JWT + httpOnly cookie) | `7928b0b`, `9b5df3d` | ✅ |
| 7 | Essay API Routes (CRUD + 관련글) | `3565bb5`, `e878923` | ✅ |
| 8 | Comment API + Rate Limiter | `d755b28`, `fb268ca` | ✅ |
| 9 | Tiptap 컴포넌트 (Editor + EditorViewer) | `4b7ce50` | ✅ |
| 10 | HorizontalScroll 컴포넌트 | `29a39ac` | ✅ |
| 11 | index 페이지 (ISR + 2열 슬라이딩) | `f049d33` | ✅ |
| 12 | CommentSection 컴포넌트 | `a183947` | ✅ |
| 13 | [slug] 페이지 (SSR + Tiptap + 관련글 + 댓글) | `1d2b91d` | ✅ |
| 14 | 어드민 페이지 (로그인 + 글 작성/수정) | `4c4bc2a` | ✅ |
| 15 | 최종 빌드 검증 (build + lint 클린) | `64ab969` | ✅ |
