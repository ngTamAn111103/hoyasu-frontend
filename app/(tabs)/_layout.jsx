import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constant/color";

// Component tái sử dụng để hiển thị icon trên tab, không cần thay đổi
const TabIcon = ({ iconName, color, name, focused }) => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: 2 }}>
      <Ionicons name={iconName} size={24} color={color} />
      <Text
        style={{
          color: color,
          fontSize: 12,
          fontWeight: focused ? "bold" : "normal",
        }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          // 2. Sử dụng các giá trị từ COLORS
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            height: 100,
          },
        }}
      >
        {/* --- 2. CÁC MÀN HÌNH TAB GIỮ NGUYÊN --- */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Trang Chủ",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName={focused ? "home" : "home-outline"}
                color={color}
                name="Home"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="vehicle"
          options={{
            title: "Phương tiện",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName={focused ? "car" : "car-outline"}
                color={color}
                name="Vehicle"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Tạo Mới",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName={focused ? "add-circle" : "add-circle-outline"}
                color={color}
                name="Create"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Hồ Sơ",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName={focused ? "person" : "person-outline"}
                color={color}
                name="Profile"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

  );
};

export default TabsLayout;
