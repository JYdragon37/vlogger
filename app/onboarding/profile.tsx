import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore, type EnglishLevel, type Gender, type Character } from "@/store/useAppStore";

const C = {
  bg: "#0F0F0F", card: "#1A1A1A", card2: "#222",
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
const MAX_CHARACTERS = 5;

const RELATIONSHIP_OPTIONS = ["친구", "직장 동료", "룸메이트", "가족", "연인", "선생님", "기타"];

export default function ProfileScreen() {
  const setUserProfile = useAppStore((s) => s.setUserProfile);

  const [name, setName] = useState("");
  const [channelName, setChannelName] = useState("");
  const [gender, setGender] = useState<Gender>("prefer_not_to_say");
  const [selectedJob, setSelectedJob] = useState("");
  const [customJob, setCustomJob] = useState("");
  const [location, setLocation] = useState("");
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [level, setLevel] = useState<EnglishLevel>("Intermediate");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [charModalVisible, setCharModalVisible] = useState(false);
  const [charName, setCharName] = useState("");
  const [charRelationship, setCharRelationship] = useState("");
  const [charJob, setCharJob] = useState("");

  const autoChannel = name ? `${name}'s English Vlog` : "";
  const displayChannel = channelName || autoChannel;
  const job = selectedJob === "기타" ? customJob : selectedJob;
  const canNext = name.trim().length > 0 && selectedJob.length > 0 && selectedHobbies.length > 0;

  const toggleHobby = (h: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : prev.length < MAX_HOBBIES ? [...prev, h] : prev
    );
  };

  const openAddChar = () => {
    setCharName(""); setCharRelationship(""); setCharJob("");
    setCharModalVisible(true);
  };

  const confirmAddChar = () => {
    if (!charName.trim() || !charRelationship) return;
    const newChar: Character = {
      name: charName.trim(),
      relationship: charRelationship,
      job: charJob.trim() || undefined,
    };
    setCharacters((prev) => [...prev, newChar]);
    setCharModalVisible(false);
  };

  const removeChar = (idx: number) =>
    setCharacters((prev) => prev.filter((_, i) => i !== idx));

  const handleNext = () => {
    const handle = "@" + name.trim().toLowerCase().replace(/\s+/g, "_") + "_english";
    setUserProfile({
      name: name.trim(),
      channelHandle: handle,
      gender,
      job: job.trim(),
      location: location.trim(),
      hobbies: selectedHobbies,
      englishLevel: level,
      characters: characters.length > 0 ? characters : undefined,
    });
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
          keyboardShouldPersistTaps="always"
        >
          {/* Step indicator */}
          <View style={s.stepRow}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[s.stepDot, i <= 2 && s.stepDotActive]} />
            ))}
            <Text style={s.stepText}>2/4</Text>
          </View>

          <Text style={s.title}>채널 프로필을{"\n"}입력해주세요</Text>
          <Text style={s.subtitle}>입력한 정보를 기반으로 AI가 나만의 스크립트를 만들어요</Text>

          {/* 이름 */}
          <View style={s.field}>
            <View style={s.labelRow}>
              <Text style={s.label}>이름</Text>
              <Text style={s.req}>*</Text>
            </View>
            <TextInput
              style={s.input}
              placeholder="예: 박지원"
              placeholderTextColor="#444"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />
          </View>

          {/* 채널명 */}
          <View style={s.field}>
            <Text style={s.label}>채널명</Text>
            <TextInput
              style={s.input}
              placeholder={autoChannel || "예: JW's English Vlog"}
              placeholderTextColor="#444"
              value={channelName}
              onChangeText={setChannelName}
            />
            {channelName === "" && name !== "" && (
              <Text style={s.hint}>자동 생성: {autoChannel}</Text>
            )}
          </View>

          {/* 성별 */}
          <View style={s.field}>
            <Text style={s.label}>성별</Text>
            <View style={s.chipRow}>
              {GENDER_OPTIONS.map((g) => (
                <Pressable
                  key={g.value}
                  style={[s.chip, gender === g.value && s.chipActive]}
                  onPress={() => setGender(g.value)}
                >
                  <Text style={[s.chipText, gender === g.value && s.chipTextActive]}>
                    {g.label}
                  </Text>
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
                <Pressable
                  key={j}
                  style={[s.chip, selectedJob === j && s.chipActive]}
                  onPress={() => setSelectedJob(j)}
                >
                  <Text style={[s.chipText, selectedJob === j && s.chipTextActive]}>{j}</Text>
                </Pressable>
              ))}
            </View>
            {selectedJob === "기타" && (
              <TextInput
                style={[s.input, { marginTop: 10 }]}
                placeholder="직업을 직접 입력해주세요"
                placeholderTextColor="#444"
                value={customJob}
                onChangeText={setCustomJob}
              />
            )}
          </View>

          {/* 거주지 */}
          <View style={s.field}>
            <Text style={s.label}>거주지</Text>
            <TextInput
              style={s.input}
              placeholder="예: 서울 강남"
              placeholderTextColor="#444"
              value={location}
              onChangeText={setLocation}
            />
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
                    onPress={() => !maxReached && toggleHobby(h)}
                  >
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
                <Pressable
                  key={lv}
                  style={[s.levelBtn, level === lv && s.chipActive]}
                  onPress={() => setLevel(lv)}
                >
                  <Text style={[s.chipText, level === lv && s.chipTextActive]}>{lv}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 등장인물 */}
          <View style={s.field}>
            <View style={s.labelRow}>
              <Text style={s.label}>등장인물</Text>
              <Text style={s.limitText}>최대 {MAX_CHARACTERS}명 · 선택</Text>
            </View>
            <Text style={s.charDesc}>스크립트에 자연스럽게 등장시킬 인물을 등록해요</Text>
            {characters.map((c, i) => (
              <View key={i} style={s.charRow}>
                <View style={s.charAvatar}>
                  <Text style={s.charAvatarText}>{c.name.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.charName}>{c.name}</Text>
                  <Text style={s.charMeta}>{c.relationship}{c.job ? ` · ${c.job}` : ""}</Text>
                </View>
                <Pressable onPress={() => removeChar(i)} hitSlop={8}>
                  <Ionicons name="close-circle" size={20} color={C.gray4} />
                </Pressable>
              </View>
            ))}
            {characters.length < MAX_CHARACTERS && (
              <Pressable style={s.addCharBtn} onPress={openAddChar}>
                <Ionicons name="add" size={18} color={C.red} />
                <Text style={s.addCharText}>인물 추가하기</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>

        {/* 등장인물 추가 모달 */}
        <Modal visible={charModalVisible} transparent animationType="fade">
          <Pressable style={s.modalOverlay} onPress={() => setCharModalVisible(false)}>
            <Pressable style={s.modalBox} onPress={() => {}}>
              <Text style={s.modalTitle}>인물 추가</Text>
              <TextInput
                style={s.input}
                placeholder="이름 (예: Mike, Sarah)"
                placeholderTextColor="#444"
                value={charName}
                onChangeText={setCharName}
              />
              <Text style={[s.label, { marginTop: 14, marginBottom: 8 }]}>관계</Text>
              <View style={s.chipWrap}>
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <Pressable
                    key={r}
                    style={[s.chip, charRelationship === r && s.chipActive]}
                    onPress={() => setCharRelationship(r)}
                  >
                    <Text style={[s.chipText, charRelationship === r && s.chipTextActive]}>{r}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                style={[s.input, { marginTop: 14 }]}
                placeholder="직업 (선택, 예: 마케터)"
                placeholderTextColor="#444"
                value={charJob}
                onChangeText={setCharJob}
              />
              <Pressable
                style={[s.nextBtn, { marginTop: 20 }, (!charName.trim() || !charRelationship) && s.nextBtnDisabled]}
                onPress={confirmAddChar}
                disabled={!charName.trim() || !charRelationship}
              >
                <Text style={s.nextBtnText}>추가</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

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
  hint: { color: C.gray4, fontSize: 12, marginTop: 6, paddingLeft: 4 },

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

  charDesc: { color: C.gray4, fontSize: 12, marginBottom: 12 },
  charRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: C.card, borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: "#2A2A2A",
  },
  charAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.red + "22", alignItems: "center", justifyContent: "center",
  },
  charAvatarText: { color: C.red, fontSize: 15, fontWeight: "700" },
  charName: { color: C.white, fontSize: 14, fontWeight: "600" },
  charMeta: { color: C.gray2, fontSize: 12, marginTop: 2 },
  addCharBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1.5, borderColor: C.red + "55", borderStyle: "dashed",
    borderRadius: 12, padding: 14, justifyContent: "center",
  },
  addCharText: { color: C.red, fontSize: 14, fontWeight: "600" },

  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center", paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: C.card, borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: "#2A2A2A",
  },
  modalTitle: { color: C.white, fontSize: 18, fontWeight: "800", marginBottom: 16 },

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
