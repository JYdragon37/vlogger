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

      if (user) {
        try {
          const data = await loadUserData(user.uid);
          if (data) {
            setUserProfile(data.profile);
            setChannelInfo(data.channelMeta);
            setLessonSchedule(data.lessonSchedule);
            setIsOnboarded(data.isOnboarded);
          }
        } catch (err) {
          // Firestore 로드 실패 시 AsyncStorage 캐시로 폴백
          console.warn("Firestore load failed:", err);
        }
      }

      setAuthLoaded(true);
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
      </Stack>
    </>
  );
}
