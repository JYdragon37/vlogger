import { useState } from "react";
import {
  View, Text, TextInput, Pressable, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore, type EnglishLevel, type Gender } from "@/store/useAppStore";
import { saveUserData } from "@/lib/firestore";

const C = {
  bg: "#0F0F0F", card: "#1A1A1A",
  red: "#FF0000", white: "#FFF", gray1: "#AAA", gray2: "#888", gray4: "#555",
};

const LEVELS: EnglishLevel[] = ["Beginner", "Intermediate", "Advanced"];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
  { value: "prefer_not_to_say", label: "선택 안 함" },
];

const JOB_OPTIONS = [
  "학생", "직장인", "개발자/IT", "마케터", "디자이너",
  "교육/강사", "의료인", "프리랜서", "사업가", "기타",
];

const HOBBY_OPTIONS = [
  "카페 탐방", "헬스/운동", "요리", "여행", "영화/드라마",
  "독서", "게임", "음악", "사진/영상", "쇼핑", "등산", "반려동물",
];

const MAX_HOBBIES = 5;

export default function ProfileEditScreen() {
  const router = useRouter();
  const { userProfile, channelInfo, lessonSchedule, user, setUserProfile, setChannelInfo } = useAppStore();

  const [name, setName] = useState(userProfile.name);
  const [channelName, setChannelName] = useState(channelInfo.channelName);
  const [gender, setGender] = useState<Gender>(userProfile.gender ?? "prefer_not_to_say");
  const [selectedJob, setSelectedJob] = useState(
    JOB_OPTIONS.includes(userProfile.job) ? userProfile.job : userProfile.job ? "기타" : ""
  );
  const [customJob, setCustomJob] = useState(
    JOB_OPTIONS.includes(userProfile.job) ? "" : userProfile.job
  );
  const [location, setLocation] = useState(userProfile.location);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(userProfile.hobbies);
  const [level, setLevel] = useState<EnglishLevel>(userProfile.englishLevel);
  const [saving, setSaving] = useState(false);

  const job = selectedJob === "기타" ? customJob : selectedJob;
  const canSave = name.trim().length > 0 && selectedJob.length > 0 && selectedHobbies.length > 0;

  const toggleHobby = (h: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : prev.length < MAX_HOBBIES ? [...prev, h] : prev
    );
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);

    // 로컬 저장 먼저 — 항상 성공
    const handle = "@" + name.trim().toLowerCase().replace(/\s+/g, "_") + "_english";
    const updatedProfile = {
      name: name.trim(),
      channelHandle: handle,
      gender,
      job: job.trim(),
      location: location.trim(),
      hobbies: selectedHobbies,
      englishLevel: level,
    };
    const finalChannelName = channelName.trim() || `${name.trim()}'s English Vlog`;
    setUserProfile(updatedProfile);
    setChannelInfo({ channelName: finalChannelName });

    // Firestore 동기화 — 실패해도 로컬은 이미 저장됨
    if (user?.uid) {
      try {
        await saveUserData(user.uid, {
          profile: { ...updatedProfile, ...(userProfile.avatarIconName ? { avatarIconName: userProfile.avatarIconName } : {}) },
          channelMeta: {
            channelName: finalChannelName,
            subscriberCount: channelInfo.subscriberCount,
            badge: channelInfo.badge,
            streakDays: channelInfo.streakDays,
            totalTalkTimeMinutes: channelInfo.totalTalkTimeMinutes,
          },
          lessonSchedule,
          isOnboarded: true,
        });
      } catch (err: any) {
        console.error("Firestore 저장 실패:", err);
        // 로컬은 성공 — 조용히 처리 (네트워크 없어도 앱은 정상 동작)
      }
    }

    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.headerBack}>
            <Ionicons name="arrow-back" size={22} color={C.white} />
          </Pressable>
          <Text style={s.headerTitle}>프로필 수정</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {/* 이름 */}
          <View style={s.field}>
            <View style={s.labelRow}>
              <Text style={s.label}>이름</Text>
              <Text style={s.req}>*</Text>
            </View>
            <TextInput style={s.input} placeholderTextColor="#444"
              value={name} onChangeText={setName} />
          </View>

          {/* 채널명 */}
          <View style={s.field}>
            <Text style={s.label}>채널명</Text>
            <TextInput style={s.input} placeholderTextColor="#444"
              placeholder={`${name}'s English Vlog`}
              value={channelName} onChangeText={setChannelName} />
          </View>

          {/* 성별 */}
          <View style={s.field}>
            <Text style={s.label}>성별</Text>
            <View style={s.chipRow}>
              {GENDER_OPTIONS.map((g) => (
                <Pressable key={g.value} style={[s.chip, gender === g.value && s.chipActive]}
                  onPress={() => setGender(g.value)}>
                  <Text style={[s.chipText, gender === g.value && s.chipTextActive]}>{g.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 직업 */}
          <View style={s.field}>
            <View style={s.labelRow}>
              <Text style={s.label}>직업</Text>
              <Text style={s.req}>*</Text>
            </View>
            <View style={s.chipWrap}>
              {JOB_OPTIONS.map((j) => (
                <Pressable key={j} style={[s.chip, selectedJob === j && s.chipActive]}
                  onPress={() => setSelectedJob(j)}>
                  <Text style={[s.chipText, selectedJob === j && s.chipTextActive]}>{j}</Text>
                </Pressable>
              ))}
            </View>
            {selectedJob === "기타" && (
              <TextInput style={[s.input, { marginTop: 10 }]} placeholderTextColor="#444"
                placeholder="직업을 직접 입력해주세요"
                value={customJob} onChangeText={setCustomJob} />
            )}
          </View>

          {/* 거주지 */}
          <View style={s.field}>
            <Text style={s.label}>거주지</Text>
            <TextInput style={s.input} placeholderTextColor="#444"
              placeholder="예: 서울 강남"
              value={location} onChangeText={setLocation} />
          </View>

          {/* 취미 */}
          <View style={s.field}>
            <View style={s.labelRow}>
              <Text style={s.label}>취미</Text>
              <Text style={s.req}>*</Text>
              <Text style={s.limitText}>최대 {MAX_HOBBIES}개</Text>
            </View>
            <View style={s.chipWrap}>
              {HOBBY_OPTIONS.map((h) => {
                const selected = selectedHobbies.includes(h);
                const maxReached = !selected && selectedHobbies.length >= MAX_HOBBIES;
                return (
                  <TouchableOpacity key={h} activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    style={[s.chip, selected && s.chipActive, maxReached && s.chipDisabled]}
                    onPress={() => !maxReached && toggleHobby(h)}>
                    <Text style={[s.chipText, selected && s.chipTextActive]}>{h}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 영어 레벨 */}
          <View style={s.field}>
            <Text style={s.label}>영어 레벨</Text>
            <View style={s.chipRow}>
              {LEVELS.map((lv) => (
                <Pressable key={lv} style={[s.levelBtn, level === lv && s.chipActive]}
                  onPress={() => setLevel(lv)}>
                  <Text style={[s.chipText, level === lv && s.chipTextActive]}>{lv}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Save button */}
        <View style={s.bottom}>
          <Pressable
            style={[s.saveBtn, (!canSave || saving) && s.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave || saving}
          >
            {saving ? (
              <ActivityIndicator color={C.white} size="small" />
            ) : (
              <Text style={s.saveBtnText}>저장하기</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#1A1A1A",
  },
  headerBack: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: C.white, fontSize: 17, fontWeight: "700", textAlign: "center" },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  field: { marginBottom: 24 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  label: { color: C.gray1, fontSize: 13, fontWeight: "600" },
  req: { color: C.red, fontSize: 13, marginLeft: 4 },
  limitText: { color: C.gray4, fontSize: 12, marginLeft: "auto" },
  input: {
    backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, color: C.white, fontSize: 15,
    borderWidth: 1, borderColor: "#2A2A2A",
  },
  chipRow: { flexDirection: "row", gap: 8 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    backgroundColor: C.card, borderWidth: 1.5, borderColor: "#2A2A2A",
  },
  chipActive: { borderColor: C.red, backgroundColor: C.red + "18" },
  chipDisabled: { opacity: 0.35 },
  chipText: { color: C.gray2, fontSize: 14, fontWeight: "500" },
  chipTextActive: { color: C.red, fontWeight: "700" },
  levelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: C.card, alignItems: "center",
    borderWidth: 1.5, borderColor: "#2A2A2A",
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12 },
  saveBtn: {
    height: 52, borderRadius: 14, backgroundColor: C.red,
    alignItems: "center", justifyContent: "center",
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: C.white, fontSize: 16, fontWeight: "700" },
});
