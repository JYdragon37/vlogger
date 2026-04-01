import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { loadUserData } from "@/lib/firestore";
import { useAppStore } from "@/store/useAppStore";

export default function RootLayout() {
  const setUser = useAppStore((s) => s.setUser);
  const setAuthLoaded = useAppStore((s) => s.setAuthLoaded);
  const setUserProfile = useAppStore((s) => s.setUserProfile);
  const setChannelInfo = useAppStore((s) => s.setChannelInfo);
  const setLessonSchedule = useAppStore((s) => s.setLessonSchedule);
  const setIsOnboarded = useAppStore((s) => s.setIsOnboarded);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      // AsyncStorage 캐시로 즉시 라우팅 결정 — Firestore는 백그라운드 동기화
      setAuthLoaded(true);

      if (user) {
        loadUserData(user.uid)
          .then((data) => {
            if (data) {
              setUserProfile(data.profile);
              setChannelInfo({
                ...data.channelMeta,
                episodes: data.episodes ?? [],
              });
              setLessonSchedule(data.lessonSchedule);
              setIsOnboarded(data.isOnboarded);
            }
          })
          .catch(() => {
            // loadUserData 내부에서 에러 처리됨 — 캐시 데이터로 계속 진행
          });
      }
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0F0F0F" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="paywall" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="episode/[id]" />
        <Stack.Screen name="profile-edit" />
      </Stack>
    </>
  );
}
