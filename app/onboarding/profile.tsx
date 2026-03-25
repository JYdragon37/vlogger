import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore, type EnglishLevel } from "@/store/useAppStore";

const C = {
  bg: "#0F0F0F", card: "#1A1A1A", card2: "#222",
  red: "#FF0000", white: "#FFF", gray1: "#AAA", gray2: "#888", gray4: "#555",
};

const LEVELS: EnglishLevel[] = ["Beginner", "Intermediate", "Advanced"];

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  required?: boolean;
}) {
  return (
    <View style={s.field}>
      <View style={s.labelRow}>
        <Text style={s.label}>{label}</Text>
        {required && <Text style={s.req}>*</Text>}
      </View>
      <TextInput
        style={s.input}
        placeholder={placeholder}
        placeholderTextColor="#444"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="next"
      />
    </View>
  );
}

export default function ProfileScreen() {
  const setUserProfile = useAppStore((s) => s.setUserProfile);

  const [name, setName] = useState("");
  const [channelName, setChannelName] = useState("");
  const [job, setJob] = useState("");
  const [location, setLocation] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [level, setLevel] = useState<EnglishLevel>("Intermediate");

  const autoChannel = name ? `${name}'s English Vlog` : "";
  const displayChannel = channelName || autoChannel;
  const canNext = name.trim().length > 0;

  const handleNext = () => {
    const handle = "@" + name.trim().toLowerCase().replace(/\s+/g, "_") + "_english";
    setUserProfile({
      name: name.trim(),
      channelHandle: handle,
      job: job.trim(),
      location: location.trim(),
      hobbies: hobbies
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
      englishLevel: level,
    });
    // Pass channel name to schedule screen via store temporarily
    useAppStore.setState((state) => ({
      channelInfo: { ...state.channelInfo, channelName: displayChannel },
    }));
    router.push("/onboarding/schedule");
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step indicator */}
          <View style={s.stepRow}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[s.stepDot, i <= 2 && s.stepDotActive]} />
            ))}
            <Text style={s.stepText}>2/4</Text>
          </View>

          {/* Header */}
          <Text style={s.title}>채널 프로필을{"\n"}입력해주세요</Text>
          <Text style={s.subtitle}>
            입력한 정보를 기반으로 AI가 나만의 스크립트를 만들어요
          </Text>

          {/* Fields */}
          <Field
            label="이름"
            placeholder="예: 박지원"
            value={name}
            onChangeText={setName}
            required
          />
          <Field
            label="채널명"
            placeholder={autoChannel || "예: JW's English Vlog"}
            value={channelName}
            onChangeText={setChannelName}
          />
          {channelName === "" && name !== "" && (
            <Text style={s.hint}>자동 생성: {autoChannel}</Text>
          )}
          <Field
            label="직업"
            placeholder="예: 마케터"
            value={job}
            onChangeText={setJob}
          />
          <Field
            label="거주지"
            placeholder="예: 서울 강남"
            value={location}
            onChangeText={setLocation}
          />
          <Field
            label="취미"
            placeholder="예: 카페 투어, 헬스, 넷플릭스"
            value={hobbies}
            onChangeText={setHobbies}
          />

          {/* English Level */}
          <View style={s.field}>
            <Text style={s.label}>영어 레벨</Text>
            <View style={s.levelRow}>
              {LEVELS.map((lv) => (
                <Pressable
                  key={lv}
                  style={[s.levelBtn, level === lv && s.levelBtnActive]}
                  onPress={() => setLevel(lv)}
                >
                  <Text
                    style={[s.levelText, level === lv && s.levelTextActive]}
                  >
                    {lv}
                  </Text>
                </Pressable>
              ))}
            </View>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 28 },
  stepDot: { width: 24, height: 4, borderRadius: 2, backgroundColor: "#2A2A2A", marginRight: 6 },
  stepDotActive: { backgroundColor: C.red, width: 32 },
  stepText: { color: C.gray4, fontSize: 13, fontWeight: "600", marginLeft: "auto" },
  title: { color: C.white, fontSize: 26, fontWeight: "900", lineHeight: 34, letterSpacing: -0.5 },
  subtitle: { color: C.gray2, fontSize: 14, marginTop: 8, marginBottom: 28, lineHeight: 20 },

  field: { marginBottom: 20 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  label: { color: C.gray1, fontSize: 13, fontWeight: "600" },
  req: { color: C.red, fontSize: 13, marginLeft: 4 },
  input: {
    backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, color: C.white, fontSize: 15,
    borderWidth: 1, borderColor: "#2A2A2A",
  },
  hint: { color: C.gray4, fontSize: 12, marginTop: -12, marginBottom: 12, paddingLeft: 4 },

  levelRow: { flexDirection: "row", gap: 8 },
  levelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: C.card, alignItems: "center",
    borderWidth: 1.5, borderColor: "#2A2A2A",
  },
  levelBtnActive: { borderColor: C.red, backgroundColor: C.red + "15" },
  levelText: { color: C.gray2, fontSize: 14, fontWeight: "600" },
  levelTextActive: { color: C.red },

  bottom: {
    flexDirection: "row", paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: "#1A1A1A", gap: 12,
  },
  backBtn: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: C.card,
    alignItems: "center", justifyContent: "center",
  },
  nextBtn: {
    flex: 1, height: 52, borderRadius: 14, backgroundColor: C.red,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: C.white, fontSize: 16, fontWeight: "700", marginRight: 6 },
});
