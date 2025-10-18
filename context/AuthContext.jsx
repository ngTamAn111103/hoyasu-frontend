import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider Component
export const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Kiểm tra token khi ứng dụng khởi động
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          setIsSignedIn(true); // Nếu có token, coi như đã đăng nhập
        } else {
          setIsSignedIn(false);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
        setIsSignedIn(false);
      } finally {
        setIsLoading(false); // Kết thúc quá trình tải
      }
    };

    checkLoginStatus();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần
  const signOut = async () => {
    try {
      // Xóa các token khỏi AsyncStorage
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      // Cập nhật lại trạng thái đã đăng nhập là false
      setIsSignedIn(false);
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };
  // 4. Cung cấp các giá trị cho các component con
  const value = {
    isSignedIn,
    setIsSignedIn,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 5. Tạo một custom hook để sử dụng Context dễ dàng hơn
export const useAuth = () => {
  return useContext(AuthContext);
};
