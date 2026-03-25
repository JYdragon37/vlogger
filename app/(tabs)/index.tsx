import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore, type Episode } from "@/store/useAppStore";

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

function EpisodeCard({ episode }: { episode: Episode }) {
  return (
    <Pressable style={{ width: CARD_WIDTH, marginBottom: 14 }}>
      {/* Thumbnail */}
      <View style={[s.thumbWrap, { height: CARD_WIDTH * 0.56 }]}>
        <View style={s.thumbInner}>
          <Text style={{ fontSize: 30 }}>{episode.emoji}</Text>
        </View>
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

export default function ChannelHomeScreen() {
  const { userProfile, channelInfo } = useAppStore();
  const tags = [userProfile.job, userProfile.location, ...(userProfile.hobbies.length > 0 ? [userProfile.hobbies[0] + " lover"] : [])].filter(Boolean).join(" · ");

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ═══ BANNER ═══ */}
        <View style={s.bannerWrap}>
          <View style={s.bannerBg} />
          <View style={[s.center, StyleSheet.absoluteFill]}>
            <Text style={s.bannerText}>VLOG</Text>
          </View>
          <Pressable style={s.menuBtn}>
            <Ionicons name="ellipsis-vertical" size={18} color={C.gray1} />
          </Pressable>
        </View>

        {/* ═══ PROFILE ═══ */}
        <View style={s.profileWrap}>
          {/* Avatar row */}
          <View style={[s.row, { alignItems: "flex-end" }]}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>JW</Text>
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

          {/* Subscriber count — BIG */}
          <View style={[s.row, { marginTop: 16, alignItems: "baseline" }]}>
            <Text style={s.subCount}>{formatSubs(channelInfo.subscriberCount)}</Text>
            <Text style={s.subLabel}>subscribers</Text>
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

        {/* ═══ BADGE MILESTONES ═══ */}
        <BadgeMilestones subscriberCount={channelInfo.subscriberCount} badge={channelInfo.badge} />

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
            {channelInfo.episodes.length > 0 && (
              <Pressable style={[s.row, { alignItems: "center" }]}>
                <Text style={{ color: C.gray1, fontSize: 12, marginRight: 2 }}>전체보기</Text>
                <Ionicons name="chevron-forward" size={14} color={C.gray1} />
              </Pressable>
            )}
          </View>
          <View style={s.divider} />

          {/* Grid */}
          {channelInfo.episodes.length === 0 ? (
            <EpisodeEmptyState />
          ) : (
            <View style={s.grid}>
              {channelInfo.episodes.map((ep) => (
                <EpisodeCard key={ep.id} episode={ep} />
              ))}
            </View>
          )}
        </View>

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
  bannerWrap: { height: 130, backgroundColor: "#111", position: "relative" },
  bannerBg: { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg, opacity: 0.3 },
  bannerText: { color: "#222", fontSize: 56, fontWeight: "900", letterSpacing: -2, opacity: 0.3 },
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

  // Episode card
  thumbWrap: { borderRadius: 12, overflow: "hidden", position: "relative" },
  thumbInner: { flex: 1, backgroundColor: C.card2, alignItems: "center", justifyContent: "center" },
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
  epTitle: { color: C.white, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  epMeta: { color: C.gray2, fontSize: 11 },
});
