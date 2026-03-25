import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
  iconFocused: IoniconsName;
}

const tabs: TabConfig[] = [
  { name: "index", title: "채널홈", icon: "home-outline", iconFocused: "home" },
  { name: "lesson", title: "수업", icon: "book-outline", iconFocused: "book" },
  { name: "feedback", title: "피드백", icon: "chatbubble-outline", iconFocused: "chatbubble" },
  { name: "settings", title: "설정", icon: "settings-outline", iconFocused: "settings" },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF0000",
        tabBarInactiveTintColor: "#AAAAAA",
        tabBarStyle: {
          backgroundColor: "#0F0F0F",
          borderTopColor: "#1A1A1A",
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 30,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
