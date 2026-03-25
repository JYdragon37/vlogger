import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

export default function LessonScreen() {
  const { userProfile, lessonSchedule } = useAppStore();

  const scheduleDays = lessonSchedule.days.join(" · ");
  const nextSlot = lessonSchedule.timeSlots[0] || "07:00";

  return (
    <SafeAreaView className="flex-1 bg-vlogger-black">
      <View className="flex-1 px-5 pt-4">
        {/* Header */}
        <Text className="text-white text-xl font-bold mb-6">수업</Text>

        {/* Next Lesson Card */}
        <View className="bg-vlogger-dark rounded-2xl p-5 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-vlogger-red items-center justify-center mr-3">
              <Ionicons name="call" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-semibold">
                다음 수업 예정
              </Text>
              <Text className="text-vlogger-gray text-sm">
                Emma와 전화영어
              </Text>
            </View>
          </View>

          <View className="bg-vlogger-black rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar-outline" size={16} color="#AAAAAA" />
              <Text className="text-vlogger-gray text-sm ml-2">
                {scheduleDays}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#AAAAAA" />
              <Text className="text-vlogger-gray text-sm ml-2">
                1순위 {nextSlot}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View className="bg-vlogger-dark rounded-2xl p-5">
          <Text className="text-white text-sm font-semibold mb-3">
            학습 루프
          </Text>

          {[
            { icon: "document-text-outline" as const, label: "스크립트 읽기", time: "2분" },
            { icon: "school-outline" as const, label: "핵심 표현 5개 학습", time: "2분" },
            { icon: "flash-outline" as const, label: "플래시카드 퀴즈", time: "1분" },
            { icon: "call-outline" as const, label: "Emma 전화영어", time: "5~10분" },
            { icon: "stats-chart-outline" as const, label: "피드백 리포트", time: "-" },
          ].map((step, i) => (
            <View
              key={i}
              className="flex-row items-center py-3 border-b border-vlogger-black"
            >
              <View className="w-7 h-7 rounded-full bg-vlogger-black items-center justify-center mr-3">
                <Text className="text-vlogger-red text-xs font-bold">
                  {i + 1}
                </Text>
              </View>
              <Ionicons name={step.icon} size={18} color="#AAAAAA" />
              <Text className="text-white text-sm ml-2 flex-1">
                {step.label}
              </Text>
              <Text className="text-vlogger-gray text-xs">{step.time}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
