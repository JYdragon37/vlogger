import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { saveUserData } from "@/lib/firestore";

const C = {
  bg: "#0F0F0F",
  card: "#1A1A1A",
  red: "#FF0000",
  white: "#FFF",
  gray2: "#888",
  gray4: "#555",
  gold: "#FFD700",
};

export default function CompleteScreen() {
  const setIsOnboarded = useAppStore((s) => s.setIsOnboarded);
  const channelName = useAppStore((s) => s.channelInfo.channelName);
  const userName = useAppStore((s) => s.userProfile.name);
  const user = useAppStore((s) => s.user);
  const userProfile = useAppStore((s) => s.userProfile);
  const channelInfo = useAppStore((s) => s.channelInfo);
  const lessonSchedule = useAppStore((s) => s.lessonSchedule);

  const [phase, setPhase] = useState<"loading" | "done">("loading");

  // Animations
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scaleIn = useRef(new Animated.Value(0.5)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spinning animation during loading
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // After 2 seconds, switch to "done" phase
    const timer = setTimeout(() => {
      // Firestore에 유저 데이터 저장 (fire and forget)
      if (user?.uid) {
        saveUserData(user.uid, {
          profile: userProfile,
          channelMeta: {
            channelName: channelInfo.channelName,
            subscriberCount: channelInfo.subscriberCount,
            badge: channelInfo.badge,
            streakDays: channelInfo.streakDays,
            totalTalkTimeMinutes: channelInfo.totalTalkTimeMinutes,
          },
          lessonSchedule,
          isOnboarded: true,
        }).catch((err) => console.error("Firestore save failed:", err));
      }

      setPhase("done");

      // Fade in + scale up done content
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleIn, {
          toValue: 1,
          damping: 12,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Navigate to tabs after showing the completion for 2 more seconds
      setTimeout(() => {
        setIsOnboarded(true);
        router.replace("/(tabs)");
      }, 2000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const displayName = channelName || `${userName}'s English Vlog`;

  if (phase === "loading") {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          {/* Step indicator */}
          <View style={s.stepRow}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[s.stepDot, s.stepDotActive]} />
            ))}
            <Text style={s.stepText}>4/4</Text>
          </View>

          <View style={s.loadingContent}>
            {/* Spinning loader */}
            <Animated.View
              style={[s.spinnerOuter, { transform: [{ rotate: spin }] }]}
            >
              <View style={s.spinnerInner}>
                <Text style={{ fontSize: 40 }}>📡</Text>
              </View>
            </Animated.View>

            <Text style={s.loadingTitle}>채널을 개설하고 있어요...</Text>

            {/* Fake progress steps */}
            <View style={s.progressList}>
              <ProgressItem text="프로필 설정 완료" done />
              <ProgressItem text="AI 튜터 배정 중" done />
              <ProgressItem text="채널 세팅 중..." done={false} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        {/* Step indicator */}
        <View style={s.stepRow}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[s.stepDot, s.stepDotActive]} />
          ))}
          <Text style={s.stepText}>4/4</Text>
        </View>

        <Animated.View
          style={[
            s.doneContent,
            { opacity: fadeIn, transform: [{ scale: scaleIn }] },
          ]}
        >
          {/* Confetti emoji row */}
          <Animated.View style={[s.confettiRow, { opacity: confettiAnim }]}>
            <Text style={{ fontSize: 28 }}>🎉</Text>
            <Text style={{ fontSize: 28 }}>🎊</Text>
            <Text style={{ fontSize: 28 }}>🎬</Text>
            <Text style={{ fontSize: 28 }}>🎊</Text>
            <Text style={{ fontSize: 28 }}>🎉</Text>
          </Animated.View>

          {/* Big check */}
          <View style={s.checkCircle}>
            <Text style={{ fontSize: 56 }}>✅</Text>
          </View>

          <Text style={s.doneTitle}>채널이 개설됐습니다!</Text>

          {/* Channel card preview */}
          <View style={s.channelCard}>
            <View style={s.miniAvatar}>
              <Text style={s.miniAvatarText}>
                {userName ? userName.charAt(0).toUpperCase() : "V"}
              </Text>
            </View>
            <Text style={s.channelName}>{displayName}</Text>
            <Text style={s.channelSub}>구독자 0명 · 에피소드 0개</Text>
          </View>

          <Text style={s.doneSubtitle}>
            AI 튜터 Emma가 곧 전화할 거예요!{"\n"}
            첫 수업을 완료하면 구독자가 늘어납니다 🚀
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function ProgressItem({ text, done }: { text: string; done: boolean }) {
  return (
    <View style={s.progressItem}>
      <View style={[s.progressDot, done && s.progressDotDone]} />
      <Text style={[s.progressText, done && s.progressTextDone]}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },

  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 28 },
  stepDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2A2A2A",
    marginRight: 6,
  },
  stepDotActive: { backgroundColor: C.red, width: 32 },
  stepText: {
    color: C.gray4,
    fontSize: 13,
    fontWeight: "600",
    marginLeft: "auto",
  },

  /* Loading phase */
  loadingContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  spinnerOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: C.red + "40",
    borderTopColor: C.red,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  spinnerInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingTitle: {
    color: C.white,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
  },
  progressList: { gap: 12, alignItems: "flex-start" },
  progressItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.gray4,
  },
  progressDotDone: { backgroundColor: "#4CAF50" },
  progressText: { color: C.gray4, fontSize: 14, fontWeight: "600" },
  progressTextDone: { color: C.gray2 },

  /* Done phase */
  doneContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  confettiRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  doneTitle: {
    color: C.white,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
  },
  channelCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 20,
  },
  miniAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.red,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  miniAvatarText: {
    color: C.white,
    fontSize: 22,
    fontWeight: "900",
  },
  channelName: {
    color: C.white,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  channelSub: {
    color: C.gray2,
    fontSize: 13,
  },
  doneSubtitle: {
    color: C.gray2,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
