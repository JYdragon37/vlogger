---
name: prd_requirements
description: PRD v7.2 핵심 요구사항과 현재 구현 상태 매핑
type: project
---

# PRD 요구사항 vs 구현 현황 (2026-03-26)

**Why:** PRD 문서(HTML 59k 토큰)를 매번 전체 파싱하지 않도록 핵심 요약
**How to apply:** 기능 추가 시 이 매핑을 기준으로 PRD 준수 여부 검토

## 구현 완료
- 온보딩 4단계 (환영 → 프로필 → 스케줄 → 완료)
- Firebase Auth (이메일/비밀번호 + Google Sign-In)
- Firestore 유저 데이터 저장/로드
- GPT-4o-mini 브이로그 스크립트 생성 (150-200단어, 핵심표현 5개)
- OpenAI Realtime API WebSocket — Emma 전화영어 (push-to-talk)
- 구독자/뱃지/스트릭 게임화 로직 (completeLesson)
- 채널 홈 화면 (에피소드 그리드, 뱃지 마일스톤)

## 구현 미완료 (PRD에 있으나 미구현)
- 플래시카드 퀴즈 (수업 루프 3단계) — UI 스텝만 표시
- 피드백 리포트 (WPM, 표현 사용 트래킹, 개선 포인트) — 플레이스홀더만
- 에피소드 자동 생성 (수업 완료 후 episode 추가 로직 미연결)
- 수업 스케줄 푸시 알림
- 설정 화면 기능 연결 (프로필 수정, 채널명 변경 등 모두 미구현)

## 핵심 게임화 수치 (store 기준)
- 기본 수업 완료: +100 구독자
- 스트릭 보너스: 3일(+1000), 7일(+2000), 15일(+3000), 30일(+5000)
- 뱃지: Bronze 10,000 / Silver 100,000 / Gold 1,000,000 구독자
- 수업 완료 조건: callSeconds >= 30초 (Emma 통화)
