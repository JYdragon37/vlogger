import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore, type Episode } from "@/store/useAppStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 10;
const CARD_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

// ─── Subscriber Formatter ────────────────────────────────

function formatSubscribers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return `${count}`;
}

// ─── Badge Button Component ─────────────────────────────

function CreatorBadge({ badge }: { badge: string }) {
  if (badge === "none") return null;

  const config = {
    bronze: {
      bg: "#CD7F32",
      label: "BRONZE",
      icon: "trophy" as const,
      glow: "#CD7F3240",
      sub: "10K",
    },
    silver: {
      bg: "#C0C0C0",
      label: "SILVER",
      icon: "trophy" as const,
      glow: "#C0C0C040",
      sub: "100K",
    },
    gold: {
      bg: "#FFD700",
      label: "GOLD",
      icon: "trophy" as const,
      glow: "#FFD70040",
      sub: "1M",
    },
  };

  const c = config[badge as keyof typeof config];
  if (!c) return null;

  return (
    <View
      className="flex-row items-center rounded-full px-3 py-1.5"
      style={{ backgroundColor: c.glow }}
    >
      <Ionicons name={c.icon} size={14} color={c.bg} />
      <Text
        className="text-xs font-bold ml-1.5 tracking-wider"
        style={{ color: c.bg }}
      >
        {c.label}
      </Text>
    </View>
  );
}

// ─── Badge Milestone Progress ───────────────────────────

function BadgeMilestones({
  subscriberCount,
  badge,
}: {
  subscriberCount: number;
  badge: string;
}) {
  const milestones = [
    {
      key: "bronze",
      label: "Bronze",
      target: 10_000,
      color: "#CD7F32",
      icon: "trophy-outline" as const,
    },
    {
      key: "silver",
      label: "Silver",
      target: 100_000,
      color: "#C0C0C0",
      icon: "trophy-outline" as const,
    },
    {
      key: "gold",
      label: "Gold",
      target: 1_000_000,
      color: "#FFD700",
      icon: "trophy-outline" as const,
    },
  ];

  const badgeOrder = ["none", "bronze", "silver", "gold"];
  const currentBadgeIndex = badgeOrder.indexOf(badge);

  return (
    <View className="mx-4 mt-4 bg-[#1A1A1A] rounded-2xl p-4">
      <Text className="text-[#888] text-xs font-semibold uppercase tracking-widest mb-3">
        Creator Button
      </Text>
      <View className="flex-row justify-between">
        {milestones.map((m) => {
          const achieved = badgeOrder.indexOf(m.key) <= currentBadgeIndex;
          const progress = Math.min(subscriberCount / m.target, 1);
          const isCurrent =
            badgeOrder.indexOf(m.key) === currentBadgeIndex + 1;

          return (
            <View key={m.key} className="items-center flex-1">
              {/* Icon Circle */}
              <View
                className="w-12 h-12 rounded-full items-center justify-center mb-2"
                style={{
                  backgroundColor: achieved ? m.color + "25" : "#2A2A2A",
                  borderWidth: isCurrent ? 2 : achieved ? 1.5 : 1,
                  borderColor: achieved
                    ? m.color
                    : isCurrent
                    ? m.color + "60"
                    : "#333",
                }}
              >
                <Ionicons
                  name={achieved ? "trophy" : m.icon}
                  size={20}
                  color={achieved ? m.color : "#555"}
                />
              </View>
              {/* Label */}
              <Text
                className="text-xs font-bold mb-0.5"
                style={{ color: achieved ? m.color : "#555" }}
              >
                {m.label}
              </Text>
              <Text className="text-[10px] text-[#666]">
                {formatSubscribers(m.target)}
              </Text>
              {/* Progress bar (only for unachieved) */}
              {!achieved && (
                <View className="w-10 h-1 bg-[#2A2A2A] rounded-full mt-1.5 overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: m.color + "80",
                    }}
                  />
                </View>
              )}
              {achieved && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={m.color}
                  style={{ marginTop: 4 }}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Episode Thumbnail Card ─────────────────────────────

function EpisodeCard({ episode }: { episode: Episode }) {
  const expressionRatio = `${episode.expressionsUsed}/${episode.expressionsTotal}`;

  return (
    <Pressable
      className="overflow-hidden mb-3"
      style={{ width: CARD_WIDTH }}
    >
      {/* Thumbnail Area */}
      <View
        className="rounded-xl overflow-hidden"
        style={{ height: CARD_WIDTH * 0.56 }}
      >
        <View className="flex-1 bg-[#1E1E1E] items-center justify-center">
          <Text className="text-3xl">{episode.emoji}</Text>
        </View>
        {/* Duration badge */}
        <View className="absolute bottom-1.5 right-1.5 bg-black/80 rounded px-1.5 py-0.5">
          <Text className="text-white text-[9px] font-bold">
            {episode.durationMinutes}min
          </Text>
        </View>
        {/* Series badge */}
        {episode.seriesName && episode.seriesOrder && episode.seriesTotal && (
          <View className="absolute top-1.5 left-1.5 bg-[#FF0000]/90 rounded px-1.5 py-0.5">
            <Text className="text-white text-[9px] font-bold">
              {episode.seriesOrder}/{episode.seriesTotal}
            </Text>
          </View>
        )}
      </View>
      {/* Info Area */}
      <View className="pt-2 px-0.5">
        <Text
          className="text-white text-[13px] font-semibold leading-[18px]"
          numberOfLines={2}
        >
          {episode.title}
        </Text>
        <View className="flex-row items-center mt-1.5">
          <Text className="text-[#888] text-[11px]">{episode.date}</Text>
          <View className="w-0.5 h-0.5 bg-[#555] rounded-full mx-1.5" />
          <Text className="text-[#888] text-[11px]">
            {expressionRatio} expressions
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Empty State ────────────────────────────────────────

function EpisodeEmptyState() {
  return (
    <View className="items-center justify-center py-16 px-8">
      <View className="w-20 h-20 rounded-2xl bg-[#1E1E1E] items-center justify-center mb-4">
        <Ionicons name="videocam-outline" size={36} color="#444" />
      </View>
      <Text className="text-[#888] text-base font-semibold mb-2">
        아직 에피소드가 없습니다
      </Text>
      <Text className="text-[#555] text-sm text-center leading-5">
        첫 수업을 완료하면 에피소드가{"\n"}채널에 자동으로 추가됩니다
      </Text>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────

export default function ChannelHomeScreen() {
  const { userProfile, channelInfo } = useAppStore();

  const tags = [
    userProfile.job,
    userProfile.location,
    ...(userProfile.hobbies.length > 0
      ? [userProfile.hobbies[0] + " lover"]
      : []),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}
      >
        {/* ═══════════════════════════════════════════════════
            BANNER AREA — 유튜브 채널 헤더
           ═══════════════════════════════════════════════════ */}
        <View className="bg-[#0F0F0F]">
          {/* Banner Image Area */}
          <View className="h-32 bg-[#111111] relative">
            {/* Gradient overlay pattern */}
            <View className="absolute inset-0 bg-[#0F0F0F]/30" />
            {/* Decorative grid lines (YouTube-like) */}
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-[#222] text-6xl font-black tracking-tighter opacity-30">
                VLOG
              </Text>
            </View>
            {/* Settings icon */}
            <Pressable className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 items-center justify-center">
              <Ionicons name="ellipsis-vertical" size={18} color="#AAA" />
            </Pressable>
          </View>

          {/* ── Profile Section ────────────────────────── */}
          <View className="px-4 -mt-10">
            {/* Avatar */}
            <View className="flex-row items-end">
              <View
                className="w-20 h-20 rounded-full items-center justify-center border-[3px]"
                style={{
                  backgroundColor: "#FF0000",
                  borderColor: "#0F0F0F",
                }}
              >
                <Text className="text-white text-2xl font-black">JW</Text>
              </View>
              {/* Badge next to avatar */}
              <View className="ml-3 mb-1">
                <CreatorBadge badge={channelInfo.badge} />
              </View>
            </View>

            {/* Channel Name & Handle */}
            <View className="mt-3">
              <Text className="text-white text-xl font-black tracking-tight">
                {channelInfo.channelName}
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-[#AAA] text-sm">
                  {userProfile.channelHandle}
                </Text>
                <View className="w-1 h-1 bg-[#555] rounded-full mx-2" />
                <Text className="text-[#AAA] text-sm">
                  {tags}
                </Text>
              </View>
            </View>

            {/* ── Subscriber Count — BIG ──────────────── */}
            <View className="mt-4 flex-row items-baseline">
              <Text className="text-white text-4xl font-black tracking-tight">
                {formatSubscribers(channelInfo.subscriberCount)}
              </Text>
              <Text className="text-[#888] text-base font-semibold ml-2">
                subscribers
              </Text>
            </View>

            {/* ── Stats Row ───────────────────────────── */}
            <View className="flex-row mt-4 bg-[#1A1A1A] rounded-2xl overflow-hidden">
              <View className="flex-1 py-3.5 items-center">
                <Text className="text-white text-lg font-black">
                  {channelInfo.episodes.length}
                </Text>
                <Text className="text-[#888] text-[11px] mt-0.5">
                  Episodes
                </Text>
              </View>
              <View className="w-px bg-[#2A2A2A]" />
              <View className="flex-1 py-3.5 items-center">
                <View className="flex-row items-center">
                  <Text className="text-white text-lg font-black">
                    {channelInfo.streakDays}
                  </Text>
                  <Text className="text-[#FF6B6B] text-lg ml-0.5">🔥</Text>
                </View>
                <Text className="text-[#888] text-[11px] mt-0.5">
                  Day Streak
                </Text>
              </View>
              <View className="w-px bg-[#2A2A2A]" />
              <View className="flex-1 py-3.5 items-center">
                <Text className="text-white text-lg font-black">
                  {Math.floor(channelInfo.totalTalkTimeMinutes / 60)}h{" "}
                  {channelInfo.totalTalkTimeMinutes % 60}m
                </Text>
                <Text className="text-[#888] text-[11px] mt-0.5">
                  Talk Time
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════
            BADGE MILESTONES
           ═══════════════════════════════════════════════════ */}
        <BadgeMilestones
          subscriberCount={channelInfo.subscriberCount}
          badge={channelInfo.badge}
        />

        {/* ═══════════════════════════════════════════════════
            EPISODES SECTION
           ═══════════════════════════════════════════════════ */}
        <View className="mt-5">
          {/* Section Header */}
          <View className="px-4 flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="grid-outline" size={16} color="#AAA" />
              <Text className="text-white text-base font-bold ml-2">
                에피소드
              </Text>
              <View className="bg-[#FF0000] rounded-full px-2 py-0.5 ml-2">
                <Text className="text-white text-[10px] font-bold">
                  {channelInfo.episodes.length}
                </Text>
              </View>
            </View>
            {channelInfo.episodes.length > 0 && (
              <Pressable className="flex-row items-center">
                <Text className="text-[#AAA] text-xs mr-1">전체보기</Text>
                <Ionicons name="chevron-forward" size={14} color="#AAA" />
              </Pressable>
            )}
          </View>

          {/* Divider */}
          <View className="h-px bg-[#1A1A1A] mx-4 mb-3" />

          {/* Episode Grid */}
          {channelInfo.episodes.length === 0 ? (
            <EpisodeEmptyState />
          ) : (
            <View
              className="flex-row flex-wrap px-4"
              style={{ gap: CARD_GAP }}
            >
              {channelInfo.episodes.map((ep) => (
                <EpisodeCard key={ep.id} episode={ep} />
              ))}
            </View>
          )}
        </View>

        {/* Bottom Spacer */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
