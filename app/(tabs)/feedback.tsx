import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

const C = { bg: "#0F0F0F", card: "#1A1A1A", white: "#FFF", gray1: "#AAA", gray2: "#888", gray4: "#555" };

export default function FeedbackScreen() {
  const { channelInfo } = useAppStore();
  const has = channelInfo.episodes.length > 0;

  const preview = [
    { label: "표현 사용 트래킹", value: "5개 중 ?/5" },
    { label: "WPM (분당 단어)", value: "측정 전" },
    { label: "개선 포인트", value: "5가지" },
    { label: "구독자 증가", value: "+100명" },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.wrap}>
        <Text style={s.title}>피드백</Text>

        {has ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>최근 수업 리포트</Text>
            <Text style={s.cardSub}>수업 리포트가 여기에 표시됩니다.</Text>
          </View>
        ) : (
          <View style={s.emptyWrap}>
            <View style={s.emptyIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={44} color={C.gray1} />
            </View>
            <Text style={s.emptyTitle}>아직 피드백이 없습니다</Text>
            <Text style={s.emptySub}>첫 수업을 완료하면{"\n"}상세한 피드백 리포트를 확인할 수 있어요</Text>

            <View style={s.previewCard}>
              <Text style={s.previewTitle}>피드백 리포트 미리보기</Text>
              {preview.map((item, i) => (
                <View key={i} style={s.previewRow}>
                  <Text style={s.previewLabel}>{item.label}</Text>
                  <Text style={s.previewValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  wrap: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  title: { color: C.white, fontSize: 22, fontWeight: "800", marginBottom: 24 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 20 },
  cardTitle: { color: C.white, fontSize: 16, fontWeight: "600", marginBottom: 12 },
  cardSub: { color: C.gray2, fontSize: 14 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.card, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emptyTitle: { color: C.white, fontSize: 18, fontWeight: "600", marginBottom: 8 },
  emptySub: { color: C.gray2, fontSize: 14, textAlign: "center", lineHeight: 20 },
  previewCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginTop: 32, width: "100%" },
  previewTitle: { color: C.gray2, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 },
  previewRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.bg },
  previewLabel: { color: C.gray2, fontSize: 14 },
  previewValue: { color: C.white, fontSize: 14, fontWeight: "500" },
});
