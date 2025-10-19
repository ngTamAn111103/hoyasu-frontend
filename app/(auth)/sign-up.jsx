import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet, // <--- Thêm StyleSheet
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import React from "react";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { COLORS } from "../../constant/color";

// Import đường dẫn API đăng ký từ file constants/api.js
import { REGISTER_URL } from "../../constant/api";

const SignUpScreen = () => {
  // --- 1. KHỞI TẠO TRẠNG THÁI ---
  const [email, setEmail] = useState("test1@gmail.com");
  const [password, setPassword] = useState("test1@gmail.com");
  const [confirmPassword, setConfirmPassword] = useState("test1@gmail.com");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // --- 2. LOGIC KIỂM TRA FORM (CLIENT-SIDE) ---
  const isFormInvalid =
    !email.includes("@gmail.com") ||
    password === "" ||
    confirmPassword === "" ||
    password !== confirmPassword;

  // --- 3. HÀM XỬ LÝ ĐĂNG KÝ ---
  const handleSignUp = async () => {
    if (isFormInvalid) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(REGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(data.message || "Đăng ký thành công!");
        router.push("/sign-in");
      } else {
        let errorMessage = "Đăng ký thất bại.";
        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          errorMessage = data.non_field_errors.join("\n");
        } else if (data.email) {
          errorMessage = `Lỗi Email: ${data.email.join("\n")}`;
        }
        Alert.alert(errorMessage);
      }
    } catch (error) {
      console.error("Error during sign up:", error);
      Alert.alert("Lỗi kết nối Server. Vui lòng kiểm tra IP.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. GIAO DIỆN (UI) ---
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/auth/signup.png")}
        style={styles.logo} 
      />
      <Text style={styles.title}>Sign Up</Text> 
      <FormField
        placeholder="Email"
        value={email}
        handleChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        otherStyles={styles.inputMargin} 
      />
      <FormField
        placeholder="Password"
        value={password}
        handleChangeText={setPassword}
        secureTextEntry
        otherStyles={styles.inputMargin} 
      />
      <FormField
        placeholder="Confirm Password"
        value={confirmPassword}
        handleChangeText={setConfirmPassword}
        secureTextEntry
        otherStyles={styles.inputMargin} 
      />
      <CustomButton
        title="Sign Up"
        handlePress={handleSignUp}
        isLoading={isLoading}
        isDisabled={isFormInvalid}
        containerStyles={styles.buttonMargin} 
      />
      <Link href="/sign-in" style={styles.link}> 
        <Text style={styles.linkText}>Already have an account? Sign In</Text> 
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
    backgroundColor: "#FFFFFF", // FIXME: Thay bằng màu `background` từ config Tailwind (bg-background)
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
    color: "#007AFF", // FIXME: Thay bằng màu `primary` từ config Tailwind (text-primary)
  },
});
// --- Hết bảng style ---

export default SignUpScreen;