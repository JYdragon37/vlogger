import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

const MIN_LOADING_MS = 1800; // 최소 로딩 화면 표시 시간

function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={s.container}>
      <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={s.logoWrap}>
          <Ionicons name="play" size={30} color="#FF0000" />
        </View>
        <Text style={s.appName}>Vlogger</Text>
        <Text style={s.tagline}>영어로 나만의 유튜브 채널</Text>
      </Animated.View>

      <Animated.View style={[s.footer, { opacity: fadeAnim }]}>
        <View style={s.dotRow}>
          <Dot delay={0} />
          <Dot delay={160} />
          <Dot delay={320} />
        </View>
      </Animated.View>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ),
    ]);
    pulse.start();
    return () => pulse.stop();
  }, []);

  return <Animated.View style={[s.dot, { opacity: anim }]} />;
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    color: "#555",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  footer: {
    position: "absolute",
    bottom: 60,
  },
  dotRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF0000",
  },
});

export default function RootIndex() {
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  const isAuthLoaded = useAppStore((s) => s.isAuthLoaded);
  const user = useAppStore((s) => s.user);
  const isOnboarded = useAppStore((s) => s.isOnboarded);

  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), MIN_LOADING_MS);
    return () => clearTimeout(timer);
  }, []);

  // 데이터 준비 + 최소 시간 둘 다 충족해야 화면 전환
  const ready = hasHydrated && isAuthLoaded && minTimePassed;

  if (!ready) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
