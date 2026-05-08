# Take a Look — Claude 하네스

## 1. 코딩 전 생각하기 (Think Before Coding)

가정을 추측으로 채우지 않는다. 모호한 요구사항이 있으면 구현 전에 질문한다.
여러 해석이 가능하면 선택지를 제시하고 이유를 설명한 뒤 승인을 받는다.
더 간단한 방법이 있으면 먼저 제안한다.

## 2. 단순함 우선 (Simplicity First)

요청된 것만 구현한다. 추측성 기능, 단일 사용 추상화, 불필요한 에러 처리를 추가하지 않는다.
코드가 불필요하게 길어졌다면 다시 작성한다.

## 3. 수술적 변경 (Surgical Changes)

요청된 부분만 수정한다. 관련 없는 코드를 임의로 개선하거나 스타일을 바꾸지 않는다.
기존 데드 코드는 언급만 하고, 명시적 요청 없이 삭제하지 않는다.
내 변경으로 생긴 orphan import/변수만 제거한다.

## 4. 목표 기반 실행 (Goal-Driven Execution)

작업을 시작하기 전에 검증 가능한 성공 기준을 명확히 한다.
다단계 작업은 단계별 체크포인트를 포함한다.

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
