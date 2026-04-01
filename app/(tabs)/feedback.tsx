import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Platform, StatusBar } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppStore, type Episode } from "@/store/useAppStore";

const C = {
  bg: "#0F0F0F",
  card: "#1A1A1A",
  card2: "#222",
  border: "#2A2A2A",
  red: "#FF0000",
  white: "#FFF",
  gray1: "#AAA",
  gray2: "#888",
  gray3: "#666",
  gray4: "#555",
  orange: "#FF9800",
  green: "#4CAF50",
};

// ─── 피드백 상세 모달 ──────────────────────────────────

function FeedbackDetailModal({ episode, onClose }: { episode: Episode | null; onClose: () => void }) {
  // episode가 null이면 모달 닫힘
  const [localEp, setLocalEp] = useState<Episode | null>(null);
  useEffect(() => {
    if (episode) setLocalEp(episode);
  }, [episode]);

  const ep = episode ?? localEp;
  const fb = ep?.feedback;

  return (
    <Modal visible={!!episode} animationType="slide">
      <View style={[s.modalBg, { paddingTop: Platform.OS === "ios" ? 60 : (StatusBar.currentHeight ?? 40) + 10 }]}>
        {/* Header */}
        <View style={s.modalHeader}>
          <Pressable onPress={onClose} style={s.modalCloseBtn} hitSlop={16}>
            <Ionicons name="arrow-back" size={22} color={C.white} />
          </Pressable>
          <Text style={s.modalTitle}>수업 리포트</Text>
          <Pressable onPress={onClose} style={s.modalCloseBtn} hitSlop={16}>
            <Ionicons name="close" size={22} color={C.white} />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.modalScroll} showsVerticalScrollIndicator={false}>
          {/* Episode info */}
          <View style={s.modalEpInfo}>
            <Text style={s.modalEpEmoji}>{ep?.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.modalEpTitle}>{ep?.title}</Text>
              <Text style={s.modalEpMeta}>{ep?.date} · {ep?.durationMinutes}분</Text>
            </View>
          </View>

          {!fb ? (
            <View style={s.fbPending}>
              <Ionicons name="hourglass-outline" size={32} color={C.gray3} />
              <Text style={s.fbPendingText}>피드백 생성 중...</Text>
              <Text style={s.fbPendingSub}>잠시 후 다시 확인해주세요</Text>
            </View>
          ) : (
            <>
              {/* 총평 */}
              <View style={s.fbSection}>
                <View style={s.fbSectionHeader}>
                  <Ionicons name="chatbox-outline" size={16} color={C.orange} />
                  <Text style={s.fbSectionTitle}>총평</Text>
                </View>
                <Text style={s.fbSummary}>{fb.summary}</Text>
              </View>

              {/* 표현 사용 트래킹 */}
              <View style={s.fbSection}>
                <View style={s.fbSectionHeader}>
                  <Ionicons name="checkmark-done-outline" size={16} color={C.green} />
                  <Text style={s.fbSectionTitle}>표현 사용 트래킹</Text>
                </View>
                {fb.expressionTracking.map((et, i) => (
                  <View key={i} style={s.trackRow}>
                    <Text style={[s.trackIcon, { color: et.used ? C.green : C.red }]}>
                      {et.used ? "✅" : "⬜"}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.trackPhrase}>{et.phrase}</Text>
                      <Text style={s.trackNote}>{et.note}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* 에러 교정 / 개선 포인트 */}
              <View style={s.fbSection}>
                <View style={s.fbSectionHeader}>
                  <Ionicons name="construct-outline" size={16} color="#FF6B6B" />
                  <Text style={s.fbSectionTitle}>개선 포인트</Text>
                </View>
                {fb.corrections.map((c, i) => (
                  <View key={i} style={s.correctionRow}>
                    <Text style={s.correctionNum}>{i + 1}</Text>
                    <Text style={s.correctionText}>{c}</Text>
                  </View>
                ))}
              </View>

              {/* 어휘 제안 */}
              {fb.vocabularyTips.length > 0 && (
                <View style={s.fbSection}>
                  <View style={s.fbSectionHeader}>
                    <Ionicons name="book-outline" size={16} color="#64B5F6" />
                    <Text style={s.fbSectionTitle}>어휘 제안</Text>
                  </View>
                  {fb.vocabularyTips.map((tip, i) => (
                    <Text key={i} style={s.tipText}>• {tip}</Text>
                  ))}
                </View>
              )}

              {/* 패턴 제안 */}
              {fb.patternTips.length > 0 && (
                <View style={s.fbSection}>
                  <View style={s.fbSectionHeader}>
                    <Ionicons name="git-branch-outline" size={16} color="#CE93D8" />
                    <Text style={s.fbSectionTitle}>패턴/문법 팁</Text>
                  </View>
                  {fb.patternTips.map((tip, i) => (
                    <Text key={i} style={s.tipText}>• {tip}</Text>
                  ))}
                </View>
              )}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── 에피소드 리포트 카드 ──────────────────────────────

function EpisodeReport({ episode, isLatest, onPress }: { episode: Episode; isLatest: boolean; onPress: () => void }) {
  const expressionRate = episode.expressionsTotal > 0
    ? Math.round((episode.expressionsUsed / episode.expressionsTotal) * 100)
    : 0;

  const rateColor = expressionRate >= 80 ? C.green : expressionRate >= 50 ? C.orange : C.red;
  const hasFeedback = !!episode.feedback;

  return (
    <Pressable onPress={onPress} style={[s.reportCard, isLatest && s.reportCardHighlight]}>
      {isLatest && (
        <View style={s.latestBadge}>
          <Text style={s.latestBadgeText}>최근 수업</Text>
        </View>
      )}

      {/* 헤더 */}
      <View style={s.reportHeader}>
        <Text style={s.reportEmoji}>{episode.emoji}</Text>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.reportTitle} numberOfLines={1}>{episode.title}</Text>
          <Text style={s.reportDate}>{episode.date}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={s.reportDuration}>{episode.durationMinutes}분</Text>
          {hasFeedback && (
            <View style={s.fbBadge}>
              <Text style={s.fbBadgeText}>리포트</Text>
            </View>
          )}
        </View>
      </View>

      {/* 피드백 총평 미리보기 */}
      {episode.feedback?.summary && (
        <Text style={s.reportSummary} numberOfLines={2}>{episode.feedback.summary}</Text>
      )}

      {/* 핵심 지표 */}
      <View style={s.statsGrid}>
        <View style={s.statItem}>
          <View style={s.statIconRow}>
            <Ionicons name="chatbubble-outline" size={14} color={rateColor} />
            <Text style={[s.statValue, { color: rateColor }]}>
              {episode.expressionsUsed}/{episode.expressionsTotal}
            </Text>
          </View>
          <Text style={s.statLabel}>표현 사용</Text>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${expressionRate}%` as any, backgroundColor: rateColor }]} />
          </View>
        </View>

        <View style={s.statItem}>
          <View style={s.statIconRow}>
            <Ionicons name="call-outline" size={14} color={C.gray1} />
            <Text style={s.statValue}>{episode.durationMinutes}분</Text>
          </View>
          <Text style={s.statLabel}>통화 시간</Text>
          <View style={s.progressBg}>
            <View style={[s.progressFill, {
              width: `${Math.min((episode.durationMinutes / 10) * 100, 100)}%` as any,
              backgroundColor: C.gray2,
            }]} />
          </View>
        </View>
      </View>

      {/* 탭 유도 */}
      <View style={s.tapHint}>
        <Text style={s.tapHintText}>탭하여 상세 리포트 보기</Text>
        <Ionicons name="chevron-forward" size={14} color={C.gray4} />
      </View>
    </Pressable>
  );
}

// ─── 빈 상태 ──────────────────────────────────────────

function EmptyFeedback() {
  const preview = [
    { label: "표현 사용 트래킹", value: "5개 중 ?/5", icon: "chatbubble-outline" as const },
    { label: "통화 시간", value: "측정 전", icon: "call-outline" as const },
    { label: "구독자 증가", value: "+100명~", icon: "people-outline" as const },
  ];

  return (
    <View style={s.emptyWrap}>
      <View style={s.emptyIcon}>
        <Ionicons name="chatbubble-ellipses-outline" size={44} color={C.gray1} />
      </View>
      <Text style={s.emptyTitle}>아직 피드백이 없습니다</Text>
      <Text style={s.emptySub}>첫 수업을 완료하면{"\n"}상세한 피드백 리포트를 확인할 수 있어요</Text>

      <View style={s.previewCard}>
        <Text style={s.previewTitle}>피드백 리포트 미리보기</Text>
        {preview.map((item, i) => (
          <View key={i} style={[s.previewRow, i === preview.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name={item.icon} size={16} color={C.gray3} />
              <Text style={s.previewLabel}>{item.label}</Text>
            </View>
            <Text style={s.previewValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── 요약 통계 ────────────────────────────────────────

function SummaryStats({ episodes }: { episodes: Episode[] }) {
  const totalMinutes = episodes.reduce((s, e) => s + e.durationMinutes, 0);
  const avgExpRate = episodes.length > 0
    ? Math.round(episodes.reduce((s, e) =>
        s + (e.expressionsTotal > 0 ? e.expressionsUsed / e.expressionsTotal : 0), 0
      ) / episodes.length * 100)
    : 0;

  return (
    <View style={s.summaryRow}>
      <View style={s.summaryItem}>
        <Text style={s.summaryValue}>{episodes.length}</Text>
        <Text style={s.summaryLabel}>총 에피소드</Text>
      </View>
      <View style={s.summaryDivider} />
      <View style={s.summaryItem}>
        <Text style={s.summaryValue}>{totalMinutes}분</Text>
        <Text style={s.summaryLabel}>누적 통화</Text>
      </View>
      <View style={s.summaryDivider} />
      <View style={s.summaryItem}>
        <Text style={[s.summaryValue, { color: avgExpRate >= 70 ? C.green : C.orange }]}>
          {avgExpRate}%
        </Text>
        <Text style={s.summaryLabel}>평균 표현율</Text>
      </View>
    </View>
  );
}

// ─── 광고 배너 플레이스홀더 ────────────────────────────

function AdBanner({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <View style={s.adWrap}>
      <View style={s.adBanner}>
        <View style={s.adLabel}>
          <Text style={s.adLabelText}>광고</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.adTitle}>브이로거 프리미엄으로 광고 없애기</Text>
          <Text style={s.adSub}>월 ₩6,658 · 연간 구독 시</Text>
        </View>
        <Pressable style={s.adBtn} onPress={onUpgrade}>
          <Text style={s.adBtnText}>업그레이드</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main ────────────────────────────────────────────

export default function FeedbackScreen() {
  const { channelInfo, isPremium } = useAppStore();
  const router = useRouter();
  const params = useLocalSearchParams<{ episodeId?: string }>();
  const episodes = channelInfo.episodes;
  const hasEpisodes = episodes.length > 0;

  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  // 에피소드 상세에서 직접 이동한 경우 자동 오픈
  useEffect(() => {
    if (params.episodeId) {
      const ep = episodes.find((e) => e.id === params.episodeId);
      if (ep) setSelectedEpisode(ep);
    }
  }, [params.episodeId]);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>피드백</Text>

        {hasEpisodes ? (
          <>
            <SummaryStats episodes={episodes} />
            <Text style={s.sectionTitle}>수업 기록</Text>
            {episodes.map((ep, i) => (
              <EpisodeReport
                key={ep.id}
                episode={ep}
                isLatest={i === 0}
                onPress={() => setSelectedEpisode(ep)}
              />
            ))}
          </>
        ) : (
          <EmptyFeedback />
        )}

        {!isPremium && (
          <AdBanner onUpgrade={() => router.push("/paywall")} />
        )}
      </ScrollView>

      <FeedbackDetailModal
        episode={selectedEpisode}
        onClose={() => setSelectedEpisode(null)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  title: { color: C.white, fontSize: 22, fontWeight: "800", marginBottom: 20 },
  sectionTitle: { color: C.gray2, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12, marginTop: 8 },

  // 요약
  summaryRow: { flexDirection: "row", backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 24 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { color: C.white, fontSize: 20, fontWeight: "700", marginBottom: 4 },
  summaryLabel: { color: C.gray2, fontSize: 12 },
  summaryDivider: { width: 1, backgroundColor: C.border, marginHorizontal: 12 },

  // 에피소드 리포트
  reportCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  reportCardHighlight: { borderColor: C.red },
  latestBadge: { backgroundColor: C.red, alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10 },
  latestBadgeText: { color: C.white, fontSize: 11, fontWeight: "700" },
  reportHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  reportEmoji: { fontSize: 28 },
  reportTitle: { color: C.white, fontSize: 14, fontWeight: "600" },
  reportDate: { color: C.gray3, fontSize: 12, marginTop: 2 },
  reportDuration: { color: C.gray2, fontSize: 13 },
  reportSummary: { color: C.gray2, fontSize: 12, lineHeight: 18, marginBottom: 10, paddingLeft: 2 },
  fbBadge: { backgroundColor: C.green + "20", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  fbBadgeText: { color: C.green, fontSize: 10, fontWeight: "700" },

  // 통계 그리드
  statsGrid: { flexDirection: "row", gap: 12 },
  statItem: { flex: 1 },
  statIconRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  statValue: { color: C.white, fontSize: 15, fontWeight: "700" },
  statLabel: { color: C.gray3, fontSize: 11, marginBottom: 6 },
  progressBg: { height: 4, backgroundColor: C.border, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },

  // 탭 유도
  tapHint: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.bg },
  tapHintText: { color: C.gray4, fontSize: 11 },

  // 빈 상태
  emptyWrap: { flex: 1, alignItems: "center", paddingTop: 40 },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.card, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emptyTitle: { color: C.white, fontSize: 18, fontWeight: "600", marginBottom: 8 },
  emptySub: { color: C.gray2, fontSize: 14, textAlign: "center", lineHeight: 20 },
  previewCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginTop: 32, width: "100%", borderWidth: 1, borderColor: C.border },
  previewTitle: { color: C.gray2, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 },
  previewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.bg },
  previewLabel: { color: C.gray2, fontSize: 14 },
  previewValue: { color: C.white, fontSize: 14, fontWeight: "500" },

  // 광고 배너
  adWrap: { marginTop: 24 },
  adBanner: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card2, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: C.border,
    gap: 10,
  },
  adLabel: {
    backgroundColor: C.border, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2, alignSelf: "flex-start",
  },
  adLabelText: { color: C.gray3, fontSize: 9, fontWeight: "700" },
  adTitle: { color: C.gray1, fontSize: 13, fontWeight: "600" },
  adSub: { color: C.gray3, fontSize: 11, marginTop: 2 },
  adBtn: {
    backgroundColor: C.red, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7,
  },
  adBtnText: { color: C.white, fontSize: 12, fontWeight: "700" },

  // ─── 피드백 상세 모달 ──────────────────────────────
  modalBg: { flex: 1, backgroundColor: C.bg },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#151515",
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  modalCloseBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#333", alignItems: "center", justifyContent: "center",
  },
  modalTitle: { color: C.white, fontSize: 16, fontWeight: "700" },
  modalScroll: { paddingHorizontal: 20, paddingTop: 20 },

  modalEpInfo: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  modalEpEmoji: { fontSize: 36 },
  modalEpTitle: { color: C.white, fontSize: 16, fontWeight: "700" },
  modalEpMeta: { color: C.gray2, fontSize: 13, marginTop: 2 },

  fbPending: { alignItems: "center", paddingVertical: 40, gap: 8 },
  fbPendingText: { color: C.gray2, fontSize: 16, fontWeight: "600" },
  fbPendingSub: { color: C.gray3, fontSize: 13 },

  fbSection: { marginBottom: 24 },
  fbSectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  fbSectionTitle: { color: C.white, fontSize: 15, fontWeight: "700" },
  fbSummary: { color: C.gray1, fontSize: 14, lineHeight: 22, backgroundColor: C.card, borderRadius: 12, padding: 14 },

  // 표현 트래킹
  trackRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  trackIcon: { fontSize: 16, marginTop: 1 },
  trackPhrase: { color: C.white, fontSize: 14, fontWeight: "600" },
  trackNote: { color: C.gray2, fontSize: 12, marginTop: 2 },

  // 에러 교정
  correctionRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  correctionNum: { color: C.gray3, fontSize: 13, fontWeight: "700", width: 18, textAlign: "center", marginTop: 1 },
  correctionText: { flex: 1, color: C.gray1, fontSize: 13, lineHeight: 20 },

  // 팁
  tipText: { color: C.gray1, fontSize: 13, lineHeight: 20, marginBottom: 6 },
});
