import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

function BadgeIcon({ badge }: { badge: string }) {
  if (badge === "none") return null;

  const badgeConfig = {
    bronze: { color: "#CD7F32", label: "Bronze" },
    silver: { color: "#C0C0C0", label: "Silver" },
    gold: { color: "#FFD700", label: "Gold" },
  };

  const config = badgeConfig[badge as keyof typeof badgeConfig];
  if (!config) return null;

  return (
    <View
      className="flex-row items-center rounded-full px-2 py-0.5 ml-2"
      style={{ backgroundColor: config.color + "20" }}
    >
      <Ionicons name="shield-checkmark" size={12} color={config.color} />
      <Text className="text-xs ml-1 font-semibold" style={{ color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
}

function SubscriberCount({ count }: { count: number }) {
  const formatted =
    count >= 1_000_000
      ? `${(count / 1_000_000).toFixed(1)}M`
      : count >= 1_000
      ? `${(count / 1_000).toFixed(1)}K`
      : `${count}`;

  return (
    <Text className="text-vlogger-gray text-sm">
      구독자 {formatted}명
    </Text>
  );
}

function EpisodeEmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20 px-6">
      <View className="w-20 h-20 rounded-full bg-vlogger-dark items-center justify-center mb-4">
        <Ionicons name="videocam-outline" size={36} color="#AAAAAA" />
      </View>
      <Text className="text-vlogger-gray text-base font-semibold mb-2">
        아직 에피소드가 없습니다
      </Text>
      <Text className="text-vlogger-gray text-sm text-center opacity-60">
        수업을 완료하면 에피소드가{"\n"}채널에 자동으로 추가됩니다
      </Text>
    </View>
  );
}

function EpisodeGrid({ episodes }: { episodes: typeof useAppStore.getState extends () => infer S ? S extends { channelInfo: { episodes: infer E } } ? E : never : never }) {
  if (episodes.length === 0) return <EpisodeEmptyState />;

  return (
    <View className="flex-row flex-wrap px-4 gap-2">
      {episodes.map((episode) => (
        <Pressable
          key={episode.id}
          className="w-[48%] bg-vlogger-dark rounded-xl overflow-hidden mb-2"
        >
          <View className="h-24 bg-vlogger-dark items-center justify-center border-b border-vlogger-black">
            <Ionicons name="play-circle-outline" size={32} color="#FF0000" />
          </View>
          <View className="p-3">
            <Text className="text-white text-xs font-semibold" numberOfLines={2}>
              {episode.title}
            </Text>
            <Text className="text-vlogger-gray text-[10px] mt-1">
              {episode.date}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export default function ChannelHomeScreen() {
  const { userProfile, channelInfo } = useAppStore();

  const initials = userProfile.name
    .split("")
    .filter((c) => /[A-Za-z가-힣]/.test(c))
    .slice(0, 2)
    .join("")
    .toUpperCase() || "JW";

  // Use English initials from channel handle or name
  const displayInitials = userProfile.channelHandle
    ? userProfile.channelHandle.replace("@", "").slice(0, 2).toUpperCase()
    : initials;

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
    <SafeAreaView className="flex-1 bg-vlogger-black">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* ── Banner ──────────────────────────────── */}
        <View className="bg-vlogger-black px-5 pt-4 pb-6">
          {/* Channel Name */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xl font-bold">
              {channelInfo.channelName}
            </Text>
            <Ionicons name="notifications-outline" size={22} color="#AAAAAA" />
          </View>

          {/* Profile Section */}
          <View className="flex-row items-center">
            {/* Avatar */}
            <View className="w-16 h-16 rounded-full bg-vlogger-red items-center justify-center mr-4">
              <Text className="text-white text-lg font-bold">
                {displayInitials}
              </Text>
            </View>

            {/* Info */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-white text-base font-semibold">
                  {userProfile.channelHandle}
                </Text>
                <BadgeIcon badge={channelInfo.badge} />
              </View>
              <SubscriberCount count={channelInfo.subscriberCount} />
              <Text
                className="text-vlogger-gray text-xs mt-0.5 opacity-70"
                numberOfLines={1}
              >
                {tags}
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row mt-5 bg-vlogger-dark rounded-2xl p-4">
            <View className="flex-1 items-center">
              <Text className="text-white text-lg font-bold">
                {channelInfo.episodes.length}
              </Text>
              <Text className="text-vlogger-gray text-xs mt-0.5">에피소드</Text>
            </View>
            <View className="w-px bg-vlogger-gray opacity-20" />
            <View className="flex-1 items-center">
              <Text className="text-white text-lg font-bold">
                {channelInfo.streakDays}
              </Text>
              <Text className="text-vlogger-gray text-xs mt-0.5">연속 출석</Text>
            </View>
            <View className="w-px bg-vlogger-gray opacity-20" />
            <View className="flex-1 items-center">
              <Text className="text-white text-lg font-bold">
                {channelInfo.totalTalkTimeMinutes}분
              </Text>
              <Text className="text-vlogger-gray text-xs mt-0.5">총 통화</Text>
            </View>
          </View>
        </View>

        {/* ── Divider ─────────────────────────────── */}
        <View className="h-2 bg-vlogger-dark" />

        {/* ── Episodes Section ────────────────────── */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-white text-base font-bold mb-3">
            에피소드
          </Text>
        </View>
        <EpisodeGrid episodes={channelInfo.episodes} />

        {/* Bottom Spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
