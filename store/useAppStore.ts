import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────

export type EnglishLevel =
  | "Beginner"
  | "Elementary"
  | "Intermediate"
  | "Upper-Intermediate"
  | "Advanced";

export interface UserProfile {
  name: string;
  channelHandle: string;
  job: string;
  location: string;
  hobbies: string[];
  englishLevel: EnglishLevel;
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
}

export interface ChannelInfo {
  channelName: string;
  subscriberCount: number;
  episodes: Episode[];
  badge: "none" | "bronze" | "silver" | "gold";
  streakDays: number;
  totalTalkTimeMinutes: number;
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
  addSubscribers: (count: number) => void;

  // Lesson Schedule
  lessonSchedule: LessonSchedule;
  setLessonSchedule: (schedule: Partial<LessonSchedule>) => void;

  // App State
  isPremium: boolean;
  setIsPremium: (premium: boolean) => void;
  isOnboarded: boolean;
  setIsOnboarded: (onboarded: boolean) => void;
}

// ─── Default Values ──────────────────────────────────────

const defaultUserProfile: UserProfile = {
  name: "박지원",
  channelHandle: "@jw_english",
  job: "마케터",
  location: "서울 강남",
  hobbies: ["카페 투어", "헬스", "넷플릭스"],
  englishLevel: "Intermediate",
};

const defaultChannelInfo: ChannelInfo = {
  channelName: "JW's Seoul Vlog",
  subscriberCount: 0,
  episodes: [],
  badge: "none",
  streakDays: 0,
  totalTalkTimeMinutes: 0,
};

const defaultLessonSchedule: LessonSchedule = {
  days: ["Mon", "Wed", "Fri"],
  timeSlots: ["07:00", "12:30", "20:00"],
};

// ─── Store ───────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
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

  // Lesson Schedule
  lessonSchedule: defaultLessonSchedule,
  setLessonSchedule: (schedule) =>
    set((state) => ({
      lessonSchedule: { ...state.lessonSchedule, ...schedule },
    })),

  // App State
  isPremium: false,
  setIsPremium: (premium) => set({ isPremium: premium }),
  isOnboarded: true, // default true for now (placeholder)
  setIsOnboarded: (onboarded) => set({ isOnboarded: onboarded }),
}));
