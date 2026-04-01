---
name: Vlogger 앱 아키텍처
description: 앱 구조, 핵심 파일 위치, 상태 관리 패턴, 인증 플로우 요약
type: project
---

# Vlogger 앱 아키텍처

**Why:** 다음 대화에서 빠르게 컨텍스트를 복원하기 위해 기록.
**How to apply:** 파일 위치 확인, 플로우 추적, 기존 패턴 준수 시 참고.

## 스택
- Expo Router (파일 기반 라우팅) + React Native (iOS 우선)
- Firebase Auth + Firestore
- OpenAI GPT-4o (스크립트 생성, 피드백), OpenAI Realtime API WebSocket (Emma 전화영어)
- Zustand + AsyncStorage persist (상태 관리)
- NativeWind (Tailwind 기반 스타일, 일부 StyleSheet 혼용)

## 핵심 파일
- `app/_layout.tsx` — 루트 레이아웃, Firebase onAuthStateChanged, Firestore 로드
- `app/index.tsx` — 스플래시 + 라우팅 게이트 (hasHydrated && isAuthLoaded && minTimePassed)
- `app/login.tsx` — 이메일/Google 로그인
- `app/onboarding/` — 4단계: index → profile → schedule → complete
- `app/(tabs)/_layout.tsx` — 탭 레이아웃 (채널홈, 수업, 복습, 피드백, 설정)
- `app/(tabs)/lesson.tsx` — 수업 탭 핵심 (스크립트 생성, 플립카드, 플래시카드, Emma 모달)
- `app/(tabs)/review.tsx` — 복습 탭 (플립카드, 셔플)
- `app/(tabs)/feedback.tsx` — 피드백 탭 (에피소드 리포트 목록, 상세 모달)
- `app/(tabs)/index.tsx` — 채널홈 (구독자 애니메이션, 에피소드 그리드, 배지 마일스톤)
- `app/(tabs)/settings.tsx` — 설정 (프로필, 수업, 구독, 로그아웃, 탈퇴)
- `store/useAppStore.ts` — 전체 상태 (UserProfile, ChannelInfo, Episode, LessonSchedule 등)
- `lib/openai.ts` — generateVlogScript(), generateLessonFeedback()
- `lib/realtime.ts` — EmmaSession (WebSocket), buildEmmaPrompt(), PCM16 변환 유틸
- `lib/firestore.ts` — saveUserData(), loadUserData(), deleteUserData()

## 인증 플로우
1. onAuthStateChanged → setUser → setAuthLoaded(true)
2. user 있으면 loadUserData(uid) 호출 (백그라운드, 캐시 우선)
3. index.tsx: hasHydrated && isAuthLoaded && minTimePassed(1.8s) 조건 충족 후 라우팅
4. user 없으면 /login, isOnboarded 아니면 /onboarding, 둘 다 있으면 /(tabs)

## 수업 플로우
fetchScript() → ScriptResult(topic, culturalNote, script, expressions 5개) → LessonContent 렌더
→ CulturalNoteCard → ScriptText → ExpressionFlipCard ×5 → FlashcardQuiz → Emma 전화
→ EmmaCallModal(WebSocket PTT) → onEnd → addEpisode → generateLessonFeedback(bg) → completeLesson() → LessonRewardModal → 피드백 탭 이동

## 주요 타입
- `Episode` — id, title, expressions[], scenes?, feedback?
- `ExpressionItem` — phrase, meaning, nuance, example?
- `Character` — name, relationship, job?
- `LessonFeedback` — summary, corrections[], expressionTracking[], vocabularyTips[], patternTips[]
