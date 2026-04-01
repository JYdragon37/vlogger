import { useState, useMemo } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore, type ExpressionItem } from "@/store/useAppStore";

const C = {
  bg: "#0F0F0F", card: "#1A1A1A", card2: "#222",
  red: "#FF0000", white: "#FFF", gray1: "#CCC", gray2: "#888", gray4: "#555",
  green: "#4CAF50",
};

// 배열 랜덤 셔플
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── 플립 카드 ────────────────────────────────────────────

function ReviewCard({ item, index, total }: {
  item: ExpressionItem & { episodeTitle: string };
  index: number;
  total: number;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <View style={s.cardWrapper}>
      {/* 진행 표시 */}
      <Text style={s.progress}>{index + 1} / {total}</Text>

      <Pressable style={[s.card, flipped && s.cardFlipped]} onPress={() => setFlipped(!flipped)}>
        {!flipped ? (
          // 앞면: 한국어
          <View style={s.cardContent}>
            <View style={s.sideTag}>
              <Text style={s.sideTagText}>한국어로 뜻 확인</Text>
            </View>

            <View style={s.frontSection}>
              <Text style={s.frontLabel}>표현 설명</Text>
              <Text style={s.frontMain}>{item.nuance}</Text>
            </View>

            {item.meaning ? (
              <View style={[s.frontSection, { marginTop: 20, borderTopWidth: 1, borderTopColor: "#2A2A2A", paddingTop: 20 }]}>
                <Text style={s.frontLabel}>예문 해석</Text>
                <Text style={s.frontSub}>{item.meaning}</Text>
              </View>
            ) : null}

            <View style={s.tapHint}>
              <Ionicons name="sync" size={14} color={C.gray4} />
              <Text style={s.tapHintText}>탭해서 영어 확인</Text>
            </View>
          </View>
        ) : (
          // 뒷면: 영어
          <View style={s.cardContent}>
            <View style={[s.sideTag, s.sideTagBack]}>
              <Text style={[s.sideTagText, { color: C.green }]}>영어로 확인</Text>
            </View>

            <View style={s.backSection}>
              <Text style={s.backLabel}>표현</Text>
              <Text style={s.backPhrase}>{item.phrase}</Text>
            </View>

            {item.example ? (
              <View style={[s.backSection, { marginTop: 20, borderTopWidth: 1, borderTopColor: "#1A3A1A", paddingTop: 20 }]}>
                <Text style={s.backLabel}>예문</Text>
                <Text style={s.backExample}>{item.example.replace(/\*\*/g, "")}</Text>
              </View>
            ) : null}

            <View style={s.tapHint}>
              <Ionicons name="sync" size={14} color={C.gray4} />
              <Text style={s.tapHintText}>탭해서 한국어 확인</Text>
            </View>
          </View>
        )}
      </Pressable>

      <Text style={s.episodeTag} numberOfLines={1}>from: {item.episodeTitle}</Text>
    </View>
  );
}

// ─── 복습 탭 ──────────────────────────────────────────────

export default function ReviewScreen() {
  const { channelInfo } = useAppStore();
  const [shuffleKey, setShuffleKey] = useState(0);

  // 모든 에피소드에서 표현 추출 + 셔플
  const allExpressions = useMemo(() => {
    const items: (ExpressionItem & { episodeTitle: string })[] = [];
    channelInfo.episodes.forEach((ep) => {
      (ep.expressions ?? []).forEach((expr) => {
        items.push({ ...expr, episodeTitle: ep.title });
      });
    });
    return shuffle(items);
  // shuffleKey 바뀔 때마다 재셔플
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelInfo.episodes, shuffleKey]);

  const isEmpty = allExpressions.length === 0;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>복습</Text>
        {!isEmpty && (
          <Pressable style={s.reshuffleBtn} onPress={() => setShuffleKey((k) => k + 1)}>
            <Ionicons name="shuffle" size={18} color={C.gray2} />
            <Text style={s.reshuffleText}>섞기</Text>
          </Pressable>
        )}
      </View>

      {isEmpty ? (
        // 표현 없음 상태
        <View style={s.emptyState}>
          <Text style={s.emptyEmoji}>📚</Text>
          <Text style={s.emptyTitle}>아직 배운 표현이 없어요</Text>
          <Text style={s.emptySub}>수업을 완료하면{"\n"}여기서 복습할 수 있어요</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.countText}>총 {allExpressions.length}개 표현</Text>
          {allExpressions.map((item, i) => (
            <ReviewCard key={`${shuffleKey}-${i}`} item={item} index={i} total={allExpressions.length} />
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "#1A1A1A",
  },
  title: { color: C.white, fontSize: 22, fontWeight: "800" },
  reshuffleBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  reshuffleText: { color: C.gray2, fontSize: 14, fontWeight: "600" },

  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  countText: { color: C.gray4, fontSize: 13, marginBottom: 16 },

  cardWrapper: { marginBottom: 28 },
  progress: { color: C.gray4, fontSize: 12, fontWeight: "600", marginBottom: 8, textAlign: "right" },

  card: {
    backgroundColor: C.card, borderRadius: 20,
    borderWidth: 1, borderColor: "#2A2A2A",
    minHeight: 220,
  },
  cardFlipped: {
    backgroundColor: "#0D1A0D", borderColor: "#1A3A1A",
  },
  cardContent: {
    padding: 24, flex: 1, justifyContent: "space-between",
  },

  sideTag: {
    alignSelf: "flex-start",
    backgroundColor: "#2A2A2A", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 20,
  },
  sideTagBack: { backgroundColor: "#0A2A0A" },
  sideTagText: { color: C.gray2, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  frontSection: {},
  frontLabel: { color: C.gray4, fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 8 },
  frontMain: { color: C.white, fontSize: 17, fontWeight: "600", lineHeight: 26 },
  frontSub: { color: C.gray1, fontSize: 15, lineHeight: 24 },

  backSection: {},
  backLabel: { color: "#4CAF50" + "AA", fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 8 },
  backPhrase: { color: C.white, fontSize: 22, fontWeight: "800", letterSpacing: 0.3 },
  backExample: { color: "#AAC8AA", fontSize: 15, lineHeight: 24 },

  tapHint: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginTop: 24, justifyContent: "center",
  },
  tapHintText: { color: C.gray4, fontSize: 12 },

  episodeTag: {
    color: C.gray4, fontSize: 11, marginTop: 8, paddingHorizontal: 4,
  },

  // Empty state
  emptyState: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: C.white, fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptySub: { color: C.gray2, fontSize: 14, textAlign: "center", lineHeight: 22 },
});
