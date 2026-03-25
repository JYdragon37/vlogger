import { Redirect } from "expo-router";
import { useAppStore } from "@/store/useAppStore";

export default function RootIndex() {
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  const isAuthLoaded = useAppStore((s) => s.isAuthLoaded);
  const user = useAppStore((s) => s.user);
  const isOnboarded = useAppStore((s) => s.isOnboarded);

  // AsyncStorage 및 Firebase Auth 모두 준비될 때까지 대기
  if (!hasHydrated || !isAuthLoaded) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
