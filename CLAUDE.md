# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Take a Look — Claude 하네스

## 명령어

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
npm test             # Vitest 전체 테스트 (1회 실행)
npm run test:watch   # Vitest watch 모드

# 단일 테스트 파일 실행
npx vitest run __tests__/embedding.test.ts

# DB 스키마 변경 후
npx prisma migrate dev
npx prisma generate

# 기존 에세이 데이터 시딩
npm run seed
```

---

## 아키텍처 개요

### 이중 DB 구조

로컬 SQLite(Prisma) + Supabase(pgvector)를 병행 사용한다.

| 저장소 | 용도 | 접근 경로 |
|---|---|---|
| `dev.db` (SQLite) | 에세이, 태그, 댓글 | `lib/db.ts` → Prisma |
| Supabase Postgres | 사용자 인증, `essay_embeddings` (pgvector) | `lib/supabase.ts`, `lib/supabase-vector.ts` |

Prisma 어댑터는 `@prisma/adapter-better-sqlite3`이며 `lib/db.ts`에서 글로벌 싱글턴으로 관리한다.

### 인증 이원화

- **관리자**: JWT 쿠키(`admin_token`) — `lib/admin-auth.ts`의 `verifyAdmin()`으로 검증. 비밀키는 `ADMIN_JWT_SECRET` 환경변수.
- **일반 사용자**: Supabase Auth — `middleware.ts`에서 `/my/*` 경로를 보호, 미인증 시 `/login`으로 리다이렉트.

### 에세이 콘텐츠 흐름

에세이 본문은 TipTap JSON으로 저장된다(`content` 컬럼).

1. **저장**: `pages/api/essays/index.ts` POST → Prisma 저장 → 임베딩 생성(non-fatal)
2. **임베딩**: `lib/embedding.ts` (`extractTextFromTipTap` → `chunkText` 512단어/50 overlap → `text-embedding-3-small` 배치 호출) → `lib/supabase-vector.ts` (`essay_embeddings` 테이블 upsert)
3. **읽기**: `pages/[slug].tsx`는 `getServerSideProps`로 렌더링. `EditorViewer`(TipTap 뷰어)와 `VoiceChat` 모두 `dynamic import({ ssr: false })`

### AI 음성 레이어

`pages/api/ai/voice-session.ts`:
- IP당 분당 10회 rate limit (`lib/rate-limit.ts` 인메모리)
- OpenAI Realtime API ephemeral 토큰 발급 (`gpt-4o-realtime-preview`, PCM16)
- 에세이 전문을 3000단어로 truncate해 system instruction에 주입

`components/VoiceChat.tsx`: WebSocket 3회 자동 재연결, 5분 타임아웃, 30초 전 경고.

### API 라우트 구조

```
pages/api/
  essays/         GET(목록), POST(생성), [id].ts(수정·삭제)
  comments/       댓글 CRUD
  admin/          관리자 로그인/로그아웃
  ai/
    voice-session.ts   Realtime API 토큰 발급
```

### 경로 별칭

`tsconfig.json`과 `vitest.config.ts` 모두 `@/` → 프로젝트 루트로 alias 설정.

---

## 디자인 하네스 (DESIGN.md)

UI·컴포넌트·스타일 관련 작업을 할 때는 **반드시 `DESIGN.md`를 먼저 참조**한다.

`DESIGN.md`가 정의하는 규칙:
- 색상: ink(`#0a0a0a`) / paper(`#f5f3ee`) 2색 시스템, 불투명도 스케일
- 폰트: Noto Sans KR (기능) + Instrument Serif italic (장식) 2폰트 고정
- 테두리: 항상 `0.5px solid`, 둥근 모서리 없음 (원형 버튼 제외)
- 이미지: 무조건 grayscale
- 레이아웃: 홈은 100vw/100vh 풀스크린, 에세이는 max-width 720px
- 새 색상·폰트·accent color 추가 금지

새 페이지나 컴포넌트를 만들 때 `DESIGN.md`의 토큰과 컴포넌트 스펙을 그대로 사용한다.
디자인 결정이 `DESIGN.md`와 충돌하면 사용자에게 먼저 알린다.

---

## 개발 원칙

**코딩 전 생각하기** — 모호한 요구사항이 있으면 구현 전에 질문한다. 여러 해석이 가능하면 선택지를 제시하고 승인을 받는다.

**단순함 우선** — 요청된 것만 구현한다. 추측성 기능, 단일 사용 추상화, 불필요한 에러 처리를 추가하지 않는다.

**수술적 변경** — 요청된 부분만 수정한다. 관련 없는 코드를 임의로 개선하거나 스타일을 바꾸지 않는다. 기존 데드 코드는 언급만 하고, 명시적 요청 없이 삭제하지 않는다.

**목표 기반 실행** — 작업 전 검증 가능한 성공 기준을 명확히 한다. 다단계 작업은 단계별 체크포인트를 포함한다.

---

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
