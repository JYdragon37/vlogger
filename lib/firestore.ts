import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import app from "./firebase";
import type { UserProfile, ChannelInfo, LessonSchedule } from "@/store/useAppStore";

export const db = getFirestore(app);

export interface FirestoreUserData {
  profile: UserProfile;
  channelMeta: {
    channelName: string;
    subscriberCount: number;
    badge: ChannelInfo["badge"];
    streakDays: number;
    totalTalkTimeMinutes: number;
  };
  lessonSchedule: LessonSchedule;
  isOnboarded: boolean;
}

export async function saveUserData(uid: string, data: FirestoreUserData): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function loadUserData(uid: string): Promise<FirestoreUserData | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as FirestoreUserData) : null;
}
