import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "firebase/auth";
import { DEMO_CHANNEL_INFO, DEMO_USER_PROFILE, DEMO_LESSON_SCHEDULE } from "@/lib/demoData";
// ─── Types ───────────────────────────────────────────────

export type EnglishLevel = "Beginner" | "Intermediate" | "Advanced";
export type Gender = "male" | "female" | "prefer_not_to_say";

export interface Character {
  name: string;         // 영어 이름 권장 (예: Mike, Sarah)
  relationship: string; // 관계 (예: 직장 동료, 룸메이트, 친구)
  job?: string;         // 직업 (선택)
}

export interface UserProfile {
  name: string;
  channelHandle: string;
  gender: Gender;
  job: string;
  location: string;
  hobbies: string[];
  englishLevel: EnglishLevel;
  avatarIconName?: string; // Ionicons 아이콘명 — 설정 시 이니셜 대신 아이콘 표시
  characters?: Character[]; // 등장인물 (최대 5명, 스크립트에 자연스럽게 배치)
}

export interface ExpressionItem {
  phrase: string;  // 영어 표현/문장
  meaning: string; // 한국어 뜻
  nuance: string;  // 뉘앙스 설명 (한국어, 1~2문장)
}

export interface Scene {
  name: string;                    // e.g. "The Office Lobby (사원증을 목에 걸며)"
  script: string;                  // 280~330자 내외
  expressions?: ExpressionItem[];  // 이 씬의 학습 표현 5개
}

export interface LessonFeedback {
  summary: string;           // 총평 (2~3문장)
  corrections: string[];     // 에러 교정/개선 포인트 5가지
  expressionTracking: {      // 표현 사용 트래킹
    phrase: string;
    used: boolean;
    note: string;            // e.g. "1회 자연스럽게 사용", "미사용"
  }[];
  vocabularyTips: string[];  // 어휘 제안 (2~3개)
  patternTips: string[];     // 패턴/문법 제안 (2~3개)
}

export interface Episode {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  date: string;
  expressionsUsed: number;
  expressionsTotal: number;
  wpm: number;
  seriesName: string | null;
  seriesOrder: number | null;
  seriesTotal: number | null;
  durationMinutes: number;
  emoji: string;
  expressions?: ExpressionItem[];
  scenes?: Scene[];
  script?: string;       // legacy — scenes가 있으면 scenes 우선
  hitAchieved?: boolean; // 스크립트 낭독 HIT 달성 여부
  feedback?: LessonFeedback; // AI 생성 피드백 리포트
}

export interface ChannelInfo {
  channelName: string;
  subscriberCount: number;
  episodes: Episode[];
  badge: "none" | "bronze" | "silver" | "gold";
  streakDays: number;
  totalTalkTimeMinutes: number;
  lastLessonDate: string; // "YYYY-MM-DD", empty string if never
  subscriberHistory?: number[]; // 최근 7일 구독자수 (오래된 순)
}

export interface LessonReward {
  base: number;
  bonusItems: { reason: string; amount: number }[];
  totalGained: number;
  newStreakDays: number;
  newSubscriberCount: number;
  unlockedBadge: ChannelInfo["badge"] | null;
}

export interface LessonSchedule {
  days: string[]; // e.g. ["Mon", "Wed", "Fri"]
  timeSlots: string[]; // e.g. ["07:00", "12:30", "20:00"]
}

// ─── Store Interface ─────────────────────────────────────

interface AppState {
  // User Profile
  userProfile: UserProfile;
  setUserProfile: (profile: Partial<UserProfile>) => void;

  // Channel Info
  channelInfo: ChannelInfo;
  setChannelInfo: (info: Partial<ChannelInfo>) => void;
  addEpisode: (episode: Episode) => void;
  removeEpisode: (id: string) => void;
  updateEpisode: (id: string, patch: Partial<Episode>) => void;
  addSubscribers: (count: number) => void;
  completeLesson: () => LessonReward | null;

  // Lesson Schedule
  lessonSchedule: LessonSchedule;
  setLessonSchedule: (schedule: Partial<LessonSchedule>) => void;

  // App State
  isPremium: boolean;
  setIsPremium: (premium: boolean) => void;
  isOnboarded: boolean;
  setIsOnboarded: (onboarded: boolean) => void;

  // Onboarding
  completeOnboarding: (profile: UserProfile, channelName: string, schedule: LessonSchedule) => void;

  // Demo
  loadDemoAccount: () => void;

  // Episode
  markEpisodeHit: (id: string) => void;

  // Auth
  user: User | null;
  isAuthLoaded: boolean;
  setUser: (user: User | null) => void;
  setAuthLoaded: (loaded: boolean) => void;

  // Reset
  resetStore: () => void;

  // Hydration
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

// ─── Default Values ──────────────────────────────────────

const defaultUserProfile: UserProfile = {
  name: "",
  channelHandle: "",
  gender: "prefer_not_to_say",
  job: "",
  location: "",
  hobbies: [],
  englishLevel: "Intermediate",
};

const defaultChannelInfo: ChannelInfo = {
  channelName: "",
  subscriberCount: 0,
  episodes: [],
  badge: "none",
  streakDays: 0,
  totalTalkTimeMinutes: 0,
  lastLessonDate: "",
};

const defaultLessonSchedule: LessonSchedule = {
  days: ["Mon", "Wed", "Fri"],
  timeSlots: ["07:00", "12:30", "20:00"],
};

// ─── Store ───────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User Profile
      userProfile: defaultUserProfile,
      setUserProfile: (profile) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
        })),

      // Channel Info
      channelInfo: defaultChannelInfo,
      setChannelInfo: (info) =>
        set((state) => ({
          channelInfo: { ...state.channelInfo, ...info },
        })),
      addEpisode: (episode) =>
        set((state) => ({
          channelInfo: {
            ...state.channelInfo,
            episodes: [episode, ...state.channelInfo.episodes],
          },
        })),
      removeEpisode: (id) =>
        set((state) => ({
          channelInfo: {
            ...state.channelInfo,
            episodes: state.channelInfo.episodes.filter((e) => e.id !== id),
          },
        })),
      updateEpisode: (id, patch) =>
        set((state) => ({
          channelInfo: {
            ...state.channelInfo,
            episodes: state.channelInfo.episodes.map((e) =>
              e.id === id ? { ...e, ...patch } : e
            ),
          },
        })),
      addSubscribers: (count) =>
        set((state) => {
          const newCount = state.channelInfo.subscriberCount + count;
          let badge = state.channelInfo.badge;
          if (newCount >= 1_000_000) badge = "gold";
          else if (newCount >= 100_000) badge = "silver";
          else if (newCount >= 10_000) badge = "bronze";

          return {
            channelInfo: {
              ...state.channelInfo,
              subscriberCount: newCount,
              badge,
            },
          };
        }),

      completeLesson: () => {
        const { channelInfo } = get();
        const today = new Date().toISOString().slice(0, 10);

        // 연속 출석: 오늘 첫 수업이면 streak 갱신
        const isFirstToday = channelInfo.lastLessonDate !== today;
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        const newStreak = !isFirstToday
          ? channelInfo.streakDays  // 오늘 이미 수업함 — streak 유지
          : channelInfo.lastLessonDate === yesterday
            ? channelInfo.streakDays + 1
            : 1;

        const base = 100;
        const bonusItems: { reason: string; amount: number }[] = [];
        if (newStreak % 30 === 0) bonusItems.push({ reason: `${newStreak}일 연속`, amount: 5000 });
        else if (newStreak % 15 === 0) bonusItems.push({ reason: "15일 연속", amount: 3000 });
        else if (newStreak % 7 === 0) bonusItems.push({ reason: "7일 연속", amount: 2000 });
        else if (newStreak % 3 === 0) bonusItems.push({ reason: "3일 연속", amount: 1000 });

        const bonus = bonusItems.reduce((sum, item) => sum + item.amount, 0);
        const totalGained = base + bonus;
        const newSubscriberCount = channelInfo.subscriberCount + totalGained;

        let newBadge = channelInfo.badge;
        let unlockedBadge: ChannelInfo["badge"] | null = null;
        if (newSubscriberCount >= 1_000_000 && channelInfo.badge !== "gold") {
          newBadge = "gold"; unlockedBadge = "gold";
        } else if (newSubscriberCount >= 100_000 && channelInfo.badge !== "silver" && channelInfo.badge !== "gold") {
          newBadge = "silver"; unlockedBadge = "silver";
        } else if (newSubscriberCount >= 10_000 && channelInfo.badge === "none") {
          newBadge = "bronze"; unlockedBadge = "bronze";
        }

        set((state) => ({
          channelInfo: {
            ...state.channelInfo,
            subscriberCount: newSubscriberCount,
            streakDays: newStreak,
            badge: newBadge,
            lastLessonDate: today,
          },
        }));

        return { base, bonusItems, totalGained, newStreakDays: newStreak, newSubscriberCount, unlockedBadge };
      },

      // Lesson Schedule
      lessonSchedule: defaultLessonSchedule,
      setLessonSchedule: (schedule) =>
        set((state) => ({
          lessonSchedule: { ...state.lessonSchedule, ...schedule },
        })),

      // App State
      isPremium: false,
      setIsPremium: (premium) => set({ isPremium: premium }),
      isOnboarded: false,
      setIsOnboarded: (onboarded) => set({ isOnboarded: onboarded }),

      // Onboarding
      completeOnboarding: (profile, channelName, schedule) =>
        set({
          userProfile: profile,
          channelInfo: {
            channelName,
            subscriberCount: 0,
            episodes: [],
            badge: "none",
            streakDays: 0,
            totalTalkTimeMinutes: 0,
            lastLessonDate: "",
          },
          lessonSchedule: schedule,
          isOnboarded: true,
        }),

      // Demo
      loadDemoAccount: () =>
        set({
          userProfile: DEMO_USER_PROFILE,
          channelInfo: DEMO_CHANNEL_INFO,
          lessonSchedule: DEMO_LESSON_SCHEDULE,
          isOnboarded: true,
        }),

      // Episode
      markEpisodeHit: (id) =>
        set((state) => ({
          channelInfo: {
            ...state.channelInfo,
            episodes: state.channelInfo.episodes.map((ep) =>
              ep.id === id ? { ...ep, hitAchieved: true } : ep
            ),
          },
        })),

      // Auth
      user: null,
      isAuthLoaded: false,
      setUser: (user) => set({ user }),
      setAuthLoaded: (loaded) => set({ isAuthLoaded: loaded }),

      // Reset (로그아웃/탈퇴 시 초기화)
      resetStore: () =>
        set({
          userProfile: defaultUserProfile,
          channelInfo: defaultChannelInfo,
          lessonSchedule: defaultLessonSchedule,
          isOnboarded: false,
          isPremium: false,
        }),

      // Hydration
      _hasHydrated: false,
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "vlogger-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
        userProfile: state.userProfile,
        channelInfo: state.channelInfo,
        lessonSchedule: state.lessonSchedule,
        isPremium: state.isPremium,
      }),
    }
  )
);
