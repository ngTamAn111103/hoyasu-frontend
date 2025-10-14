import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import "./globals.css";

const RootLayout = () => {
  return (
    <View className="flex-1 items-center justify-center bg-blue-200">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
    </View>
  );
};

export default RootLayout;
