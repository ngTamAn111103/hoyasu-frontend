import { View, Text, Image, Alert } from "react-native";
import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { LOGIN_URL } from "../../constant/api";
import { useAuth } from "../../context/AuthContext";


const SignInScreen = () => {
  const [email, setEmail] = useState("test1@gmail.com");
  const [password, setPassword] = useState("test1@gmail.com");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setIsSignedIn } = useAuth();

  const isFormInvalid =
    !email.includes("@gmail.com") || // Yêu cầu email có đuôi @gmail.com
    password === ""; // Bắt buộc mật khẩu không được để trống

  // Hàm xử lý đăng nhập
  const handleSignIn = async () => {
    if (isFormInvalid) {
      Alert.alert("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: password }),
      });
      const data = await response.json();

      if (response.ok) {
        // công, lưu tokens
        await AsyncStorage.setItem("accessToken", data.access);
        await AsyncStorage.setItem("refreshToken", data.refresh);
        setIsSignedIn(true);

        // Điều hướng đến trang chính và xóa lịch sử route auth
        router.replace("/");
      } else {
        // Đăng nhập thất bại
        Alert.alert(
          "Đăng nhập thất bại",
          "Email hoặc mật khẩu không chính xác.",
        );
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Image
        source={require("../../assets/images/auth/signin.png")}
        className="h-60 w-60"
      />
      <Text className="mb-4 text-2xl font-bold">Sign In</Text>

      <FormField
        // title="Email"
        value={email}
        handleChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        otherStyles="mb-4" // Thêm khoảng cách dưới
      />

      <FormField
        // title="Password"
        value={password}
        handleChangeText={setPassword}
        placeholder="Password"
        secureTextEntry // Tự động ẩn mật khẩu
        otherStyles="mb-4"
      />

      <CustomButton
        title="Sign In"
        handlePress={handleSignIn}
        isLoading={isLoading}
        isDisabled={!email || !password} // Vô hiệu hóa nếu email hoặc password trống
        containerStyles="mb-4"
      />

      <Link href="/sign-up" className="mt-2">
        <Text className="text-primary">Don't have an account? Sign Up</Text>
      </Link>
    </View>
  );
};

export default SignInScreen;
