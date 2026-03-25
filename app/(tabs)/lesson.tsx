import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

const C = { bg: "#0F0F0F", card: "#1A1A1A", red: "#FF0000", white: "#FFF", gray1: "#AAA", gray2: "#888" };

export default function LessonScreen() {
  const { lessonSchedule } = useAppStore();
  const days = lessonSchedule.days.join(" · ");
  const time = lessonSchedule.timeSlots[0] || "07:00";

  const steps = [
    { icon: "document-text-outline" as const, label: "스크립트 읽기", time: "2분" },
    { icon: "school-outline" as const, label: "핵심 표현 5개 학습", time: "2분" },
    { icon: "flash-outline" as const, label: "플래시카드 퀴즈", time: "1분" },
    { icon: "call-outline" as const, label: "Emma 전화영어", time: "5~10분" },
    { icon: "stats-chart-outline" as const, label: "피드백 리포트", time: "-" },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.wrap}>
        <Text style={s.title}>수업</Text>

        {/* Next lesson card */}
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

        {/* Steps */}
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
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  wrap: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  title: { color: C.white, fontSize: 22, fontWeight: "800", marginBottom: 24 },
  row: { flexDirection: "row" },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.red, alignItems: "center", justifyContent: "center", marginRight: 12 },
  cardTitle: { color: C.white, fontSize: 16, fontWeight: "600" },
  cardSub: { color: C.gray2, fontSize: 14, marginTop: 2 },
  schedBox: { backgroundColor: C.bg, borderRadius: 12, padding: 16, marginTop: 12 },
  schedText: { color: C.gray1, fontSize: 14, marginLeft: 8 },
  stepsTitle: { color: C.white, fontSize: 14, fontWeight: "600", marginBottom: 12 },
  stepRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.bg },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", marginRight: 10 },
  stepNumText: { color: C.red, fontSize: 12, fontWeight: "700" },
  stepLabel: { color: C.white, fontSize: 14, flex: 1, marginLeft: 8 },
  stepTime: { color: C.gray2, fontSize: 12 },
});
