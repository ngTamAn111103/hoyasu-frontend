import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator, // Component hiển thị vòng tròn tải
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router"; // Dùng Link để điều hướng và useRouter để push route
import { useState } from "react";
import React from "react";
import FormField from "../../components/FormField"; 
import CustomButton from "../../components/CustomButton";
import { COLORS } from '../../constant/color';



// Import đường dẫn API đăng ký từ file constants/api.js
import { REGISTER_URL } from "../../constant/api";

const SignUpScreen = () => {
  // --- 1. KHỞI TẠO TRẠNG THÁI ---
  const [email, setEmail] = useState("test1@gmail.com");
  const [password, setPassword] = useState("test1@gmail.com");
  const [confirmPassword, setConfirmPassword] = useState("test1@gmail.com");
  const [isLoading, setIsLoading] = useState(false); // Trạng thái cho nút tải
  const router = useRouter(); // Công cụ điều hướng của Expo Router

  // --- 2. LOGIC KIỂM TRA FORM (CLIENT-SIDE) ---
  const isFormInvalid =
    !email.includes("@gmail.com") || // Yêu cầu email có đuôi @gmail.com
    password === "" ||
    confirmPassword === "" ||
    password !== confirmPassword; // Bắt buộc hai mật khẩu phải khớp

  // --- 3. HÀM XỬ LÝ ĐĂNG KÝ ---
  const handleSignUp = async () => {
    // Ngăn chặn gọi API nếu form chưa hợp lệ
    if (isFormInvalid) {
      return;
    }

    setIsLoading(true); // Bắt đầu tải
    // console.log("\nSign Up", `Email: ${email}\nPassword: ${password}\nConfirm Password: ${confirmPassword}`);
    
    try {
      const response = await fetch(REGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Gửi dữ liệu dưới dạng JSON
        body: JSON.stringify({
          "email": email,
          "password": password,
        }),
      });

      // DRF trả về JSON, ta đọc nó
      const data = await response.json(); 
      
      if (response.ok) {
        // Đăng ký thành công (thường là status 201 Created)
        Alert.alert( data.message || "Đăng ký thành công!");
        router.push("/sign-in"); // Chuyển hướng đến màn hình đăng nhập
      } else {
        // Lỗi từ Server (400 Bad Request, Email đã tồn tại, v.v.)
        // --- PHẦN KHẮC PHỤC LỖI HIỂN THỊ ---
        let errorMessage = "Đăng ký thất bại.";
        // Kiểm tra xem non_field_errors có tồn tại và là một mảng không
        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
             // Sử dụng .join('\n') để nối các lỗi lại, mỗi lỗi một dòng
             errorMessage = data.non_field_errors.join('\n');
        } else if (data.email) {
             // Nếu lỗi nằm ở trường 'email' (ví dụ: email đã tồn tại)
             errorMessage = `Lỗi Email: ${data.email.join('\n')}`;
        }
        
        // Hiển thị chuỗi lỗi đã nối
        Alert.alert(errorMessage);
        // --- KẾT THÚC PHẦN KHẮC PHỤC ---
      }
    } catch (error) {
      // Lỗi kết nối mạng (Network request failed)
      console.error("Error during sign up:", error);
      Alert.alert("Lỗi kết nối Server. Vui lòng kiểm tra IP.");
    } finally {
      setIsLoading(false); // Kết thúc tải, dù thành công hay thất bại
    }
  };

  // --- 4. GIAO DIỆN (UI) ---
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Image
        source={require("../../assets/images/auth/signup.png")}
        className="h-60 w-60"
      />
      <Text className="mb-4 text-2xl font-bold">Sign Up</Text>
      
      <FormField
        placeholder="Email"
        value={email}
        handleChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        otherStyles="mb-4"
      />
      
      <FormField
        placeholder="Password"
        value={password}
        handleChangeText={setPassword}
        secureTextEntry
        otherStyles="mb-4"
      />
      
      <FormField
        placeholder="Confirm Password"
        value={confirmPassword}
        handleChangeText={setConfirmPassword}
        secureTextEntry
        otherStyles="mb-4"
      />
      
      <CustomButton
        title="Sign Up"
        handlePress={handleSignUp}
        isLoading={isLoading}
        isDisabled={isFormInvalid}
        containerStyles="mb-4"
      />
      
      <Link href="/sign-in" className="mt-2">
        <Text className="text-primary">Already have an account? Sign In</Text>
      </Link>
    </View>
  );
};

export default SignUpScreen;
