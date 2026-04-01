import { initializeFirestore, getFirestore, doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import app from "./firebase";
import type { UserProfile, ChannelInfo, LessonSchedule, Episode } from "@/store/useAppStore";

// iOS 시뮬레이터 등에서 gRPC/WebSocket 연결 실패 시 HTTP long-polling으로 자동 폴백
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  // 이미 초기화된 경우 (Fast Refresh 등) 기존 인스턴스 사용
  db = getFirestore(app);
}
export { db };

export interface FirestoreUserData {
  profile: UserProfile;
  channelMeta: {
    channelName: string;
    subscriberCount: number;
    badge: ChannelInfo["badge"];
    streakDays: number;
    totalTalkTimeMinutes: number;
  };
  episodes?: Episode[];
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

export async function deleteUserData(uid: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid));
}

export async function loadUserData(uid: string): Promise<FirestoreUserData | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null; // 신규 유저 — 정상
    const data = snap.data();
    // 필수 필드 검증 — 스키마 변경이나 레거시 문서 대응
    if (!data.profile || !data.channelMeta || !data.lessonSchedule || typeof data.isOnboarded !== "boolean") {
      console.warn("Firestore 문서가 예상 스키마와 다릅니다:", data);
      return null;
    }
    return data as FirestoreUserData;
  } catch (err) {
    console.warn("Firestore 읽기 오류:", err);
    return null;
  }
}
