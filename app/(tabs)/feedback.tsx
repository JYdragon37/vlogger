import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

export default function FeedbackScreen() {
  const { channelInfo } = useAppStore();
  const hasEpisodes = channelInfo.episodes.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-vlogger-black">
      <View className="flex-1 px-5 pt-4">
        {/* Header */}
        <Text className="text-white text-xl font-bold mb-6">피드백</Text>

        {hasEpisodes ? (
          /* Feedback Report (placeholder for when episodes exist) */
          <View className="bg-vlogger-dark rounded-2xl p-5">
            <Text className="text-white text-base font-semibold mb-3">
              최근 수업 리포트
            </Text>
            <Text className="text-vlogger-gray text-sm">
              수업 리포트가 여기에 표시됩니다.
            </Text>
          </View>
        ) : (
          /* Empty State */
          <View className="flex-1 items-center justify-center">
            <View className="w-24 h-24 rounded-full bg-vlogger-dark items-center justify-center mb-5">
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={44}
                color="#AAAAAA"
              />
            </View>
            <Text className="text-white text-lg font-semibold mb-2">
              아직 피드백이 없습니다
            </Text>
            <Text className="text-vlogger-gray text-sm text-center leading-5">
              첫 수업을 완료하면{"\n"}
              상세한 피드백 리포트를 확인할 수 있어요
            </Text>

            {/* Example Report Preview */}
            <View className="bg-vlogger-dark rounded-2xl p-5 mt-8 w-full">
              <Text className="text-vlogger-gray text-xs font-semibold mb-3 uppercase tracking-wider">
                피드백 리포트 미리보기
              </Text>

              {[
                { label: "표현 사용 트래킹", value: "5개 중 ?/5" },
                { label: "WPM (분당 단어)", value: "측정 전" },
                { label: "개선 포인트", value: "5가지" },
                { label: "구독자 증가", value: "+100명" },
              ].map((item, i) => (
                <View
                  key={i}
                  className="flex-row items-center justify-between py-2.5 border-b border-vlogger-black"
                >
                  <Text className="text-vlogger-gray text-sm">
                    {item.label}
                  </Text>
                  <Text className="text-white text-sm font-medium">
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
