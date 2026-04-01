---
name: review_patterns
description: 이 코드베이스에서 반복 발견되는 패턴 및 리뷰 시 주의 영역
type: project
---

# 반복 패턴 및 주의 영역

**Why:** 차후 리뷰 세션에서 같은 패턴을 빠르게 발견하기 위해
**How to apply:** 리뷰 시작 시 이 패턴들을 우선 확인

## 취약 영역
1. **lesson.tsx** — 가장 복잡한 파일 (500+ 라인). Audio/FileSystem lazy require, WebSocket, 타이머, 녹음, 사운드 재생이 혼재. 메모리 누수 위험 높음
2. **store/useAppStore.ts** — completeLesson 비즈니스 로직. 날짜 계산, 스트릭, 뱃지 업그레이드 로직에 엣지 케이스 존재
3. **app/_layout.tsx** — onAuthStateChanged 콜백에서 Firestore 로드. 인증 상태 전환 타이밍 버그 발생 가능

## 코딩 패턴
- 색상 상수를 `const C = {}` 로 각 파일마다 로컬 정의 (글로벌 테마 없음)
- expo-av/expo-file-system은 lazy require로 크래시 방지 (네이티브 모듈 없는 빌드 대응)
- `useAppStore.setState()` 직접 호출이 profile.tsx에서 사용됨 — 캡슐화 우회 패턴
- EXPO_PUBLIC_ 환경변수가 JS 번들에 포함되어 보안상 민감한 키는 번들 포함 위험

## 하드코딩 값 (수정 필요)
- `app/(tabs)/index.tsx:193` 아바타 이니셜 "JW"
- `settings.tsx:66` 아바타 이니셜 "JW"
- `settings.tsx:85-87` 스케줄 표시값 "월·수·금", "07:00" (store 값 미반영)
