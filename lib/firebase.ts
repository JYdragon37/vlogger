// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
// @ts-ignore — Metro 번들러가 RN 환경에서 firebase/auth의 RN 전용 번들을 자동 로드함
// tsc는 웹 타입만 참조하여 에러를 표시하지만 런타임에서는 정상 동작
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// initializeAuth는 최초 1회만 호출 가능
// Fast Refresh 또는 HMR 재실행 시 에러 방지를 위해 try-catch 사용
let authInstance: ReturnType<typeof getAuth>;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // 이미 초기화된 경우 기존 인스턴스 사용
  authInstance = getAuth(app);
}

export const auth = authInstance;
export default app;
