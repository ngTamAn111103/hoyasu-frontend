// 1 form đăng ký xe mới
// Ở màn hình đăng ký sẽ gọi tới
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getVehicleAvatars } from "../../services/VehicleService";

const VehicleForm = ({ onSubmit, onCancel }) => {
  // State để quản lý dữ liệu form
  const [name, setName] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [odometer, setOdometer] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Trạng thái cho nút tải
  const [error, setError] = useState(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [vehicleAvatars, setVehicleAvatars] = useState([]);

  // Sử dụng useEffect để gọi API khi component được render lần đầu
  useEffect(() => {
    const fetchVehicleAvatars = async () => {
      try {
        setIsLoading(true); // Bắt đầu tải
        setError(null); // Xóa lỗi cũ
        const data = await getVehicleAvatars();
        if (data) {
          setVehicleAvatars(data);
        }
      } catch (e) {
        setError("Không thể tải dữ liệu xe.");
        console.error(e);
      } finally {
        setIsLoading(false); // Kết thúc tải
      }
    };

    fetchVehicleAvatars();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  const handleSave = () => {
    // Thu thập dữ liệu từ state
    const vehicleData = {
      name: name,
      license_plate: licensePlate,
      odometer: odometer,
      vehicle_avatar_id: selectedAvatarId, // Đổi thành vehicle_avatar để khớp với model
    };
    // Gọi prop onSubmit và truyền dữ liệu ra ngoài
    onSubmit(vehicleData);
  };

  // Hàm render cho mỗi avatar trong FlatList
  const renderAvatar = ({ item }) => {
    const isSelected = item.id === selectedAvatarId;
    return (
      <TouchableOpacity
        onPress={() => setSelectedAvatarId(item.id)}
        // Thêm viền xanh nếu được chọn
        className={`h-20 w-20 items-center justify-center rounded-full border-2 p-1 ${
          isSelected ? "border-blue-500" : "border-transparent"
        }`}
      >
        <Image
          source={{ uri: item.image }}
          className="h-full w-full rounded-full"
        />
      </TouchableOpacity>
    );
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 bg-gray-100">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header của Modal */}
          <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
            {/* Sử dụng prop onCancel */}
            <TouchableOpacity onPress={onCancel}>
              <Text className="text-lg text-blue-500">Hủy</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold">Thêm xe mới</Text>
            <View style={{ width: 40 }} />
          </View>
          {/* Nội dung Form */}
          <View className="p-5">
            {/* --- Phần chọn Avatar --- */}
            <Text className="mb-3 text-base font-semibold text-gray-700">
              Chọn ảnh đại diện
            </Text>
            <FlatList
              data={vehicleAvatars}
              renderItem={renderAvatar}
              keyExtractor={(item) => item.id.toString()}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            />

            {/* --- Các trường nhập liệu --- */}
            <View className="mt-6">
              <Text className="mb-2 text-base font-semibold text-gray-700">
                Tên xe (Gợi nhớ)
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ví dụ: My Winner X, Xe đi làm"
                className="rounded-lg border border-gray-300 bg-white p-4 text-base"
              />
            </View>

            <View className="mt-4">
              <Text className="mb-2 text-base font-semibold text-gray-700">
                Biển số xe
              </Text>
              <TextInput
                value={licensePlate}
                onChangeText={setLicensePlate}
                placeholder="Ví dụ: 59-X3 12345"
                autoCapitalize="characters"
                className="rounded-lg border border-gray-300 bg-white p-4 text-base"
              />
            </View>

            <View className="mt-4">
              <Text className="mb-2 text-base font-semibold text-gray-700">
                Số ODO (km)
              </Text>
              <TextInput
                value={odometer}
                onChangeText={setOdometer}
                placeholder="Ví dụ: 53000"
                keyboardType="numeric"
                className="rounded-lg border border-gray-300 bg-white p-4 text-base"
              />
            </View>
          </View>

          {/* Đẩy nút Lưu xuống dưới cùng */}
          <View className="flex-1" />

          {/* Nút Lưu */}
          <View className="p-5">
            <TouchableOpacity
              onPress={handleSave}
              className="items-center justify-center rounded-lg bg-blue-500 p-4 shadow"
            >
              <Text className="text-lg font-bold text-white">Lưu lại</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default VehicleForm;
