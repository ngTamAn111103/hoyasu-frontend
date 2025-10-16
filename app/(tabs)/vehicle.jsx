// screens/VehicleListScreen.js
import React, { useState, useEffect } from "react";
import { COLORS } from "../../constant/color";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { getMyVehicles } from "../../services/VehicleService";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const VehicleListScreen = () => {
  // State để lưu danh sách xe
  const [vehicles, setVehicles] = useState([]);
  // State để theo dõi trạng thái tải dữ liệu
  const [isLoading, setIsLoading] = useState(true);
  // State để lưu lỗi nếu có
  const [error, setError] = useState(null);

  const router = useRouter(); // <-- Lấy đối tượng router

  // Sử dụng useEffect để gọi API khi component được render lần đầu
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true); // Bắt đầu tải
        setError(null); // Xóa lỗi cũ
        const data = await getMyVehicles();
        if (data) {
          setVehicles(data); // Cập nhật state với dữ liệu nhận được
        }
      } catch (e) {
        setError("Không thể tải dữ liệu xe.");
        console.error(e);
      } finally {
        setIsLoading(false); // Kết thúc tải
      }
    };

    fetchVehicles();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  // Hàm render cho mỗi item trong FlatList
  const renderVehicle = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/vehicle/${item.id}`)} // <-- Dòng quan trọng nhất!
    >
      <View className="mx-4 my-2 flex-row rounded-lg border border-border bg-background p-5">
        <Image
          source={{ uri: item.vehicle_avatar.image }}
          className="mr-4 h-24 w-24 rounded-full"
        />
        <View className="ml-4 flex-1">
          {/* Thay thế cho style: itemName */}
          <Text className="mt-2 text-lg font-bold text-textLight">
            {item.name}
          </Text>
          {/* Thay thế cho style: itemDetails */}
          <Text className="mt-1 text-sm text-gray-600">
            Biển số: {item.license_plate}
          </Text>
          <Text className="mt-1 text-sm text-gray-600">
            ODO: {item.odometer} km
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Hiển thị trạng thái đang tải
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  // Hiển thị danh sách xe
  return (
    <SafeAreaView className="flex-1">
      <FlatList
        data={vehicles}
        renderItem={renderVehicle}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          // Thay thế cho style: center
          <View className="flex-1 items-center justify-center">
            <Text>Bạn chưa có xe nào.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity
        onPress={() => router.push("/AddVehicleScreen")} // <-- Chuyển hướng đến trang mới
        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg"
      >
        <Text className="pb-1 text-4xl text-white">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// CSS cho component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    backgroundColor: COLORS.background,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemDetails: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
});

export default VehicleListScreen;
