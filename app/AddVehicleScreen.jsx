// Chịu trách nhiệm là cả 1 màn hình
import React from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { createVehicle } from "../services/VehicleService"; // <-- Chúng ta sẽ tạo hàm này ở bước sau
import VehicleForm from "../components/screens/VehicleForm";

const AddVehicleScreen = () => {
  const router = useRouter();

  // Hàm này sẽ được gọi khi người dùng nhấn "Lưu" trong VehicleForm
  const handleCreateVehicle = async (vehicleData) => {
    try {
      // Gọi API để tạo xe mới
      const result = await createVehicle(vehicleData);
      
      if (result) {
        Alert.alert("Thành công", "Đã thêm xe mới thành công!");
        // Quay trở lại màn hình danh sách
        router.back();
      } else {
        // Xử lý lỗi từ API (ví dụ: biển số trùng)
        Alert.alert("Lỗi", "Không thể thêm xe. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo xe:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi không mong muốn.");
    }
  };

  // Hàm này sẽ được gọi khi người dùng nhấn "Hủy"
  const handleCancel = () => {
    router.back();
  };

  return (
    // Hiện tại chỉ render form đăng ký xe mới
    <VehicleForm 
      onSubmit={handleCreateVehicle} 
      onCancel={handleCancel} 
    />
  );
};

export default AddVehicleScreen;