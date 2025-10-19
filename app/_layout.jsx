import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native"; // <--- Thêm StyleSheet

// Component trung gian để có thể truy cập context
const Layout = () => {
  const { isSignedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chỉ thực hiện điều hướng khi quá trình kiểm tra đã hoàn tất
    if (!isLoading) {
      if (isSignedIn) {
        // Nếu đã đăng nhập, đảm bảo người dùng ở trong nhóm (tabs)
        // và màn hình mặc định là trang chủ '/'
        router.replace("/");
      } else {
        // Nếu chưa đăng nhập, chuyển đến màn hình sign-in
        router.replace("/sign-in");
      }
    }
  }, [isSignedIn, isLoading]); // Chạy lại mỗi khi trạng thái thay đổi

  // Trong khi đang tải, hiển thị một màn hình chờ toàn cục
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}> 
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Khi đã tải xong, Stack này sẽ quản lý cả 2 nhóm (auth) và (tabs)
  // Expo Router sẽ tự động hiển thị màn hình đúng dựa trên URL hiện tại
  return <Stack screenOptions={{ headerShown: false }} />;
};

// Component layout gốc
export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.safeArea}> 
        <Layout />
      </SafeAreaView>
    </AuthProvider>
  );
}

// --- Bảng StyleSheet ---
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF", // FIXME: Thay bằng màu `background` từ config Tailwind (bg-background)
  },
  safeArea: {
    flex: 1,
  },
});