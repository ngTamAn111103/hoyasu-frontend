import { View, Text, Image, Alert, StyleSheet } from "react-native"; // <--- Thêm StyleSheet
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
    // Sử dụng style từ StyleSheet
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/auth/signin.png")}
        style={styles.logo} 
      />
      <Text style={styles.title}>Sign In</Text> 
      <FormField
        // title="Email"
        value={email}
        handleChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        otherStyles={styles.inputMargin} 
      />
      <FormField
        // title="Password"
        value={password}
        handleChangeText={setPassword}
        placeholder="Password"
        secureTextEntry // Tự động ẩn mật khẩu
        otherStyles={styles.inputMargin} 
      />
      <CustomButton
        title="Sign In"
        handlePress={handleSignIn}
        isLoading={isLoading}
        isDisabled={!email || !password}
        containerStyles={styles.buttonMargin} 
      />
      <Link href="/sign-up" style={styles.link}> 
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text> 
      </Link>
    </View>
  );
};

// --- Bảng style được chuyển đổi từ NativeWind ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF", // FIXME: Thay bằng màu `background` từ config Tailwind của bạn (bg-background)
  },
  logo: {
    width: 240, // (w-60)
    height: 240, // (h-60)
  },
  title: {
    fontSize: 24, // (text-2xl)
    fontWeight: "bold", // (font-bold)
    marginBottom: 16, // (mb-4)
  },
  inputMargin: {
    marginBottom: 16, // (mb-4)
  },
  buttonMargin: {
    marginBottom: 16, // (mb-4)
  },
  link: {
    marginTop: 8, // (mt-2)
  },
  linkText: {
    color: "#007AFF", // FIXME: Thay bằng màu `primary` từ config Tailwind của bạn (text-primary)
  },
});
// --- Hết bảng style ---

export default SignInScreen;