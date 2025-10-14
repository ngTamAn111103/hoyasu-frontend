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



// ----------------------------------
// import { View, Text } from "react-native";
// import React from "react";
// import { Tabs } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { COLORS } from "../../constant/color";

// // Component TabIcon đã được cập nhật
// const TabIcon = ({ iconName, color, name, focused }) => {
//   return (
//     // 1. View cha bây giờ chỉ có nhiệm vụ căn giữa theo chiều dọc
//     <View style={{ alignItems: "center", justifyContent: "center" }}>
//       <Ionicons name={iconName} size={24} color={color} />
//       <Text
//         style={{
//           color: color,
//           fontSize: 12,
//           fontWeight: focused ? "bold" : "normal",
//           // 2. Cung cấp một chiều rộng cố định và căn giữa chữ
//           width: 70, // Bạn có thể điều chỉnh con số này
//           textAlign: "center",
//         }}
//       >
//         {name}
//       </Text>
//     </View>
//   );
// };

// const TabsLayout = () => {
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarShowLabel: false,
//         tabBarActiveTintColor: COLORS.primary,
//         tabBarInactiveTintColor: COLORS.textLight,
//         tabBarStyle: {
//           backgroundColor: COLORS.background,
//           borderTopWidth: 1,
//           borderTopColor: COLORS.border,
//           height: 100, // Chiều cao 100 là hợp lý
//         },
//       }}
//     >
//       {/* --- Các màn hình Tab không thay đổi --- */}
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Trang Chủ",
//           headerShown: false,
//           tabBarIcon: ({ color, focused }) => (
//             <TabIcon
//               iconName={focused ? "home" : "home-outline"}
//               color={color}
//               name="Home"
//               focused={focused}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="create"
//         options={{
//           title: "Tạo Mới",
//           headerShown: false,
//           tabBarIcon: ({ color, focused }) => (
//             <TabIcon
//               iconName={focused ? "add-circle" : "add-circle-outline"}
//               color={color}
//               name="Create"
//               focused={focused}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Hồ Sơ",
//           headerShown: false,
//           tabBarIcon: ({ color, focused }) => (
//             <TabIcon
//               iconName={focused ? "person" : "person-outline"}
//               color={color}
//               name="Profile"
//               focused={focused}
//             />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// };

// export default TabsLayout;