import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import RAnimated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  Easing,
} from "react-native-reanimated";
import { useState } from "react";
import { useAppStore, type Episode } from "@/store/useAppStore";

const AnimatedTextInput = RAnimated.createAnimatedComponent(TextInput);

function formatSubsWorklet(n: number): string {
  "worklet";
  const v = Math.round(n);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return `${v}`;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 10;
const CARD_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

// ─── Colors ──────────────────────────────────────────────

const C = {
  bg: "#0F0F0F",
  card: "#1A1A1A",
  card2: "#1E1E1E",
  card3: "#2A2A2A",
  border: "#222",
  red: "#FF0000",
  white: "#FFFFFF",
  gray1: "#AAA",
  gray2: "#888",
  gray3: "#666",
  gray4: "#555",
  gray5: "#444",
  gray6: "#333",
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
};

// ─── Subscriber Formatter ────────────────────────────────

function formatSubs(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

// ─── Mini Line Chart (순수 View 기반, react-native-svg 불필요) ──

function MiniLineChart({ data, width = 80, height = 36 }: { data: number[]; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;
  const innerH = height - pad * 2;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: pad + innerH - ((v - min) / range) * innerH,
  }));

  const lineColor = "#FFFFFF";

  return (
    <View style={{ width, height, position: "relative" }}>
      {pts.slice(1).map((p, i) => {
        const prev = pts[i];
        const dx = p.x - prev.x;
        const dy = p.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const mx = (prev.x + p.x) / 2;
        const my = (prev.y + p.y) / 2;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: mx - len / 2,
              top: my - 1,
              width: len,
              height: 1.5,
              backgroundColor: lineColor,
              opacity: 0.5,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}
      {/* 마지막 점만 표시 */}
      <View
        style={{
          position: "absolute",
          left: pts[pts.length - 1].x - 3,
          top: pts[pts.length - 1].y - 3,
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: lineColor,
          opacity: 0.9,
        }}
      />
    </View>
  );
}

// ─── Creator Badge (next to avatar) ─────────────────────

function CreatorBadge({ badge }: { badge: string }) {
  if (badge === "none") return null;
  const map: Record<string, { color: string; label: string }> = {
    bronze: { color: C.bronze, label: "BRONZE" },
    silver: { color: C.silver, label: "SILVER" },
    gold: { color: C.gold, label: "GOLD" },
  };
  const c = map[badge];
  if (!c) return null;
  return (
    <View style={[s.row, s.center, { backgroundColor: c.color + "25", borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 }]}>
      <Ionicons name="trophy" size={13} color={c.color} />
      <Text style={{ color: c.color, fontSize: 11, fontWeight: "800", marginLeft: 5, letterSpacing: 1 }}>
        {c.label}
      </Text>
    </View>
  );
}

// ─── Badge Milestones ───────────────────────────────────

function BadgeMilestones({ subscriberCount, badge }: { subscriberCount: number; badge: string }) {
  const milestones = [
    { key: "bronze", label: "Bronze", target: 10_000, color: C.bronze },
    { key: "silver", label: "Silver", target: 100_000, color: C.silver },
    { key: "gold", label: "Gold", target: 1_000_000, color: C.gold },
  ];
  const order = ["none", "bronze", "silver", "gold"];
  const idx = order.indexOf(badge);

  return (
    <View style={[s.milestoneBox]}>
      <Text style={s.milestoneTitle}>CREATOR BUTTON</Text>
      <View style={s.milestoneRow}>
        {milestones.map((m) => {
          const achieved = order.indexOf(m.key) <= idx;
          const progress = Math.min(subscriberCount / m.target, 1);
          const isCurrent = order.indexOf(m.key) === idx + 1;
          return (
            <View key={m.key} style={s.milestoneItem}>
              <View
                style={[
                  s.milestoneCircle,
                  {
                    backgroundColor: achieved ? m.color + "25" : C.card3,
                    borderWidth: isCurrent ? 2 : achieved ? 1.5 : 1,
                    borderColor: achieved ? m.color : isCurrent ? m.color + "60" : C.gray6,
                  },
                ]}
              >
                <Ionicons name={achieved ? "trophy" : "trophy-outline"} size={20} color={achieved ? m.color : C.gray4} />
              </View>
              <Text style={[s.milestoneLabel, { color: achieved ? m.color : C.gray4 }]}>{m.label}</Text>
              <Text style={s.milestoneSub}>{formatSubs(m.target)}</Text>
              {achieved ? (
                <Ionicons name="checkmark-circle" size={14} color={m.color} style={{ marginTop: 4 }} />
              ) : (
                <View style={s.progressTrack}>
                  <View style={[s.progressBar, { width: `${progress * 100}%` as any, backgroundColor: m.color + "80" }]} />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Episode Card ───────────────────────────────────────

const THUMB_COLORS = ["#1A0D0D", "#0D1A0D", "#0D0D1A", "#1A1A0D", "#0D1A1A", "#1A0D1A"];

function thumbColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return THUMB_COLORS[hash % THUMB_COLORS.length];
}

function EpisodeCard({ episode }: { episode: Episode }) {
  const router = useRouter();
  const { removeEpisode } = useAppStore();

  const handleDelete = () => {
    Alert.alert("에피소드 삭제", `"${episode.title}" 에피소드를 삭제할까요?`, [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => removeEpisode(episode.id) },
    ]);
  };

  return (
    <Pressable
      style={{ width: CARD_WIDTH, marginBottom: 14 }}
      onPress={() => router.push(`/episode/${episode.id}` as any)}
      onLongPress={handleDelete}
    >
      {/* Thumbnail */}
      <View style={[s.thumbWrap, { height: CARD_WIDTH * 0.56 }]}>
        <View style={[s.thumbInner, { backgroundColor: thumbColor(episode.id) }]}>
          <Text style={{ fontSize: 36 }}>{episode.emoji}</Text>
        </View>
        {/* Overlay scrim */}
        <View style={s.thumbScrim} />
        {/* HIT 배지 */}
        {episode.hitAchieved && (
          <View style={s.hitBadge}>
            <Text style={s.hitBadgeText}>🔥 HOT</Text>
          </View>
        )}
        {/* Duration badge */}
        <View style={s.durationBadge}>
          <Text style={s.durationText}>{episode.durationMinutes}min</Text>
        </View>
        {/* Series badge */}
        {episode.seriesName && episode.seriesOrder && episode.seriesTotal && (
          <View style={s.seriesBadge}>
            <Text style={s.seriesText}>{episode.seriesOrder}/{episode.seriesTotal}</Text>
          </View>
        )}
      </View>
      {/* Info */}
      <View style={{ paddingTop: 8, paddingHorizontal: 2 }}>
        <Text style={s.epTitle} numberOfLines={2}>{episode.title}</Text>
        <View style={[s.row, { marginTop: 4, alignItems: "center" }]}>
          <Text style={s.epMeta}>{episode.date}</Text>
          <View style={s.dot} />
          <Text style={s.epMeta}>{episode.expressionsUsed}/{episode.expressionsTotal} expressions</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Empty State ────────────────────────────────────────

function EpisodeEmptyState() {
  return (
    <View style={[s.center, { paddingVertical: 60, paddingHorizontal: 32 }]}>
      <View style={[s.center, { width: 80, height: 80, borderRadius: 16, backgroundColor: C.card2, marginBottom: 16 }]}>
        <Ionicons name="videocam-outline" size={36} color={C.gray5} />
      </View>
      <Text style={{ color: C.gray2, fontSize: 16, fontWeight: "600", marginBottom: 8 }}>아직 에피소드가 없습니다</Text>
      <Text style={{ color: C.gray4, fontSize: 14, textAlign: "center", lineHeight: 20 }}>
        첫 수업을 완료하면 에피소드가{"\n"}채널에 자동으로 추가됩니다
      </Text>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────

const EPISODES_PREVIEW = 6;

export default function ChannelHomeScreen() {
  const { userProfile, channelInfo } = useAppStore();
  const [showAll, setShowAll] = useState(false);
  const tags = [userProfile.job, userProfile.location, ...(userProfile.hobbies.length > 0 ? [userProfile.hobbies[0] + " lover"] : [])].filter(Boolean).join(" · ");

  // 구독자 카운터 애니메이션 — subscriberCount 변화 시 부드럽게 증가
  const subCounter = useSharedValue(channelInfo.subscriberCount);
  useEffect(() => {
    subCounter.value = withTiming(channelInfo.subscriberCount, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [channelInfo.subscriberCount]);

  const animatedSubProps = useAnimatedProps(() => ({
    text: formatSubsWorklet(subCounter.value),
    defaultValue: formatSubsWorklet(subCounter.value),
  } as any));

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ═══ BANNER ═══ */}
        <View style={s.bannerWrap}>
          {/* 배경 */}
          <View style={StyleSheet.absoluteFill}>
            <View style={s.bannerBase} />
            {/* 추상 도형 */}
            <View style={s.bannerCircle1} />
            <View style={s.bannerCircle2} />
            <View style={s.bannerCircle3} />
            <View style={s.bannerLine} />
          </View>
          {/* CHANNEL ART 레이블 */}
          <View style={s.bannerArtLabel}>
            <Text style={s.bannerArtText}>CHANNEL ART</Text>
          </View>
          <Pressable
            style={s.menuBtn}
            onPress={() => Alert.alert("채널 메뉴", "채널 커스터마이징 기능은 곧 출시됩니다!")}
          >
            <Ionicons name="ellipsis-vertical" size={18} color={C.gray1} />
          </Pressable>
        </View>

        {/* ═══ PROFILE ═══ */}
        <View style={s.profileWrap}>
          {/* Avatar row */}
          <View style={[s.row, { alignItems: "flex-end" }]}>
            <View style={s.avatar}>
              {userProfile.avatarIconName ? (
                <Ionicons name={userProfile.avatarIconName as any} size={34} color={C.white} />
              ) : (
                <Text style={s.avatarText}>{userProfile.name.trim().slice(0, 2).toUpperCase() || "ME"}</Text>
              )}
            </View>
            <View style={{ marginLeft: 12, marginBottom: 4 }}>
              <CreatorBadge badge={channelInfo.badge} />
            </View>
          </View>

          {/* Channel name */}
          <Text style={s.channelName}>{channelInfo.channelName}</Text>
          <View style={[s.row, { marginTop: 4, alignItems: "center" }]}>
            <Text style={s.handleText}>{userProfile.channelHandle}</Text>
            <View style={[s.dot, { marginHorizontal: 8 }]} />
            <Text style={s.handleText}>{tags}</Text>
          </View>

          {/* Subscriber count — BIG (Reanimated 카운터) */}
          <View style={[s.row, { marginTop: 16, alignItems: "center" }]}>
            <View style={[s.row, { alignItems: "baseline" }]}>
              <AnimatedTextInput
                style={s.subCount}
                editable={false}
                animatedProps={animatedSubProps}
              />
              <Text style={s.subLabel}>subscribers</Text>
            </View>
            {channelInfo.subscriberHistory && channelInfo.subscriberHistory.length >= 2 && (
              <View style={{ marginLeft: 14 }}>
                <MiniLineChart data={channelInfo.subscriberHistory} width={80} height={36} />
                <Text style={s.chartLabel}>7일 추이</Text>
              </View>
            )}
          </View>

          {/* Stats row */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statNum}>{channelInfo.episodes.length}</Text>
              <Text style={s.statLabel}>Episodes</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.statItem}>
              <View style={s.row}>
                <Text style={s.statNum}>{channelInfo.streakDays}</Text>
                <Text style={{ fontSize: 18, marginLeft: 2 }}>🔥</Text>
              </View>
              <Text style={s.statLabel}>Day Streak</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.statItem}>
              <Text style={s.statNum}>
                {Math.floor(channelInfo.totalTalkTimeMinutes / 60)}h {channelInfo.totalTalkTimeMinutes % 60}m
              </Text>
              <Text style={s.statLabel}>Talk Time</Text>
            </View>
          </View>
        </View>

        {/* ═══ EPISODES ═══ */}
        <View style={{ marginTop: 20 }}>
          {/* Header */}
          <View style={s.sectionHeader}>
            <View style={[s.row, { alignItems: "center" }]}>
              <Ionicons name="grid-outline" size={16} color={C.gray1} />
              <Text style={s.sectionTitle}>에피소드</Text>
              <View style={s.countBadge}>
                <Text style={s.countBadgeText}>{channelInfo.episodes.length}</Text>
              </View>
            </View>
          </View>
          <View style={s.divider} />

          {/* Grid */}
          {channelInfo.episodes.length === 0 ? (
            <EpisodeEmptyState />
          ) : (
            <>
              <View style={s.grid}>
                {(showAll ? channelInfo.episodes : channelInfo.episodes.slice(0, EPISODES_PREVIEW)).map((ep) => (
                  <EpisodeCard key={ep.id} episode={ep} />
                ))}
              </View>
              {channelInfo.episodes.length > EPISODES_PREVIEW && (
                <Pressable style={s.showMoreBtn} onPress={() => setShowAll((v) => !v)}>
                  <Text style={s.showMoreText}>{showAll ? "접기" : `더보기 (+${channelInfo.episodes.length - EPISODES_PREVIEW})`}</Text>
                  <Ionicons name={showAll ? "chevron-up" : "chevron-down"} size={14} color={C.gray2} />
                </Pressable>
              )}
            </>
          )}
        </View>

        {/* ═══ BADGE MILESTONES ═══ */}
        <BadgeMilestones subscriberCount={channelInfo.subscriberCount} badge={channelInfo.badge} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  row: { flexDirection: "row" },
  center: { alignItems: "center", justifyContent: "center" },

  // Banner
  bannerWrap: { height: 160, position: "relative", overflow: "hidden" },
  bannerBase: { ...StyleSheet.absoluteFillObject, backgroundColor: "#1A0A0A" },
  bannerCircle1: {
    position: "absolute", width: 220, height: 220, borderRadius: 110,
    backgroundColor: "#FF0000", opacity: 0.07, top: -60, right: -40,
  },
  bannerCircle2: {
    position: "absolute", width: 140, height: 140, borderRadius: 70,
    backgroundColor: "#FF4444", opacity: 0.06, bottom: -50, left: 30,
  },
  bannerCircle3: {
    position: "absolute", width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#FFFFFF", opacity: 0.03, top: 20, left: "45%",
  },
  bannerLine: {
    position: "absolute", height: 1, left: 0, right: 0, bottom: 40,
    backgroundColor: "#FF0000", opacity: 0.08,
  },
  bannerArtLabel: {
    position: "absolute", bottom: 10, right: 14,
  },
  bannerArtText: { color: "#333", fontSize: 9, fontWeight: "700", letterSpacing: 2 },
  menuBtn: {
    position: "absolute", top: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center", justifyContent: "center",
  },

  // Profile
  profileWrap: { paddingHorizontal: 16, marginTop: -40 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.red, borderWidth: 3, borderColor: C.bg,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: C.white, fontSize: 26, fontWeight: "900" },
  channelName: { color: C.white, fontSize: 22, fontWeight: "900", marginTop: 12, letterSpacing: -0.5 },
  handleText: { color: C.gray1, fontSize: 13 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.gray4 },

  // Subscriber
  subCount: { color: C.white, fontSize: 38, fontWeight: "900", letterSpacing: -1 },
  subLabel: { color: C.gray2, fontSize: 15, fontWeight: "600", marginLeft: 8 },
  chartLabel: { color: C.gray3, fontSize: 9, fontWeight: "600", letterSpacing: 0.5, marginTop: 3, textAlign: "center" },

  // Stats
  statsRow: {
    flexDirection: "row", marginTop: 16,
    backgroundColor: C.card, borderRadius: 16, overflow: "hidden",
  },
  statItem: { flex: 1, paddingVertical: 14, alignItems: "center" },
  statNum: { color: C.white, fontSize: 18, fontWeight: "900" },
  statLabel: { color: C.gray2, fontSize: 11, marginTop: 2 },
  statDiv: { width: 1, backgroundColor: C.card3 },

  // Milestones
  milestoneBox: { marginHorizontal: 16, marginTop: 16, backgroundColor: C.card, borderRadius: 16, padding: 16 },
  milestoneTitle: { color: C.gray2, fontSize: 11, fontWeight: "700", letterSpacing: 2, marginBottom: 12 },
  milestoneRow: { flexDirection: "row", justifyContent: "space-between" },
  milestoneItem: { alignItems: "center", flex: 1 },
  milestoneCircle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  milestoneLabel: { fontSize: 12, fontWeight: "700" },
  milestoneSub: { fontSize: 10, color: C.gray3, marginTop: 1 },
  progressTrack: { width: 40, height: 4, backgroundColor: C.card3, borderRadius: 2, marginTop: 6, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 2 },

  // Episodes section
  sectionHeader: {
    paddingHorizontal: 16, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between", marginBottom: 12,
  },
  sectionTitle: { color: C.white, fontSize: 16, fontWeight: "700", marginLeft: 8 },
  countBadge: { backgroundColor: C.red, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  countBadgeText: { color: C.white, fontSize: 10, fontWeight: "700" },
  divider: { height: 1, backgroundColor: C.card, marginHorizontal: 16, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: CARD_PADDING, gap: CARD_GAP },
  showMoreBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14, marginHorizontal: CARD_PADDING,
    backgroundColor: C.card, borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: C.border,
  },
  showMoreText: { color: C.gray2, fontSize: 13, fontWeight: "600" },

  // Episode card
  thumbWrap: { borderRadius: 12, overflow: "hidden", position: "relative" },
  thumbInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  thumbScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  durationBadge: {
    position: "absolute", bottom: 6, right: 6,
    backgroundColor: "rgba(0,0,0,0.8)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  durationText: { color: C.white, fontSize: 9, fontWeight: "700" },
  seriesBadge: {
    position: "absolute", top: 6, left: 6,
    backgroundColor: "rgba(255,0,0,0.9)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  seriesText: { color: C.white, fontSize: 9, fontWeight: "700" },
  hitBadge: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "rgba(0,0,0,0.75)", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  hitBadgeText: { fontSize: 9, fontWeight: "700" },
  epTitle: { color: C.white, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  epMeta: { color: C.gray2, fontSize: 11 },
});
