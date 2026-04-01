---
name: project_architecture
description: Vlogger 앱의 파일 구조, 기술 스택, 주요 모듈 역할
type: project
---

# Vlogger 프로젝트 아키텍처

**Why:** 리뷰 세션마다 파일 구조를 재탐색하지 않도록 기록
**How to apply:** 새 파일 추가 여부 확인 후 이 문서를 업데이트

## 기술 스택
- Expo SDK 55 + React Native 0.83 + TypeScript
- Expo Router v3 (파일 기반 라우팅)
- Zustand v5 + AsyncStorage (상태 관리 + 로컬 퍼시스트)
- Firebase Auth + Firestore
- OpenAI GPT-4o-mini (스크립트 생성) + Realtime API WebSocket (Emma 전화영어)

## 핵심 파일 위치
- `lib/firebase.ts` — Firebase 앱 초기화, Auth 인스턴스
- `lib/firestore.ts` — Firestore CRUD (saveUserData, loadUserData)
- `lib/openai.ts` — GPT-4o-mini REST API 스크립트 생성
- `lib/realtime.ts` — OpenAI Realtime API WebSocket (EmmaSession 클래스), WAV 변환 유틸
- `store/useAppStore.ts` — Zustand 글로벌 스토어 (UserProfile, ChannelInfo, LessonSchedule)
- `app/_layout.tsx` — 루트 레이아웃, Firebase Auth 상태 감지 + Firestore 로드
- `app/index.tsx` — 진입점 라우팅 (로그인 → 온보딩 → 메인탭)
- `app/login.tsx` — 이메일/비밀번호 + Google Sign-In
- `app/onboarding/` — 4단계 온보딩 (index, profile, schedule, complete)
- `app/(tabs)/index.tsx` — 채널 홈 (구독자, 에피소드 그리드)
- `app/(tabs)/lesson.tsx` — 수업 탭 (스크립트 생성 + Emma 통화 모달)
- `app/(tabs)/feedback.tsx` — 피드백 탭 (미구현 플레이스홀더)
- `app/(tabs)/settings.tsx` — 설정 탭 (로그아웃, 프로필 표시)

## 환경변수 (.env)
- EXPO_PUBLIC_FIREBASE_* (6개)
- EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, IOS_CLIENT_ID, EXPO_CLIENT_ID
- EXPO_PUBLIC_OPENAI_API_KEY
