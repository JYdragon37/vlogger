import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { auth } from "@/lib/firebase";
import { useAppStore } from "@/store/useAppStore";

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

export default function SettingsScreen() {
  const { userProfile, channelInfo, isPremium } = useAppStore();
  const router = useRouter();

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
            <Text style={s.profileInitials}>JW</Text>
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
          <Row icon="person-outline" label="프로필 수정" value={isPremium ? "무제한" : "월 1회"} />
          <Row icon="color-palette-outline" label="채널 스킨" value="기본" />
          <Row icon="text-outline" label="채널명 변경" />
        </Section>

        <Section title="수업 설정">
          <Row icon="calendar-outline" label="수업 스케줄" value="월·수·금" />
          <Row icon="time-outline" label="수업 시간" value="07:00" />
          <Row icon="language-outline" label="영어 레벨" value={userProfile.englishLevel} />
        </Section>

        <Section title="구독 & 결제">
          <Row icon="card-outline" label="구독 관리" value={isPremium ? "Premium" : "Free"} />
          <Row icon="bag-outline" label="아이템 샵" />
          <Row icon="receipt-outline" label="구매 내역" />
        </Section>

        <Section title="일반">
          <Row icon="notifications-outline" label="알림 설정" />
          <Row icon="shield-outline" label="개인정보 처리방침" />
          <Row icon="document-text-outline" label="서비스 이용약관" />
          <Row icon="help-circle-outline" label="고객센터" />
        </Section>

        <Section title="">
          <Row icon="log-out-outline" label="로그아웃" danger onPress={handleSignOut} />
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
