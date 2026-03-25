import { Redirect } from "expo-router";
import { useAppStore } from "@/store/useAppStore";

export default function RootIndex() {
  const isOnboarded = useAppStore((s) => s.isOnboarded);

  if (isOnboarded) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
