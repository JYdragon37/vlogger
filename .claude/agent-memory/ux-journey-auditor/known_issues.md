---
name: Vlogger 알려진 이슈 목록
description: UX 감사 후 발견된 이슈 및 수정 현황 (2026-04-01)
type: project
---

# 알려진 이슈 목록 (2026-04-01 감사 기준)

**Why:** 다음 대화에서 중복 발견/수정을 피하고 미해결 이슈를 추적하기 위해.
**How to apply:** 새 기능 추가 또는 관련 파일 수정 시 이슈 목록 참고.

## 수정 완료 [x]

[x] P0 — onEnd(0) 단독 호출 → onEnd(0, [])로 수정
    파일: app/(tabs)/lesson.tsx L153, L222

[x] P0 — FlashcardQuiz blanked.clean 빈 문자열 시 빈 입력 정답 처리 → 스킵으로 수정
    파일: app/(tabs)/lesson.tsx handleSubmit

[x] P1 — 온보딩 profile "기타" 직업 canNext 조건 → customJob 필수 검증 추가
    파일: app/onboarding/profile.tsx

[x] P1 — 수업 탭 fetchScript 중복 호출 방지 → isFetchingRef + finally 블록
    파일: app/(tabs)/lesson.tsx

[x] P1 — 피드백 탭 자동 재오픈 버그 → autoOpenedEpisodeIdRef 추가, deps 격리
    파일: app/(tabs)/feedback.tsx

[x] P1 — 채널홈 "..." 메뉴 버튼 onPress 없음 → Alert "곧 출시" 추가
    파일: app/(tabs)/index.tsx

[x] P1 — 설정 탭 미구현 8개 항목 onPress 없음 → showComingSoon() 공통 핸들러 추가
    파일: app/(tabs)/settings.tsx

[x] P2 — totalTalkTimeMinutes 수업 후 업데이트 안 됨 → 통화 시간 누적 추가
    파일: app/(tabs)/lesson.tsx

[x] P2 — 피드백 모달 corrections 빈 배열 시 빈 섹션 노출 → 조건부 렌더
    파일: app/(tabs)/feedback.tsx

[x] P3 — 로그인 Google 힌트 항상 노출 → __DEV__ 조건 추가
    파일: app/login.tsx

[x] P2 — BoldText 볼드 색상 불안정 → boldHighlightStyle 분리
    파일: app/(tabs)/lesson.tsx

## 미해결 이슈 [ ]

[ ] P1 — 로그아웃 후 재로그인 시 isOnboarded 타이밍 이슈
    원인: resetStore()에서 isOnboarded=false → Firestore 로드 전 /onboarding 리다이렉트 가능
    현황: 의도적 설계(캐시 우선 라우팅), AsyncStorage에 isOnboarded가 persist되므로
          실제 발생 빈도 낮음. 근본 해결은 Firestore 로드 완료까지 라우팅 대기 필요.

[ ] P2 — 복습 탭 카드 단위 네비게이션 없음 (스크롤 목록 형태)
    현황: Medium 우선순위, 향후 "한 장씩 보기 모드" 추가 필요

[ ] P2 — EmmaCallModal 앱 백그라운드 시 WebSocket/녹음 상태 불명확
    현황: AppState 리스너 미구현, Medium 우선순위

[ ] P3 — 온보딩 schedule 시간 슬롯 중복 선택 방지 없음
