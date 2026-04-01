import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";

const C = {
  bg: "#0F0F0F",
  card: "#1A1A1A",
  border: "#2A2A2A",
  red: "#FF0000",
  white: "#FFF",
  gray1: "#AAA",
  gray2: "#888",
  gray3: "#666",
  gold: "#FFD700",
  green: "#4CAF50",
};

type Plan = "monthly" | "annual";

const PLANS: Record<Plan, { label: string; price: string; sub: string; badge?: string }> = {
  monthly: { label: "월간", price: "₩9,900", sub: "매월 결제" },
  annual: { label: "연간", price: "₩79,900", sub: "월 ₩6,658 · 연 1회 결제", badge: "2개월 무료" },
};

const FEATURES: { icon: string; label: string; free: boolean }[] = [
  { icon: "megaphone-outline", label: "광고 없는 수업 환경", free: false },
  { icon: "book-outline", label: "무제한 표현 학습 세트", free: false },
  { icon: "mic-outline", label: "AI 발음 피드백 리포트", free: false },
  { icon: "notifications-outline", label: "수업 스케줄 알림", free: false },
  { icon: "trophy-outline", label: "프리미엄 채널 배지", free: false },
  { icon: "chatbubble-outline", label: "기본 전화영어 수업", free: true },
  { icon: "bar-chart-outline", label: "기본 학습 피드백", free: true },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { isPremium, setIsPremium } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("annual");
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    // TODO: RevenueCat SDK 연동 시 실제 구매 로직으로 교체
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // 구매 딜레이 시뮬레이션
    setIsPremium(true);
    setIsLoading(false);
    Alert.alert(
      "구독 완료!",
      "브이로거 프리미엄이 시작되었습니다.\n광고 없이 수업을 즐겨보세요.",
      [{ text: "확인", onPress: () => router.back() }]
    );
  };

  const handleRestore = () => {
    // TODO: RevenueCat restorePurchases() 연동
    Alert.alert("구매 복원", "이전 구매 내역을 확인 중입니다...\n(준비 중)");
  };

  if (isPremium) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.alreadyWrap}>
          <Pressable style={s.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={C.gray1} />
          </Pressable>
          <View style={s.premiumIcon}>
            <Ionicons name="trophy" size={40} color={C.gold} />
          </View>
          <Text style={s.alreadyTitle}>이미 프리미엄 회원입니다</Text>
          <Text style={s.alreadySub}>모든 기능을 제한 없이 사용할 수 있어요</Text>
          <Pressable style={s.closeFullBtn} onPress={() => router.back()}>
            <Text style={s.closeFullText}>확인</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* 닫기 버튼 */}
      <Pressable style={s.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={22} color={C.gray1} />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* 헤더 */}
        <View style={s.header}>
          <View style={s.premiumBadge}>
            <Ionicons name="trophy" size={16} color={C.gold} />
            <Text style={s.premiumBadgeText}>PREMIUM</Text>
          </View>
          <Text style={s.heroTitle}>브이로거 프리미엄</Text>
          <Text style={s.heroSub}>광고 없이, 제한 없이{"\n"}나만의 영어 채널을 키워보세요</Text>
        </View>

        {/* 플랜 선택 */}
        <View style={s.planRow}>
          {(Object.entries(PLANS) as [Plan, (typeof PLANS)[Plan]][]).map(([key, plan]) => (
            <Pressable
              key={key}
              style={[s.planCard, selectedPlan === key && s.planCardSelected]}
              onPress={() => setSelectedPlan(key)}
            >
              {plan.badge && (
                <View style={s.planBadge}>
                  <Text style={s.planBadgeText}>{plan.badge}</Text>
                </View>
              )}
              <View style={[s.planRadio, selectedPlan === key && s.planRadioSelected]}>
                {selectedPlan === key && <View style={s.planRadioDot} />}
              </View>
              <Text style={[s.planLabel, selectedPlan === key && { color: C.white }]}>{plan.label}</Text>
              <Text style={[s.planPrice, selectedPlan === key && { color: C.white }]}>{plan.price}</Text>
              <Text style={s.planSub}>{plan.sub}</Text>
            </Pressable>
          ))}
        </View>

        {/* 혜택 리스트 */}
        <View style={s.featuresCard}>
          <Text style={s.featuresTitle}>포함된 기능</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <View style={[s.featureCheck, f.free && s.featureCheckFree]}>
                <Ionicons name="checkmark" size={12} color={f.free ? C.gray2 : C.white} />
              </View>
              <Ionicons name={f.icon as any} size={16} color={f.free ? C.gray2 : C.gray1} style={{ marginRight: 10 }} />
              <Text style={[s.featureLabel, f.free && s.featureLabelFree]}>{f.label}</Text>
              {!f.free && (
                <View style={s.premiumOnlyBadge}>
                  <Text style={s.premiumOnlyText}>Premium</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* 하단 CTA */}
      <View style={s.footer}>
        <Pressable
          style={[s.ctaBtn, isLoading && { opacity: 0.6 }]}
          onPress={handlePurchase}
          disabled={isLoading}
        >
          <Text style={s.ctaText}>
            {isLoading ? "처리 중..." : `${PLANS[selectedPlan].price}로 시작하기`}
          </Text>
        </Pressable>

        <Pressable style={s.restoreBtn} onPress={handleRestore}>
          <Text style={s.restoreText}>구매 복원</Text>
        </Pressable>

        <Text style={s.legal}>
          구독은 App Store 계정으로 청구됩니다. 구독 갱신 24시간 전에 자동 갱신됩니다.
          설정 &gt; Apple ID에서 언제든지 취소할 수 있습니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  closeBtn: {
    position: "absolute", top: 56, right: 20, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.card, alignItems: "center", justifyContent: "center",
  },

  // 헤더
  header: { alignItems: "center", paddingTop: 32, paddingBottom: 28 },
  premiumBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#2A2200", borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 5, marginBottom: 16,
    borderWidth: 1, borderColor: "#554400",
  },
  premiumBadgeText: { color: C.gold, fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  heroTitle: { color: C.white, fontSize: 26, fontWeight: "800", marginBottom: 10 },
  heroSub: { color: C.gray1, fontSize: 15, textAlign: "center", lineHeight: 22 },

  // 플랜
  planRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  planCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: C.border, alignItems: "flex-start",
  },
  planCardSelected: { borderColor: C.red, backgroundColor: "#1A0000" },
  planBadge: {
    backgroundColor: C.red, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, marginBottom: 10, alignSelf: "flex-start",
  },
  planBadgeText: { color: C.white, fontSize: 10, fontWeight: "700" },
  planRadio: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.gray3,
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  planRadioSelected: { borderColor: C.red },
  planRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.red },
  planLabel: { color: C.gray2, fontSize: 13, fontWeight: "600", marginBottom: 4 },
  planPrice: { color: C.gray1, fontSize: 18, fontWeight: "800", marginBottom: 4 },
  planSub: { color: C.gray3, fontSize: 11, lineHeight: 16 },

  // 혜택
  featuresCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.border },
  featuresTitle: { color: C.gray2, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  featureCheck: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: C.red,
    alignItems: "center", justifyContent: "center", marginRight: 10,
  },
  featureCheckFree: { backgroundColor: C.border },
  featureLabel: { flex: 1, color: C.white, fontSize: 14 },
  featureLabelFree: { color: C.gray2 },
  premiumOnlyBadge: {
    backgroundColor: "#1A0000", borderRadius: 4, borderWidth: 1, borderColor: "#440000",
    paddingHorizontal: 5, paddingVertical: 1,
  },
  premiumOnlyText: { color: C.red, fontSize: 9, fontWeight: "700" },

  // 하단 CTA
  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 12, backgroundColor: C.bg },
  ctaBtn: {
    backgroundColor: C.red, borderRadius: 16, paddingVertical: 16,
    alignItems: "center", marginBottom: 10,
  },
  ctaText: { color: C.white, fontSize: 16, fontWeight: "800" },
  restoreBtn: { alignItems: "center", paddingVertical: 8 },
  restoreText: { color: C.gray2, fontSize: 13 },
  legal: { color: C.gray3, fontSize: 10, textAlign: "center", lineHeight: 14, marginTop: 8 },

  // 이미 프리미엄
  alreadyWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  premiumIcon: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: "#2A2200",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  alreadyTitle: { color: C.white, fontSize: 20, fontWeight: "700", marginBottom: 10 },
  alreadySub: { color: C.gray2, fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 32 },
  closeFullBtn: {
    backgroundColor: C.card, borderRadius: 14, paddingVertical: 14,
    paddingHorizontal: 40, borderWidth: 1, borderColor: C.border,
  },
  closeFullText: { color: C.white, fontSize: 15, fontWeight: "600" },
});
