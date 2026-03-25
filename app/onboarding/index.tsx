import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const C = { bg: "#0F0F0F", red: "#FF0000", white: "#FFF", gray2: "#888", gray4: "#555", card: "#1A1A1A" };

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        {/* Step indicator */}
        <View style={s.stepRow}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[s.stepDot, i === 1 && s.stepDotActive]} />
          ))}
          <Text style={s.stepText}>1/4</Text>
        </View>

        {/* Content */}
        <View style={s.content}>
          {/* Big emoji */}
          <View style={s.emojiCircle}>
            <Text style={{ fontSize: 56 }}>🎬</Text>
          </View>

          <Text style={s.title}>
            내 영어 유튜브 채널을{"\n"}만들어볼까요?
          </Text>

          <Text style={s.subtitle}>
            AI 튜터 Emma와 함께{"\n"}
            나만의 영어 브이로그 채널을 운영해보세요.{"\n"}
            매일 수업을 완료하면 구독자가 늘어납니다!
          </Text>

          {/* Feature pills */}
          <View style={s.pillRow}>
            {["내 일상이 스크립트", "AI 전화영어", "구독자 성장"].map((t) => (
              <View key={t} style={s.pill}>
                <Text style={s.pillText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <Pressable
          style={s.btn}
          onPress={() => router.push("/onboarding/profile")}
        >
          <Text style={s.btnText}>채널 만들기 시작</Text>
          <Ionicons name="arrow-forward" size={20} color={C.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  stepDot: { width: 24, height: 4, borderRadius: 2, backgroundColor: "#2A2A2A", marginRight: 6 },
  stepDotActive: { backgroundColor: C.red, width: 32 },
  stepText: { color: C.gray4, fontSize: 13, fontWeight: "600", marginLeft: "auto" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  emojiCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: C.card, alignItems: "center", justifyContent: "center",
    marginBottom: 32,
  },
  title: { color: C.white, fontSize: 28, fontWeight: "900", textAlign: "center", lineHeight: 38, letterSpacing: -0.5 },
  subtitle: { color: C.gray2, fontSize: 15, textAlign: "center", lineHeight: 22, marginTop: 16 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 28, gap: 8 },
  pill: { backgroundColor: C.card, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: "#2A2A2A" },
  pillText: { color: C.gray2, fontSize: 13, fontWeight: "600" },
  btn: {
    backgroundColor: C.red, borderRadius: 16, paddingVertical: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  btnText: { color: C.white, fontSize: 17, fontWeight: "700", marginRight: 8 },
});
