import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { generateVlogScript, type ScriptResult } from "@/lib/openai";

const C = {
  bg: "#0F0F0F",
  card: "#1A1A1A",
  card2: "#222",
  red: "#FF0000",
  white: "#FFF",
  gray1: "#AAA",
  gray2: "#888",
  gray4: "#555",
  green: "#4CAF50",
};

// ─── Script bold parser ──────────────────────────────────
// Splits script text on **...** markers into plain/bold segments

function ScriptText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <Text style={s.scriptBody}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={s.scriptBold}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
}

// ─── Main Screen ─────────────────────────────────────────

export default function LessonScreen() {
  const { lessonSchedule, userProfile } = useAppStore();
  const days = lessonSchedule.days.join(" · ");
  const time = lessonSchedule.timeSlots[0] || "07:00";

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [script, setScript] = useState<ScriptResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const steps = [
    { icon: "document-text-outline" as const, label: "스크립트 읽기", time: "2분" },
    { icon: "school-outline" as const, label: "핵심 표현 5개 학습", time: "2분" },
    { icon: "flash-outline" as const, label: "플래시카드 퀴즈", time: "1분" },
    { icon: "call-outline" as const, label: "Emma 전화영어", time: "5~10분" },
    { icon: "stats-chart-outline" as const, label: "피드백 리포트", time: "-" },
  ];

  const handleStart = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const result = await generateVlogScript({
        name: userProfile.name,
        job: userProfile.job,
        location: userProfile.location,
        hobbies: userProfile.hobbies,
        englishLevel: userProfile.englishLevel,
      });
      setScript(result);
      setStatus("done");
    } catch (err: any) {
      setErrorMsg(err.message ?? "스크립트 생성에 실패했습니다.");
      setStatus("error");
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>수업</Text>

        {/* ─── Next Lesson Card ─── */}
        <View style={s.card}>
          <View style={s.row}>
            <View style={s.iconCircle}>
              <Ionicons name="call" size={20} color={C.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>다음 수업 예정</Text>
              <Text style={s.cardSub}>Emma와 전화영어</Text>
            </View>
          </View>
          <View style={s.schedBox}>
            <View style={[s.row, { alignItems: "center", marginBottom: 8 }]}>
              <Ionicons name="calendar-outline" size={16} color={C.gray1} />
              <Text style={s.schedText}>{days}</Text>
            </View>
            <View style={[s.row, { alignItems: "center" }]}>
              <Ionicons name="time-outline" size={16} color={C.gray1} />
              <Text style={s.schedText}>1순위 {time}</Text>
            </View>
          </View>
        </View>

        {/* ─── Steps Card ─── */}
        <View style={s.card}>
          <Text style={s.stepsTitle}>학습 루프</Text>
          {steps.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={s.stepNum}>
                <Text style={s.stepNumText}>{i + 1}</Text>
              </View>
              <Ionicons name={step.icon} size={18} color={C.gray1} />
              <Text style={s.stepLabel}>{step.label}</Text>
              <Text style={s.stepTime}>{step.time}</Text>
            </View>
          ))}
        </View>

        {/* ─── Script Section ─── */}
        {status === "idle" && (
          <Pressable style={s.startBtn} onPress={handleStart}>
            <Ionicons name="play-circle" size={22} color={C.white} />
            <Text style={s.startBtnText}>오늘의 수업 시작하기</Text>
          </Pressable>
        )}

        {status === "loading" && (
          <View style={s.loadingCard}>
            <ActivityIndicator color={C.red} size="large" />
            <Text style={s.loadingText}>AI가 오늘의 스크립트를 만들고 있어요...</Text>
          </View>
        )}

        {status === "error" && (
          <View style={s.errorCard}>
            <Ionicons name="alert-circle-outline" size={24} color="#FF6B6B" />
            <Text style={s.errorText}>{errorMsg}</Text>
            <Pressable style={s.retryBtn} onPress={handleStart}>
              <Text style={s.retryText}>다시 시도</Text>
            </Pressable>
          </View>
        )}

        {status === "done" && script && (
          <View>
            {/* Topic Badge */}
            <View style={s.topicBadge}>
              <Ionicons name="videocam" size={14} color={C.red} />
              <Text style={s.topicText} numberOfLines={1}>{script.topic}</Text>
            </View>

            {/* Script Card */}
            <View style={s.scriptCard}>
              <View style={[s.row, { alignItems: "center", marginBottom: 14 }]}>
                <Ionicons name="document-text" size={18} color={C.red} />
                <Text style={s.scriptTitle}>오늘의 스크립트</Text>
              </View>
              <ScriptText text={script.script} />
            </View>

            {/* Expressions Card */}
            <View style={s.exprCard}>
              <View style={[s.row, { alignItems: "center", marginBottom: 14 }]}>
                <Ionicons name="school" size={18} color={C.green} />
                <Text style={s.exprTitle}>핵심 표현 5개</Text>
              </View>
              {script.expressions.map((expr, i) => (
                <View key={i} style={s.exprRow}>
                  <View style={s.exprNum}>
                    <Text style={s.exprNumText}>{i + 1}</Text>
                  </View>
                  <Text style={s.exprText}>{expr}</Text>
                </View>
              ))}
            </View>

            {/* Retry */}
            <Pressable style={s.regenBtn} onPress={handleStart}>
              <Ionicons name="refresh" size={16} color={C.gray2} />
              <Text style={s.regenText}>다른 주제로 다시 생성</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  title: { color: C.white, fontSize: 22, fontWeight: "800", marginBottom: 24 },
  row: { flexDirection: "row" },

  // Cards
  card: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.red, alignItems: "center",
    justifyContent: "center", marginRight: 12,
  },
  cardTitle: { color: C.white, fontSize: 16, fontWeight: "600" },
  cardSub: { color: C.gray2, fontSize: 14, marginTop: 2 },
  schedBox: { backgroundColor: C.bg, borderRadius: 12, padding: 16, marginTop: 12 },
  schedText: { color: C.gray1, fontSize: 14, marginLeft: 8 },

  // Steps
  stepsTitle: { color: C.white, fontSize: 14, fontWeight: "600", marginBottom: 12 },
  stepRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.bg,
  },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.bg, alignItems: "center",
    justifyContent: "center", marginRight: 10,
  },
  stepNumText: { color: C.red, fontSize: 12, fontWeight: "700" },
  stepLabel: { color: C.white, fontSize: 14, flex: 1, marginLeft: 8 },
  stepTime: { color: C.gray2, fontSize: 12 },

  // Start button
  startBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: C.red, borderRadius: 16,
    paddingVertical: 18, marginBottom: 16,
  },
  startBtnText: { color: C.white, fontSize: 16, fontWeight: "700" },

  // Loading
  loadingCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 32,
    alignItems: "center", gap: 16, marginBottom: 16,
  },
  loadingText: { color: C.gray2, fontSize: 14, textAlign: "center" },

  // Error
  errorCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 24,
    alignItems: "center", gap: 12, marginBottom: 16,
  },
  errorText: { color: "#FF6B6B", fontSize: 13, textAlign: "center", lineHeight: 20 },
  retryBtn: {
    backgroundColor: C.card2, borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  retryText: { color: C.white, fontSize: 14, fontWeight: "600" },

  // Topic badge
  topicBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.card, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12,
  },
  topicText: { color: C.white, fontSize: 14, fontWeight: "700", flex: 1 },

  // Script card
  scriptCard: {
    backgroundColor: C.card, borderRadius: 16,
    padding: 20, marginBottom: 12,
  },
  scriptTitle: { color: C.white, fontSize: 15, fontWeight: "700", marginLeft: 8 },
  scriptBody: { color: C.gray1, fontSize: 15, lineHeight: 26 },
  scriptBold: { color: C.white, fontWeight: "700" },

  // Expressions card
  exprCard: {
    backgroundColor: C.card, borderRadius: 16,
    padding: 20, marginBottom: 12,
  },
  exprTitle: { color: C.white, fontSize: 15, fontWeight: "700", marginLeft: 8 },
  exprRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.bg,
  },
  exprNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.green + "20", alignItems: "center",
    justifyContent: "center", marginRight: 12,
  },
  exprNumText: { color: C.green, fontSize: 12, fontWeight: "700" },
  exprText: { color: C.white, fontSize: 14, flex: 1, lineHeight: 20 },

  // Regen button
  regenBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, marginBottom: 16,
  },
  regenText: { color: C.gray2, fontSize: 13 },
});
