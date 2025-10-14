import React from "react";
import { Stack } from "expo-router";

// Không cần kiểm tra đăng nhập ở đây nữa
const AuthRoutesLayout = () => {
  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AuthRoutesLayout;