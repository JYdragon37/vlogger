---
name: known_issues
description: 2026-03-26 코드 점검에서 발견된 버그, 보안 이슈, PRD 불일치 목록
type: project
---

# 발견된 이슈 (2026-03-26 점검)

**Why:** 다음 리뷰 세션에서 수정 여부를 추적하기 위해 기록
**How to apply:** 수정 확인 후 해당 항목을 "해결됨"으로 표시

## CRITICAL (보안)
1. `.env` 파일에 실제 API 키 하드코딩 + git에서 .env 제외되어 있으나, EXPO_PUBLIC_ 접두어로 인해 JS 번들에 포함됨
   - OpenAI API Key: sk-proj-Ck... (실 키 노출)
   - Firebase API Key, App ID 등 전부 노출
   - lib/openai.ts:4에 "MVP에서는 허용" 주석 있으나 프로덕션 위험

## CRITICAL (런타임)
2. `lesson.tsx:132` — startCall()에서 Audio가 null일 때 `Audio.requestPermissionsAsync()` 직접 호출 → null 역참조 크래시
   - Audio null 체크가 버튼 레벨(line 621)에만 있고 startCall 함수 내부에는 없음
3. `lesson.tsx:289` — endCall()의 finalSeconds가 클로저 stale 값일 수 있음 (callSeconds state 직접 참조)
4. `realtime.ts:61` — ws.onerror 콜백이 reject만 호출, 이미 resolve된 상태에서 에러 발생 시(세션 중) handler에게 에러 전파 안 됨

## MAJOR (로직)
5. `store/useAppStore.ts:299-301` — streak 보너스 중복 계산: newStreak=30이면 30일(5000)+15일(3000)+7일(없음)+3일(1000) 모두 발생. 30일 조건이 15일, 3일도 만족하므로 의도치 않게 중복 지급
6. `store/useAppStore.ts:292` — yesterday 계산에 86_400_000ms 사용. DST(서머타임) 전환일에 하루가 달라질 수 있음
7. `complete.tsx:93-96` — 중첩 setTimeout으로 setIsOnboarded(true) 호출. 외부 타이머(2000ms)와 내부 타이머(2000ms) 중간에 컴포넌트 언마운트 시 state 업데이트 메모리 누수 가능
8. `login.tsx:100` — handleGoogleSignIn에서 isOnboarded를 로그인 시점의 stale 값으로 라우팅. onAuthStateChanged → Firestore 로드 이전에 isOnboarded를 읽으므로 항상 false일 수 있음
9. `firestore.ts:30` — loadUserData의 타입 캐스팅 `snap.data() as FirestoreUserData`는 Firestore 스키마 변경 시 런타임 오류 위험 (필드 검증 없음)

## MINOR
10. `app/(tabs)/index.tsx:193` — 아바타 이니셜이 "JW"로 하드코딩됨. userProfile.name 기반으로 동적 생성해야 함
11. `settings.tsx:66` — 아바타 이니셜 "JW" 하드코딩 (동일 문제)
12. `realtime.ts:180-199` — pcm16DeltasToWavBase64의 문자열 루프 방식은 큰 오디오에서 느림 (btoa/atob 반복)
13. `lesson.tsx:93` — timerRef 타입이 `ReturnType<typeof setInterval>`이나 실제로는 NodeJS.Timeout vs number 혼용 가능성 (RN 환경에서는 number)

## PRD 불일치
14. Feedback 탭이 플레이스홀더만 있고 WPM, 표현 트래킹, 개선 포인트 리포트 미구현
15. 플래시카드 퀴즈 스텝(수업 루프 3단계)이 UI에 표시만 되고 실제 구현 없음
16. dummyEpisodes가 store에 정의되어 있으나 completeOnboarding에서 episodes: []로 초기화되어 실제로 사용되지 않음 (데드 코드)
17. profile.tsx의 englishLevel 선택지가 ["Beginner", "Intermediate", "Advanced"] 3개이나 store EnglishLevel 타입은 5개 ("Elementary", "Upper-Intermediate" 포함) — 불일치
