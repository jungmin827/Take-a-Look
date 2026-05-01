# Take-a-Look
취향 플랫폼
"당신은 왜 그것을 파게 되었나요?" > 내면의 깊은 취향을 탐구하고 전파하는 취향 에세이 플랫폼 '비주류'입니다.

📌 Project Vision
기존의 소셜 미디어가 '무엇을 소비했는가(Tracking)'에 집중할 때, 비주류는 '왜 사랑하는가(Why)'에 집중합니다. 머니그라피의 '비주류 초대석' 감성을 공유하는 2030 세대를 위한 깊이 있는 아카이빙 공간을 지향합니다.

✨ Phase A MVP Features (In Scope)
현재 단계에서는 독자에게 최상의 읽기 경험을 제공하는 것에 집중합니다.

Letterboxd 스타일 피드: 3열 반응형 그리드로 구성된 시각적 탐색 경험.

MDX 기반 콘텐츠: next-mdx-remote를 활용한 고성능 정적 에세이 렌더링.

모바일 퍼스트 디자인: 이동 중에도 쾌적하게 읽을 수 있는 타이포그래피와 레이아웃.

SEO & 공유 최적화: 카카오톡 공유를 위한 정적 OG 이미지 및 JSON-LD 구조화 데이터 적용.

태그 시스템: 카테고리 대신 유연한 태그 칩을 통한 취향 분류.

🛠 Tech Stack
Layer	Technology	Reason
Framework	Next.js (Pages Router)	MVP의 빠른 구축 및 정적 생성(SSG) 최적화
Styling	Tailwind CSS	생산성 높은 반응형 디자인 구현
Content	MDX + gray-matter	로컬 파일을 통한 가벼운 콘텐츠 관리 시스템
Image	next/image	LCP 최적화 및 WebP 자동 변환을 통한 성능 확보
Deployment	Vercel	Push-to-deploy 기반의 안정적인 호스팅
🏗 Project Structure
Plaintext
content/          # 취향 에세이 원문 (.mdx)
pages/            # SSG 기반의 라우팅 구조 (index, [slug])
components/       # Card, TagChip 등 재사용 UI 컴포넌트
lib/              # 빌드 타임 데이터 페칭 및 검증 로직
types/            # Essay 인터페이스 등 엄격한 타입 정의
public/           # 커버 이미지 및 정적 OG 리소스
🛡 Robust Implementation
안정적인 서비스를 위해 다음과 같은 개발 패턴을 준수합니다.

Build-time Defense: 콘텐츠 작성 시 slug나 coverImage가 누락되면 빌드 단계에서 에러를 발생시켜 런타임 오류를 원천 차단합니다.

Strict SEO: 한국어 환경에 최적화된 <html lang="ko"> 설정 및 접근성을 고려한 이미지 alt 태그 필수화.

URL Stability: 한글 슬러그 대신 영문 로마자 슬러그를 강제하여 깨지지 않는 공유 링크를 보장합니다.

🚀 Roadmap
Phase A (Current): MDX 기반 정적 에세이 플랫폼 구축 및 공유 경험 검증.

Phase B (Next): * Supabase를 활용한 데이터베이스 전환 및 관리자 에디터 도입.

사용자 반응 기능(댓글, 좋아요) 및 이메일 뉴스레터 캡처.

App Router 마이그레이션 및 동적 OG 이미지 생성 (@vercel/og).

👨‍💻 Developer
Park Jung-min ([@GitHub_Username])

Backend & AI Developer specializing in agent-based systems.

이 프로젝트는 취향의 깊이를 믿는 사람들을 위해 만들어졌습니다.
