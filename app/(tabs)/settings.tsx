import { View, Text, Pressable, ScrollView, StyleSheet, Alert, ToastAndroid, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut, deleteUser } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { auth } from "@/lib/firebase";
import { useAppStore } from "@/store/useAppStore";
import { deleteUserData } from "@/lib/firestore";

const C = { bg: "#0F0F0F", card: "#1A1A1A", red: "#FF0000", white: "#FFF", gray1: "#AAA", gray2: "#888", gray4: "#555" };

function Row({ icon, label, value, danger, onPress }: { icon: any; label: string; value?: string; danger?: boolean; onPress?: () => void }) {
  return (
    <Pressable style={s.row} onPress={onPress}>
      <Ionicons name={icon} size={20} color={danger ? "#FF3B30" : C.gray1} />
      <Text style={[s.rowLabel, danger && { color: "#FF3B30" }]}>{label}</Text>
      {value && <Text style={s.rowValue}>{value}</Text>}
      {!danger && <Ionicons name="chevron-forward" size={16} color={C.gray4} />}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      {title ? <Text style={s.sectionTitle}>{title}</Text> : null}
      <View style={s.sectionCard}>{children}</View>
    </View>
  );
}

// 미구현 기능 안내 — 공통 핸들러
function showComingSoon(label: string) {
  Alert.alert("준비 중", `"${label}" 기능은 곧 출시됩니다!`);
}

export default function SettingsScreen() {
  const { userProfile, channelInfo, lessonSchedule, isPremium, user, resetStore } = useAppStore();
  const router = useRouter();

  const handleDeleteAccount = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말 탈퇴하시겠어요?\n모든 데이터가 삭제되며 복구할 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "최종 확인",
              "탈퇴 후 채널과 학습 기록이 모두 삭제됩니다.",
              [
                { text: "취소", style: "cancel" },
                {
                  text: "확인",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      const currentUser = auth.currentUser;
                      if (currentUser) {
                        await deleteUserData(currentUser.uid);
                        await deleteUser(currentUser);
                      }
                      resetStore();
                      router.replace("/login");
                    } catch (err: any) {
                      if (err.code === "auth/requires-recent-login") {
                        Alert.alert(
                          "재로그인 필요",
                          "보안을 위해 로그아웃 후 다시 로그인한 뒤 탈퇴해주세요."
                        );
                      } else {
                        Alert.alert("오류", "탈퇴 처리 중 오류가 발생했습니다.");
                      }
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            // Google 세션도 함께 로그아웃 (로그인된 경우만)
            if (GoogleSignin.getCurrentUser()) {
              await GoogleSignin.signOut();
            }
          } catch {
            // Google signOut 실패해도 Firebase signOut 진행
          }
          await signOut(auth);
          resetStore();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.wrap} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>설정</Text>

        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={s.profileInitials}>{userProfile.name.trim().slice(0, 2).toUpperCase() || "ME"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{userProfile.name}</Text>
            <Text style={s.profileChannel}>{channelInfo.channelName}</Text>
            <View style={[s.planBadge, isPremium && { backgroundColor: C.red, borderWidth: 0 }]}>
              <Text style={[s.planText, isPremium && { color: C.white }]}>{isPremium ? "Premium" : "Free"}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.gray4} />
        </View>

        <Section title="채널 관리">
          <Row icon="person-outline" label="프로필 수정" onPress={() => router.push("/profile-edit")} />
          <Row icon="color-palette-outline" label="채널 스킨" value="기본" onPress={() => showComingSoon("채널 스킨")} />
          <Row icon="text-outline" label="채널명 변경" onPress={() => showComingSoon("채널명 변경")} />
        </Section>

        <Section title="수업 설정">
          <Row icon="calendar-outline" label="수업 스케줄" value={lessonSchedule.days.join("·")} onPress={() => showComingSoon("수업 스케줄")} />
          <Row icon="time-outline" label="수업 시간" value={lessonSchedule.timeSlots[0] || "-"} onPress={() => showComingSoon("수업 시간")} />
          <Row icon="language-outline" label="영어 레벨" value={userProfile.englishLevel} onPress={() => showComingSoon("영어 레벨")} />
        </Section>

        <Section title="구독 & 결제">
          <Row icon="card-outline" label="구독 관리" value={isPremium ? "Premium" : "Free"} onPress={() => router.push("/paywall")} />
          <Row icon="bag-outline" label="아이템 샵" onPress={() => showComingSoon("아이템 샵")} />
          <Row icon="receipt-outline" label="구매 내역" onPress={() => showComingSoon("구매 내역")} />
        </Section>

        <Section title="일반">
          <Row icon="notifications-outline" label="알림 설정" onPress={() => showComingSoon("알림 설정")} />
          <Row icon="shield-outline" label="개인정보 처리방침" onPress={() => showComingSoon("개인정보 처리방침")} />
          <Row icon="document-text-outline" label="서비스 이용약관" onPress={() => showComingSoon("서비스 이용약관")} />
          <Row icon="help-circle-outline" label="고객센터" onPress={() => showComingSoon("고객센터")} />
        </Section>

        <Section title="">
          <Row icon="log-out-outline" label="로그아웃" danger onPress={handleSignOut} />
          <Row icon="trash-outline" label="회원 탈퇴" danger onPress={handleDeleteAccount} />
        </Section>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  wrap: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  title: { color: C.white, fontSize: 22, fontWeight: "800", marginBottom: 24 },
  profileCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 20,
    flexDirection: "row", alignItems: "center", marginBottom: 16,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: C.red,
    alignItems: "center", justifyContent: "center", marginRight: 16,
  },
  profileInitials: { color: C.white, fontSize: 18, fontWeight: "800" },
  profileName: { color: C.white, fontSize: 16, fontWeight: "600" },
  profileChannel: { color: C.gray2, fontSize: 14, marginTop: 2 },
  planBadge: {
    alignSelf: "flex-start", borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 2, marginTop: 6,
    borderWidth: 1, borderColor: C.gray4,
  },
  planText: { fontSize: 11, fontWeight: "600", color: C.gray1 },
  sectionTitle: { color: C.gray2, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, paddingLeft: 4 },
  sectionCard: { backgroundColor: C.card, borderRadius: 16, paddingHorizontal: 16 },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.bg,
  },
  rowLabel: { flex: 1, color: C.white, fontSize: 14, marginLeft: 12 },
  rowValue: { color: C.gray2, fontSize: 14, marginRight: 8 },
});
