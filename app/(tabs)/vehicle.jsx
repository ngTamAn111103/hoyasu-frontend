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
      {/* Thay thế: "mx-4 my-2 flex-row rounded-lg border border-border bg-background p-5" */}
      <View style={styles.itemContainer}>
        {/* Thay thế: "mr-4 h-24 w-24 rounded-full" */}
        <Image
          source={{ uri: item.vehicle_avatar.image }}
          style={styles.vehicleImage}
        />
        {/* Thay thế: "ml-4 flex-1" */}
        <View style={styles.textContainer}>
          {/* Thay thế: "mt-2 text-lg font-bold text-textLight" */}
          <Text style={styles.itemName}>
            {item.name}
          </Text>
          {/* Thay thế: "mt-1 text-sm text-gray-600" */}
          <Text style={styles.itemDetails}>
            Biển số: {item.license_plate}
          </Text>
          {/* Thay thế: "mt-1 text-sm text-gray-600" */}
          <Text style={styles.itemDetails}>
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
    // Thay thế: "flex-1"
    <SafeAreaView style={styles.container}>
      <FlatList
        data={vehicles}
        renderItem={renderVehicle}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          // Thay thế: "flex-1 items-center justify-center"
          <View style={styles.center}>
            <Text>Bạn chưa có xe nào.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity
        onPress={() => router.push("/AddVehicleScreen")} // <-- Chuyển hướng đến trang mới
        // Thay thế: "absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg"
        style={styles.addButton}
      >
        {/* Thay thế: "pb-1 text-4xl text-white" */}
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// CSS cho component
const styles = StyleSheet.create({
  // Cập nhật từ className="flex-1"
  container: {
    flex: 1,
  },
  // Giữ nguyên, được sử dụng cho loading, error, và empty list
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Cập nhật từ className="mx-4 my-2 flex-row rounded-lg border border-border bg-background p-5"
  itemContainer: {
    backgroundColor: COLORS.background,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row", // từ 'flex-row'
  },
  // Style mới từ className="mr-4 h-24 w-24 rounded-full"
  vehicleImage: {
    marginRight: 16, // mr-4
    height: 96, // h-24
    width: 96, // w-24
    borderRadius: 48, // rounded-full
  },
  // Style mới từ className="ml-4 flex-1"
  textContainer: {
    marginLeft: 16, // ml-4
    flex: 1, // flex-1
  },
  // Cập nhật từ className="mt-2 text-lg font-bold text-textLight"
  itemName: {
    fontSize: 18, // text-lg
    fontWeight: "bold", // font-bold
    marginTop: 8, // mt-2
    color: COLORS.textLight, // text-textLight 
  },
  // Cập nhật từ className="mt-1 text-sm text-gray-600"
  itemDetails: {
    fontSize: 14, // text-sm
    color: "#555", // text-gray-600 (giữ màu gốc)
    marginTop: 4, // mt-1
  },
  // Style mới từ className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg"
  addButton: {
    position: "absolute",
    bottom: 24, // bottom-6
    right: 24, // right-6
    height: 64, // h-16
    width: 64, // w-16
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32, // rounded-full
    backgroundColor: COLORS.primary, // bg-primary 
    // shadow-lg
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  // Style mới từ className="pb-1 text-4xl text-white"
  addButtonText: {
    paddingBottom: 4, // pb-1 (để căn chỉnh dấu +)
    fontSize: 36, // text-4xl
    color: "#fff", // text-white
  },
});

export default VehicleListScreen;