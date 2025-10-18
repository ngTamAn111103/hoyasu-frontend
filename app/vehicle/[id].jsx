// app/vehicle/[id].jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getVehicleDetails } from "../../services/VehicleService";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Dùng icon cho đẹp
import { useRouter } from "expo-router";

// Helper component để định dạng số cho đẹp
const formatCurrency = (value) => {
  // Chuyển đổi chuỗi thành số, loại bỏ phần thập phân không cần thiết
  const number = parseFloat(value);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};

// Component con cho mỗi mục trong danh sách đổ xăng
const RefuelItem = ({ item }) => (
  <View className="mb-3 flex-row items-center rounded-lg border border-gray-200 bg-white p-4">
    {/* Icon */}
    <View className="mr-4 rounded-full bg-blue-100 p-3">
      <Text className="text-2xl">⛽</Text>
    </View>
    {/* Thông tin */}
    <View className="flex-1">
      <Text className="text-base font-semibold">
        {new Date(item.timestamp).toLocaleDateString("vi-VN")}
      </Text>
      <Text className="text-sm text-gray-500">
        ODO: {item.odometer.toLocaleString("vi-VN")} km
      </Text>
    </View>
    {/* Chi phí */}
    <View className="items-end">
      <Text className="text-lg font-bold text-red-600">
        {formatCurrency(item.cost)}
      </Text>
      <Text className="text-sm text-gray-500">{item.liters} L</Text>
    </View>
  </View>
);
const MaintenanceItem = ({ item }) => (
  <View className="mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    {/* Hàng trên: Thông tin chính */}
    <View className="flex-row items-start justify-between">
      {/* Bên trái: Icon & Tên dịch vụ */}
      <View className="flex-row items-center flex-1 pr-4">
        <View className="mr-3 rounded-full bg-green-100 p-3">
          {/* Bạn có thể dùng icon 🛠️ hoặc ⚙️ */}
          <Text className="text-2xl">🛠️</Text>
        </View>
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-gray-800"
            numberOfLines={1}
          >
            {item.maintenance_type}
          </Text>
          <Text className="text-sm text-gray-500">
            {new Date(item.timestamp).toLocaleDateString("vi-VN")}
          </Text>
        </View>
      </View>
      
      {/* Bên phải: Chi phí */}
      <Text className="text-lg font-bold text-green-600">
        {formatCurrency(item.cost)}
      </Text>
    </View>

    {/* Hàng dưới: Thông tin chi tiết */}
    <View className="mt-3 border-t border-gray-100 pt-3">
      {/* Odometer */}
      <View className="flex-row items-center">
        <Ionicons name="speedometer-outline" size={16} color="#6B7280" />
        <Text className="ml-2 text-sm text-gray-600">
          ODO: {item.odometer.toLocaleString("vi-VN")} km
        </Text>
      </View>
      
      {/* Nơi bảo dưỡng (nếu có) */}
      {item.service_center && (
        <View className="mt-1 flex-row items-center">
          <Ionicons name="business-outline" size={16} color="#6B7280" />
          <Text className="ml-2 text-sm text-gray-600">
            {item.service_center}
          </Text>
        </View>
      )}

      {/* Ghi chú (nếu có) */}
      {item.notes && (
        <View className="mt-1 flex-row items-start">
          <Ionicons name="chatbubble-ellipses-outline" size={16} color="#6B7280" />
          <Text className="ml-2 flex-1 text-sm text-gray-600">
            {item.notes}
          </Text>
        </View>
      )}
    </View>
  </View>
);

const VehicleDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      const fetchDetails = async () => {
        setIsLoading(true);
        const data = await getVehicleDetails(id);
        setVehicle(data);
        setIsLoading(false);
        console.log(data);
      };
      fetchDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Không tìm thấy thông tin xe.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-gray-100">
      {/* Cấu hình Header của trang */}
      <Stack.Screen
        options={{ title: vehicle.name, headerBackTitle: "Trở về" }}
      />

      <ScrollView>
        {/* --- 1. Thẻ thông tin chính --- */}
        <View className="m-4 rounded-2xl bg-white p-5 shadow-sm">
          <View className="flex-row items-center">
            <Image
              source={{ uri: vehicle.vehicle_avatar.image }}
              className="h-20 w-20 rounded-full"
            />
            <View className="ml-4 flex-1">
              <Text className="text-3xl font-bold text-gray-800">
                {vehicle.name}
              </Text>
              <Text className="text-lg text-gray-500">
                {vehicle.license_plate}
              </Text>
            </View>
          </View>
          <View className="mt-4 flex-row justify-around rounded-lg bg-gray-50 p-3">
            <View className="items-center">
              <Text className="text-sm text-gray-500">ODO Hiện tại</Text>
              <Text className="text-xl font-bold text-gray-800">
                {vehicle.odometer.toLocaleString("vi-VN")} km
              </Text>
            </View>
            {/* Bạn có thể thêm các thông số khác ở đây */}
          </View>
        </View>

        {/* --- 2. Lịch sử nhiên liệu --- */}
        <View className="mt-8 px-4">
          {/* Header với nút Thêm */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-800">
              Lịch sử đổ xăng
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/refuel/add?vehicleId=${id}`)}
              className="flex-row items-center rounded-full bg-blue-100 px-3 py-1"
            >
              <Ionicons name="add" size={20} color="#007AFF" />
              <Text className="ml-1 font-semibold text-blue-500">Thêm</Text>
            </TouchableOpacity>
          </View>
          {vehicle.refuels && vehicle.refuels.length > 0 ? (
            <FlatList
              data={vehicle.refuels}
              renderItem={({ item }) => <RefuelItem item={item} />}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false} // Tắt cuộn của FlatList để ScrollView chính xử lý
            />
          ) : (
            <Text className="text-center text-gray-500">
              Chưa có dữ liệu đổ xăng.
            </Text>
          )}
        </View>

        {/* --- 3. Lịch sử bảo dưỡng (ĐÃ CẬP NHẬT) --- */}
        <View className="px-4 mt-6 pb-10">
          {/* Header với nút Thêm */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-800">
              Lịch sử bảo dưỡng
            </Text>
            <TouchableOpacity 
              onPress={() => router.push(`/maintenance/add?vehicleId=${id}`)}
              className="flex-row items-center rounded-full bg-green-100 px-3 py-1"
            >
              <Ionicons name="add" size={20} color="#34C759" />
              <Text className="ml-1 font-semibold text-green-600">Thêm</Text>
            </TouchableOpacity>
          </View>
          
          {/* Danh sách các lần bảo dưỡng */}
          {vehicle.maintenances && vehicle.maintenances.length > 0 ? (
            <FlatList
              data={vehicle.maintenances}
              renderItem={({ item }) => <MaintenanceItem item={item} />}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false} // Để ScrollView chính cuộn
            />
          ) : (
            <Text className="text-center text-gray-500">
              Chưa có dữ liệu bảo dưỡng.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleDetailScreen;
