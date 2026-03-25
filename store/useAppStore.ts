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
  seriesTotal: number | null;
  durationMinutes: number;
  emoji: string;
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

  // Onboarding
  completeOnboarding: (profile: UserProfile, channelName: string, schedule: LessonSchedule) => void;
}

// ─── Dummy Episodes (PRD Day 1~15 시뮬레이션) ─────────

const dummyEpisodes: Episode[] = [
  {
    id: "ep-15",
    title: "Gangnam Brunch Date",
    thumbnailUrl: null,
    date: "2026-04-08",
    expressionsUsed: 5,
    expressionsTotal: 5,
    wpm: 42,
    seriesName: "Travel Series",
    seriesOrder: 1,
    seriesTotal: 3,
    durationMinutes: 15,
    emoji: "🍳",
  },
  {
    id: "ep-14",
    title: "New Gym Routine",
    thumbnailUrl: null,
    date: "2026-04-07",
    expressionsUsed: 4,
    expressionsTotal: 5,
    wpm: 40,
    seriesName: null,
    seriesOrder: null,
    seriesTotal: null,
    durationMinutes: 15,
    emoji: "💪",
  },
  {
    id: "ep-13",
    title: "Shopping Mall Haul 3/3",
    thumbnailUrl: null,
    date: "2026-04-04",
    expressionsUsed: 5,
    expressionsTotal: 5,
    wpm: 41,
    seriesName: "Shopping Mall",
    seriesOrder: 3,
    seriesTotal: 3,
    durationMinutes: 15,
    emoji: "🛍️",
  },
  {
    id: "ep-12",
    title: "Shopping Mall Haul 2/3",
    thumbnailUrl: null,
    date: "2026-04-02",
    expressionsUsed: 4,
    expressionsTotal: 5,
    wpm: 39,
    seriesName: "Shopping Mall",
    seriesOrder: 2,
    seriesTotal: 3,
    durationMinutes: 15,
    emoji: "🛒",
  },
  {
    id: "ep-11",
    title: "Shopping Mall Haul 1/3",
    thumbnailUrl: null,
    date: "2026-03-31",
    expressionsUsed: 3,
    expressionsTotal: 5,
    wpm: 38,
    seriesName: "Shopping Mall",
    seriesOrder: 1,
    seriesTotal: 3,
    durationMinutes: 10,
    emoji: "🏬",
  },
  {
    id: "ep-10",
    title: "Friday Night Out",
    thumbnailUrl: null,
    date: "2026-03-28",
    expressionsUsed: 4,
    expressionsTotal: 5,
    wpm: 37,
    seriesName: null,
    seriesOrder: null,
    seriesTotal: null,
    durationMinutes: 15,
    emoji: "🌙",
  },
  {
    id: "ep-09",
    title: "Midweek Coffee Run",
    thumbnailUrl: null,
    date: "2026-03-27",
    expressionsUsed: 5,
    expressionsTotal: 5,
    wpm: 36,
    seriesName: null,
    seriesOrder: null,
    seriesTotal: null,
    durationMinutes: 10,
    emoji: "☕",
  },
  {
    id: "ep-08",
    title: "Monday Morning Routine",
    thumbnailUrl: null,
    date: "2026-03-25",
    expressionsUsed: 4,
    expressionsTotal: 5,
    wpm: 31,
    seriesName: null,
    seriesOrder: null,
    seriesTotal: null,
    durationMinutes: 10,
    emoji: "☀️",
  },
];

// ─── Default Values ──────────────────────────────────────

const defaultUserProfile: UserProfile = {
  name: "",
  channelHandle: "",
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
      },
      lessonSchedule: schedule,
      isOnboarded: true,
    }),
}));
