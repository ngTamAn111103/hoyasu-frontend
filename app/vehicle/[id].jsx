// app/vehicle/[id].jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
  StyleSheet, // <--- Đã thêm
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getVehicleDetails } from "../../services/VehicleService";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Helper component để định dạng số cho đẹp
const formatCurrency = (value) => {
  const number = parseFloat(value);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};

// Component con cho mỗi mục trong danh sách đổ xăng
const RefuelItem = ({ item }) => (
  <View style={styles.refuelItem_container}>
    {/* Icon */}
    <View style={styles.refuelItem_iconContainer}>
      <Text style={styles.refuelItem_iconText}>⛽</Text>
    </View>
    {/* Thông tin */}
    <View style={styles.refuelItem_infoContainer}>
      <Text style={styles.refuelItem_dateText}>
        {new Date(item.timestamp).toLocaleDateString("vi-VN")}
      </Text>
      <Text style={styles.refuelItem_odoText}>
        ODO: {item.odometer.toLocaleString("vi-VN")} km
      </Text>
    </View>
    {/* Chi phí */}
    <View style={styles.refuelItem_costContainer}>
      <Text style={styles.refuelItem_costText}>
        {formatCurrency(item.cost)}
      </Text>
      <Text style={styles.refuelItem_litersText}>{item.liters} L</Text>
    </View>
  </View>
);

// Component con cho mỗi mục trong danh sách bảo dưỡng
const MaintenanceItem = ({ item }) => (
  <View style={styles.maintItem_container}>
    {/* Hàng trên: Thông tin chính */}
    <View style={styles.maintItem_topRow}>
      {/* Bên trái: Icon & Tên dịch vụ */}
      <View style={styles.maintItem_leftCol}>
        <View style={styles.maintItem_iconContainer}>
          <Text style={styles.maintItem_iconText}>🛠️</Text>
        </View>
        <View style={styles.maintItem_textContainer}>
          <Text style={styles.maintItem_typeText} numberOfLines={1}>
            {item.maintenance_type}
          </Text>
          <Text style={styles.maintItem_dateText}>
            {new Date(item.timestamp).toLocaleDateString("vi-VN")}
          </Text>
        </View>
      </View>

      {/* Bên phải: Chi phí */}
      <Text style={styles.maintItem_costText}>
        {formatCurrency(item.cost)}
      </Text>
    </View>

    {/* Hàng dưới: Thông tin chi tiết */}
    <View style={styles.maintItem_bottomSection}>
      {/* Odometer */}
      <View style={styles.maintItem_detailRow}>
        <Ionicons name="speedometer-outline" size={16} color="#6B7280" />
        <Text style={styles.maintItem_detailText}>
          ODO: {item.odometer.toLocaleString("vi-VN")} km
        </Text>
      </View>

      {/* Nơi bảo dưỡng (nếu có) */}
      {item.service_center && (
        <View style={styles.maintItem_detailRowMargin}>
          <Ionicons name="business-outline" size={16} color="#6B7280" />
          <Text style={styles.maintItem_detailText}>
            {item.service_center}
          </Text>
        </View>
      )}

      {/* Ghi chú (nếu có) */}
      {item.notes && (
        <View style={styles.maintItem_notesRow}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={16}
            color="#6B7280"
          />
          <Text style={styles.maintItem_notesText}>{item.notes}</Text>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy thông tin xe.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      {/* Cấu hình Header của trang */}
      <Stack.Screen
        options={{ title: vehicle.name, headerBackTitle: "Trở về" }}
      />

      <ScrollView>
        {/* --- 1. Thẻ thông tin chính --- */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Image
              source={{ uri: vehicle.vehicle_avatar.image }}
              style={styles.avatar}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.licensePlate}>
                {vehicle.license_plate}
              </Text>
            </View>
          </View>
          <View style={styles.odoBar}>
            <View style={styles.odoItem}>
              <Text style={styles.odoLabel}>ODO Hiện tại</Text>
              <Text style={styles.odoValue}>
                {vehicle.odometer.toLocaleString("vi-VN")} km
              </Text>
            </View>
            {/* Bạn có thể thêm các thông số khác ở đây */}
          </View>
        </View>

        {/* --- 2. Lịch sử nhiên liệu --- */}
        <View style={styles.sectionContainer}>
          {/* Header với nút Thêm */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử đổ xăng</Text>
            <TouchableOpacity
              onPress={() => router.push(`/refuel/add?vehicleId=${id}`)}
              style={[styles.addButton, styles.addRefuelButton]}
            >
              <Ionicons name="add" size={20} color="#007AFF" />
              <Text style={styles.addRefuelText}>Thêm</Text>
            </TouchableOpacity>
          </View>
          {vehicle.refuels && vehicle.refuels.length > 0 ? (
            <FlatList
              data={vehicle.refuels}
              renderItem={({ item }) => <RefuelItem item={item} />}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyListText}>
              Chưa có dữ liệu đổ xăng.
            </Text>
          )}
        </View>

        {/* --- 3. Lịch sử bảo dưỡng (ĐÃ CẬP NHẬT) --- */}
        <View style={styles.maintenanceSection}>
          {/* Header với nút Thêm */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử bảo dưỡng</Text>
            <TouchableOpacity
              onPress={() =>
                router.push(`/maintenance/add?vehicleId=${id}`)
              }
              style={[styles.addButton, styles.addMaintButton]}
            >
              <Ionicons name="add" size={20} color="#34C759" />
              <Text style={styles.addMaintText}>Thêm</Text>
            </TouchableOpacity>
          </View>

          {/* Danh sách các lần bảo dưỡng */}
          {vehicle.maintenances && vehicle.maintenances.length > 0 ? (
            <FlatList
              data={vehicle.maintenances}
              renderItem={({ item }) => <MaintenanceItem item={item} />}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyListText}>
              Chưa có dữ liệu bảo dưỡng.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Bảng StyleSheet ---

const shadowSm = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.18,
  shadowRadius: 1.0,
  elevation: 1,
};

const styles = StyleSheet.create({
  // RefuelItem Styles
  refuelItem_container: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB", // border-gray-200
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  refuelItem_iconContainer: {
    marginRight: 16,
    borderRadius: 9999,
    backgroundColor: "#DBEAFE", // bg-blue-100
    padding: 12,
  },
  refuelItem_iconText: {
    fontSize: 24,
  },
  refuelItem_infoContainer: {
    flex: 1,
  },
  refuelItem_dateText: {
    fontSize: 16,
    fontWeight: "600", // font-semibold
  },
  refuelItem_odoText: {
    fontSize: 14,
    color: "#6B7280", // text-gray-500
  },
  refuelItem_costContainer: {
    alignItems: "flex-end",
  },
  refuelItem_costText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626", // text-red-600
  },
  refuelItem_litersText: {
    fontSize: 14,
    color: "#6B7280", // text-gray-500
  },

  // MaintenanceItem Styles
  maintItem_container: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB", // border-gray-200
    backgroundColor: "#FFFFFF",
    padding: 16,
    ...shadowSm, // shadow-sm
  },
  maintItem_topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  maintItem_leftCol: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 16,
  },
  maintItem_iconContainer: {
    marginRight: 12,
    borderRadius: 9999,
    backgroundColor: "#D1FAE5", // bg-green-100
    padding: 12,
  },
  maintItem_iconText: {
    fontSize: 24,
  },
  maintItem_textContainer: {
    flex: 1,
  },
  maintItem_typeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937", // text-gray-800
  },
  maintItem_dateText: {
    fontSize: 14,
    color: "#6B7280", // text-gray-500
  },
  maintItem_costText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669", // text-green-600
  },
  maintItem_bottomSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: "#F3F4F6", // border-gray-100
    paddingTop: 12,
  },
  maintItem_detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  maintItem_detailRowMargin: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  maintItem_detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4B5563", // text-gray-600
  },
  maintItem_notesRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  maintItem_notesText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: "#4B5563", // text-gray-600
  },

  // VehicleDetailScreen Styles
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6", // bg-gray-100
  },
  mainCard: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 20,
    ...shadowSm, // shadow-sm
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: 80,
    width: 80,
    borderRadius: 40,
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  vehicleName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1F2937", // text-gray-800
  },
  licensePlate: {
    fontSize: 18,
    color: "#6B7280", // text-gray-500
  },
  odoBar: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 8,
    backgroundColor: "#F9FAFB", // bg-gray-50
    padding: 12,
  },
  odoItem: {
    alignItems: "center",
  },
  odoLabel: {
    fontSize: 14,
    color: "#6B7280", // text-gray-500
  },
  odoValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937", // text-gray-800
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937", // text-gray-800
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  addRefuelButton: {
    backgroundColor: "#DBEAFE", // bg-blue-100
  },
  addRefuelText: {
    marginLeft: 4,
    fontWeight: "600",
    color: "#3B82F6", // text-blue-500
  },
  emptyListText: {
    textAlign: "center",
    color: "#6B7280", // text-gray-500
  },
  maintenanceSection: {
    paddingHorizontal: 16,
    marginTop: 24,
    paddingBottom: 40,
  },
  addMaintButton: {
    backgroundColor: "#D1FAE5", // bg-green-100
  },
  addMaintText: {
    marginLeft: 4,
    fontWeight: "600",
    color: "#059669", // text-green-600
  },
});

export default VehicleDetailScreen;