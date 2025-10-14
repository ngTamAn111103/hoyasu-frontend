// screens/VehicleListScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { getMyVehicles } from "../../services/VehicleService"; // Chỉnh sửa đường dẫn

const VehicleListScreen = () => {
  // State để lưu danh sách xe
  const [vehicles, setVehicles] = useState([]);
  // State để theo dõi trạng thái tải dữ liệu
  const [isLoading, setIsLoading] = useState(true);
  // State để lưu lỗi nếu có
  const [error, setError] = useState(null);

  // Sử dụng useEffect để gọi API khi component được render lần đầu
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true); // Bắt đầu tải
        setError(null); // Xóa lỗi cũ
        const data = await getMyVehicles();
        console.log("Danh sách xe: ");
       console.log(data);
        
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
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDetails}>Biển số: {item.license_plate}</Text>
      <Text style={styles.itemDetails}>ODO: {item.odometer} km</Text>
    </View>
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
    <SafeAreaView style={styles.container}>
      <FlatList
        data={vehicles}
        renderItem={renderVehicle}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>Bạn chưa có xe nào.</Text>
          </View>
        }
      />
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
    backgroundColor: "#f9f9f9",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
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