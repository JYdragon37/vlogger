# Vlogger App — Handoff Document
> Last updated: 2026-03-25 | Commit: latest on `main`

---

## 1. Project Overview

**Vlogger** is a Korean English-learning iOS app where users run a virtual YouTube channel.
They complete daily AI phone-call lessons with tutor "Emma," which generates episodes
and grows their subscriber count — gamifying the language-learning experience.

- **Target**: Korean adults learning English
- **Monetization**: Subscription (₩14,900/mo) + in-app items + ads

---

## 2. Tech Stack (Confirmed)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native + Expo | SDK 55 (expo ~55.0.8) |
| Language | TypeScript | ~5.9.2 (strict mode) |
| Navigation | Expo Router | ~55.0.7 |
| State | Zustand | ^5.0.12 |
| Styling | NativeWind v4 + Tailwind | ^4.0 / ^3.4.19 |
| Animation | react-native-reanimated | 4.2.1 |
| Animation | lottie-react-native | ~7.3.4 |
| Icons | @expo/vector-icons (Ionicons) | ^15.1.1 |
| Runtime | react-native-worklets | ^0.8.1 |

### Not Yet Installed (needed for later phases)
- Firebase Auth / Firestore / Cloud Functions
- OpenAI gpt-4o-mini (WebSocket realtime + REST)
- expo-audio
- RevenueCat + StoreKit 2
- Google AdMob
- expo-notifications
- Gluestack UI v2 (init command not yet run)

---

## 3. File Structure

```
vlogger/
├── app/
│   ├── _layout.tsx              # Root Stack (StatusBar light, bg #0F0F0F)
│   ├── index.tsx                # Router guard: isOnboarded → tabs / onboarding
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Bottom tab bar (4 tabs, red accent)
│   │   ├── index.tsx            # Channel Home (YouTube-style, 360 lines)
│   │   ├── lesson.tsx           # Lesson placeholder (schedule display)
│   │   ├── feedback.tsx         # Feedback placeholder (empty state)
│   │   └── settings.tsx         # Settings placeholder (profile/channel rows)
│   └── onboarding/
│       ├── _layout.tsx          # Onboarding Stack (slide_from_right)
│       ├── index.tsx            # Step 1: Welcome screen
│       ├── profile.tsx          # Step 2: Profile input (name/job/level...)
│       ├── schedule.tsx         # Step 3: Lesson schedule (days + time slots)
│       └── complete.tsx         # Step 4: Channel creation (2s loading → done)
├── store/
│   └── useAppStore.ts           # Zustand store (287 lines)
├── babel.config.js              # babel-preset-expo + nativewind/babel
├── metro.config.js              # withNativeWind wrapper
├── tailwind.config.js           # NativeWind preset + vlogger color palette
├── global.css                   # @tailwind base/components/utilities
├── nativewind-env.d.ts          # TypeScript ref for NativeWind
├── index.ts                     # Entry point (expo-router/entry)
├── app.json                     # Expo config
├── tsconfig.json                # strict: true, extends expo/tsconfig.base
└── package.json                 # All deps listed
```

**Total source lines**: ~2,018 (excluding config/lock files)

---

## 4. Zustand Store Structure (`store/useAppStore.ts`)

```typescript
// ─── Types ─────────────────────────────────────
EnglishLevel = "Beginner" | "Elementary" | "Intermediate" | "Upper-Intermediate" | "Advanced"

UserProfile {
  name: string                  // e.g. "박지원"
  channelHandle: string         // e.g. "@jw_english"
  job: string                   // e.g. "마케터"
  location: string              // e.g. "서울 강남"
  hobbies: string[]             // e.g. ["카페 투어", "헬스"]
  englishLevel: EnglishLevel
}

Episode {
  id, title, thumbnailUrl, date,
  expressionsUsed, expressionsTotal, wpm,
  seriesName, seriesOrder, seriesTotal,
  durationMinutes, emoji
}

ChannelInfo {
  channelName: string           // e.g. "JW's Seoul Vlog"
  subscriberCount: number       // Badge auto-upgrades at 10k/100k/1M
  episodes: Episode[]
  badge: "none" | "bronze" | "silver" | "gold"
  streakDays: number
  totalTalkTimeMinutes: number
}

LessonSchedule {
  days: string[]                // e.g. ["Mon", "Wed", "Fri"]
  timeSlots: string[]           // e.g. ["07:00", "12:00", "19:00"]
}

// ─── State & Actions ───────────────────────────
AppState {
  userProfile          → setUserProfile(partial)
  channelInfo          → setChannelInfo(partial)
                       → addEpisode(episode)
                       → addSubscribers(count)   // auto badge upgrade
  lessonSchedule       → setLessonSchedule(partial)
  isPremium: boolean   → setIsPremium(bool)
  isOnboarded: boolean → setIsOnboarded(bool)
  completeOnboarding(profile, channelName, schedule) → sets all + isOnboarded=true
}
```

### Default State (new user)
- `isOnboarded: false` — triggers onboarding flow
- All profile fields empty, subscriber count 0, no episodes, badge "none"
- After onboarding: `isOnboarded: true`, profile filled, channel created

### Dummy Data (for Channel Home demo)
- 8 episodes (ep-08 ~ ep-15) with titles, dates, WPM, series info
- 12,400 subscribers, bronze badge, 15-day streak, 165 min talk time
- **Note**: These are loaded only in the Channel Home screen's demo view;
  the store defaults are clean (0 subscribers, no episodes)

---

## 5. Styling Architecture

### CRITICAL: NativeWind className does NOT work on iOS Simulator
- **Root cause**: NativeWind v4 requires a Development Build (not Expo Go)
- **Decision**: ALL screens converted to `StyleSheet.create` inline styles
- `babel.config.js` exists with NativeWind preset (for future Development Build)
- `metro.config.js` has `withNativeWind` wrapper (ready for when it works)
- `tailwind.config.js` defines the color palette (usable in future)

### Color Palette (PRD-defined)
```
bg:         #0F0F0F   (main background)
card:       #1A1A1A   (card/surface)
red:        #FF0000   (accent, buttons, active states)
white:      #FFFFFF   (primary text)
gray1:      #AAAAAA   (secondary text)
gray2:      #888888   (tertiary text)
gray4:      #555555   (disabled/hint text)
gold:       #FFD700   (gold badge)
silver:     #C0C0C0   (silver badge)
bronze:     #CD7F32   (bronze badge)
```

---

## 6. Navigation Flow

```
app/index.tsx (Router Guard)
  │
  ├── isOnboarded === false
  │   └── /onboarding/
  │       ├── index.tsx     (1/4 Welcome)
  │       ├── profile.tsx   (2/4 Profile Input)
  │       ├── schedule.tsx  (3/4 Schedule)
  │       └── complete.tsx  (4/4 Loading → Done → redirect)
  │
  └── isOnboarded === true
      └── /(tabs)/
          ├── index.tsx     (Channel Home)
          ├── lesson.tsx    (Lessons)
          ├── feedback.tsx  (Feedback)
          └── settings.tsx  (Settings)
```

---

## 7. Git History

```
4284008 feat: 온보딩 플로우 전체 구현 — 4단계 채널 개설 흐름
d99244e fix: NativeWind className 미적용 문제 해결 — StyleSheet.create 전면 전환
0161ca0 feat: 채널홈 유튜브 채널 컨셉 리디자인
7da6573 feat: Vlogger 앱 뼈대 구축 — Expo Router 탭 네비게이션 + NativeWind v4 + Zustand
9a272e1 init: Expo SDK 54 + TypeScript 기본 세팅
926dae5 Initial commit
```

---

## 8. Known Issues & Gotchas

| # | Issue | Detail |
|---|-------|--------|
| 1 | **NativeWind on Expo Go** | className styles won't render. Must use `npx expo run:ios` (Development Build) or keep StyleSheet.create |
| 2 | **Expo SDK version mismatch** | Project created with SDK 55 template (blank-typescript latest), but PRD says SDK 54. Functionally identical. |
| 3 | **Gluestack UI v2** | Listed in requirements but `npx gluestack-ui init` has NOT been run yet. |
| 4 | **No persistent storage** | Zustand store is in-memory only. Closing app resets onboarding. Add `zustand/middleware` persist with AsyncStorage. |
| 5 | **EnglishLevel mismatch** | Store defines 5 levels (Beginner~Advanced) but onboarding UI only shows 3 buttons (Beginner/Intermediate/Advanced). Reconcile if needed. |
| 6 | **Channel Home dummy data** | Hardcoded in index.tsx for demo. Real data should come from store after lessons are completed. |

---

## 9. Next Steps (Priority Order)

### Phase 2: Core Features
1. **Firebase Auth** — Google/Kakao/Naver/Email sign-in
2. **Firestore integration** — persist user profile, episodes, subscriber count
3. **Zustand persist middleware** — AsyncStorage for offline state
4. **Gluestack UI v2 init** — run setup, integrate design tokens

### Phase 3: Lesson Flow
5. **Script generation** — OpenAI gpt-4o-mini REST for personalized scripts
6. **Script card UI** — 5 swipeable cards (lesson tab)
7. **Quiz screen** — 5 MCQ + fire animation on 100%
8. **AI Call UI** — incoming call lock-screen view + active call with timer

### Phase 4: Gamification
9. **Subscriber animation** — count-up after lesson completion
10. **Badge unlock** — bronze/silver/gold animations
11. **Streak tracking** — calendar + streak bonus logic
12. **Feedback report** — WPM, expression tracking, improvement points

### Phase 5: Monetization
13. **RevenueCat** — subscription paywall (₩14,900/mo)
14. **In-app items** — attendance shield, ad removal, topic change
15. **Google AdMob** — interstitial ads for free tier

---

## 10. Commands Reference

```bash
# Development
npx expo start -c                    # Start Metro (clear cache)
npx expo start -c --ios              # iOS simulator
npx expo run:ios                     # Development Build (required for NativeWind)

# Type checking
npx tsc --noEmit

# Web export (for preview)
npx expo export --platform web
npx serve dist -l 3000

# Install new packages
npx expo install <package-name>      # Use this for Expo-compatible versions
```
