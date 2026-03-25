import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

interface SettingsRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value?: string;
  showChevron?: boolean;
  danger?: boolean;
}

function SettingsRow({
  icon,
  label,
  value,
  showChevron = true,
  danger = false,
}: SettingsRowProps) {
  return (
    <Pressable className="flex-row items-center py-3.5 px-1">
      <Ionicons
        name={icon}
        size={20}
        color={danger ? "#FF3B30" : "#AAAAAA"}
      />
      <Text
        className={`flex-1 text-sm ml-3 ${
          danger ? "text-red-500" : "text-white"
        }`}
      >
        {label}
      </Text>
      {value && (
        <Text className="text-vlogger-gray text-sm mr-2">{value}</Text>
      )}
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} color="#AAAAAA" />
      )}
    </Pressable>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="text-vlogger-gray text-xs font-semibold uppercase tracking-wider mb-2 px-1">
        {title}
      </Text>
      <View className="bg-vlogger-dark rounded-2xl px-4">{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const { userProfile, channelInfo, isPremium } = useAppStore();

  return (
    <SafeAreaView className="flex-1 bg-vlogger-black">
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text className="text-white text-xl font-bold mb-6">설정</Text>

        {/* Profile Card */}
        <View className="bg-vlogger-dark rounded-2xl p-5 mb-4 flex-row items-center">
          <View className="w-14 h-14 rounded-full bg-vlogger-red items-center justify-center mr-4">
            <Text className="text-white text-base font-bold">JW</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-semibold">
              {userProfile.name}
            </Text>
            <Text className="text-vlogger-gray text-sm">
              {channelInfo.channelName}
            </Text>
            <View className="flex-row items-center mt-1">
              <View
                className={`rounded-full px-2 py-0.5 ${
                  isPremium ? "bg-vlogger-red" : "bg-vlogger-dark border border-vlogger-gray"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isPremium ? "text-white" : "text-vlogger-gray"
                  }`}
                >
                  {isPremium ? "Premium" : "Free"}
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
        </View>

        {/* Channel Settings */}
        <SettingsSection title="채널 관리">
          <SettingsRow
            icon="person-outline"
            label="프로필 수정"
            value={isPremium ? "무제한" : "월 1회"}
          />
          <SettingsRow
            icon="color-palette-outline"
            label="채널 스킨"
            value="기본"
          />
          <SettingsRow icon="text-outline" label="채널명 변경" />
        </SettingsSection>

        {/* Lesson Settings */}
        <SettingsSection title="수업 설정">
          <SettingsRow
            icon="calendar-outline"
            label="수업 스케줄"
            value="월·수·금"
          />
          <SettingsRow
            icon="time-outline"
            label="수업 시간"
            value="07:00"
          />
          <SettingsRow
            icon="language-outline"
            label="영어 레벨"
            value={userProfile.englishLevel}
          />
        </SettingsSection>

        {/* Subscription */}
        <SettingsSection title="구독 & 결제">
          <SettingsRow
            icon="card-outline"
            label="구독 관리"
            value={isPremium ? "Premium" : "Free"}
          />
          <SettingsRow icon="bag-outline" label="아이템 샵" />
          <SettingsRow icon="receipt-outline" label="구매 내역" />
        </SettingsSection>

        {/* General */}
        <SettingsSection title="일반">
          <SettingsRow icon="notifications-outline" label="알림 설정" />
          <SettingsRow icon="shield-outline" label="개인정보 처리방침" />
          <SettingsRow icon="document-text-outline" label="서비스 이용약관" />
          <SettingsRow icon="help-circle-outline" label="고객센터" />
          <SettingsRow
            icon="information-circle-outline"
            label="앱 버전"
            value="1.0.0"
            showChevron={false}
          />
        </SettingsSection>

        {/* Logout */}
        <SettingsSection title="">
          <SettingsRow
            icon="log-out-outline"
            label="로그아웃"
            showChevron={false}
            danger
          />
        </SettingsSection>

        {/* Bottom Spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
