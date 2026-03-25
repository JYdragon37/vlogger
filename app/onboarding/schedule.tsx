import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

const C = {
  bg: "#0F0F0F",
  card: "#1A1A1A",
  red: "#FF0000",
  white: "#FFF",
  gray1: "#AAA",
  gray2: "#888",
  gray4: "#555",
};

const DAYS = [
  { key: "Mon", label: "월" },
  { key: "Tue", label: "화" },
  { key: "Wed", label: "수" },
  { key: "Thu", label: "목" },
  { key: "Fri", label: "금" },
  { key: "Sat", label: "토" },
  { key: "Sun", label: "일" },
];

const TIME_PRESETS = [
  { label: "🌅 아침", sublabel: "07:00 – 09:00", value: "07:00" },
  { label: "☀️ 점심", sublabel: "12:00 – 13:00", value: "12:00" },
  { label: "🌇 오후", sublabel: "15:00 – 17:00", value: "15:00" },
  { label: "🌙 저녁", sublabel: "19:00 – 21:00", value: "19:00" },
  { label: "🌃 밤", sublabel: "21:00 – 23:00", value: "21:00" },
];

export default function ScheduleScreen() {
  const setLessonSchedule = useAppStore((s) => s.setLessonSchedule);

  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Wed", "Fri"]);
  const [slot1, setSlot1] = useState("07:00");
  const [slot2, setSlot2] = useState("12:00");
  const [slot3, setSlot3] = useState("19:00");

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const canNext = selectedDays.length > 0;

  const handleNext = () => {
    setLessonSchedule({
      days: selectedDays,
      timeSlots: [slot1, slot2, slot3],
    });
    router.push("/onboarding/complete");
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Step indicator */}
        <View style={s.stepRow}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[s.stepDot, i <= 3 && s.stepDotActive]} />
          ))}
          <Text style={s.stepText}>3/4</Text>
        </View>

        {/* Header */}
        <Text style={s.title}>수업 스케줄을{"\n"}설정해주세요</Text>
        <Text style={s.subtitle}>
          선택한 요일과 시간에 AI 튜터 Emma가 전화해요
        </Text>

        {/* Day selection */}
        <Text style={s.sectionTitle}>📅 수업 요일</Text>
        <View style={s.dayRow}>
          {DAYS.map((d) => {
            const active = selectedDays.includes(d.key);
            return (
              <Pressable
                key={d.key}
                style={[s.dayBtn, active && s.dayBtnActive]}
                onPress={() => toggleDay(d.key)}
              >
                <Text style={[s.dayText, active && s.dayTextActive]}>
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={s.dayHint}>
          {selectedDays.length > 0
            ? `주 ${selectedDays.length}회 선택됨`
            : "요일을 1개 이상 선택해주세요"}
        </Text>

        {/* Time Slot 1 */}
        <Text style={s.sectionTitle}>⏰ 1순위 시간</Text>
        <View style={s.timeRow}>
          {TIME_PRESETS.map((t) => (
            <Pressable
              key={t.value + "-1"}
              style={[s.timeBtn, slot1 === t.value && s.timeBtnActive]}
              onPress={() => setSlot1(t.value)}
            >
              <Text style={[s.timeLabel, slot1 === t.value && s.timeLabelActive]}>
                {t.label}
              </Text>
              <Text style={[s.timeSub, slot1 === t.value && s.timeSubActive]}>
                {t.sublabel}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Time Slot 2 */}
        <Text style={s.sectionTitle}>⏰ 2순위 시간</Text>
        <View style={s.timeRow}>
          {TIME_PRESETS.map((t) => (
            <Pressable
              key={t.value + "-2"}
              style={[s.timeBtn, slot2 === t.value && s.timeBtnActive]}
              onPress={() => setSlot2(t.value)}
            >
              <Text style={[s.timeLabel, slot2 === t.value && s.timeLabelActive]}>
                {t.label}
              </Text>
              <Text style={[s.timeSub, slot2 === t.value && s.timeSubActive]}>
                {t.sublabel}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Time Slot 3 */}
        <Text style={s.sectionTitle}>⏰ 3순위 시간</Text>
        <View style={s.timeRow}>
          {TIME_PRESETS.map((t) => (
            <Pressable
              key={t.value + "-3"}
              style={[s.timeBtn, slot3 === t.value && s.timeBtnActive]}
              onPress={() => setSlot3(t.value)}
            >
              <Text style={[s.timeLabel, slot3 === t.value && s.timeLabelActive]}>
                {t.label}
              </Text>
              <Text style={[s.timeSub, slot3 === t.value && s.timeSubActive]}>
                {t.sublabel}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View style={s.bottom}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={C.gray1} />
        </Pressable>
        <Pressable
          style={[s.nextBtn, !canNext && s.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canNext}
        >
          <Text style={s.nextBtnText}>다음</Text>
          <Ionicons name="arrow-forward" size={18} color={C.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },

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

  title: {
    color: C.white,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: C.gray2,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 20,
  },

  sectionTitle: {
    color: C.white,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },

  /* Day toggles */
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  dayBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
  },
  dayBtnActive: {
    borderColor: C.red,
    backgroundColor: C.red + "18",
  },
  dayText: { color: C.gray2, fontSize: 15, fontWeight: "700" },
  dayTextActive: { color: C.red },
  dayHint: {
    color: C.gray4,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 20,
  },

  /* Time slot cards */
  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  timeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.card,
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
    minWidth: 90,
    alignItems: "center",
  },
  timeBtnActive: {
    borderColor: C.red,
    backgroundColor: C.red + "18",
  },
  timeLabel: { color: C.gray1, fontSize: 14, fontWeight: "700" },
  timeLabelActive: { color: C.white },
  timeSub: { color: C.gray4, fontSize: 11, marginTop: 2 },
  timeSubActive: { color: C.red },

  /* Bottom */
  bottom: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
    gap: 12,
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.red,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "700",
    marginRight: 6,
  },
});
