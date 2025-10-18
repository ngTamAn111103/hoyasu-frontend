import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constant/color";
import { useAuth } from "../../context/AuthContext";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { getMyVehicles } from "../../services/VehicleService"; // <-- Import dịch vụ xe

const HomeScreen = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]); // <-- State mới cho danh sách xe
  const [isLoading, setIsLoading] = useState(true); // <-- State loading

  // --- Cấu hình BottomSheet ---
  const snapPoints = useMemo(() => ["10%", "50%", "75%"], []);
  // Sửa lỗi cú pháp: Bỏ kiểu TypeScript (<BottomSheet>) trong file .jsx
  const bottomSheetRef = useRef(null);

  // Sửa lỗi cú pháp: Bỏ kiểu TypeScript (: number) trong file .jsx
  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);

  // --- Gọi API ---
  useEffect(() => {
    // 1. Hàm gọi API chuyến đi (Giữ nguyên)
    const fetchTrips = async () => {
      setTrips([
        {
          id: 1,
          name: "Chuyến đi sáng nay",
          start_coords: { latitude: 10.7769, longitude: 106.7009 },
        },
        {
          id: 2,
          name: "Về nhà chiều qua",
          start_coords: { latitude: 10.8231, longitude: 106.6297 },
        },
      ]);
    };

    // 2. Hàm gọi API danh sách xe (Mới)
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const data = await getMyVehicles();
        if (data) {
          setVehicles(data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách xe:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
    fetchVehicles();
  }, []);

  const initialRegion = {
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // --- Hàm Render cho FlatList Xe ---
  const renderVehicleItem = ({ item }) => (
    <TouchableOpacity style={styles.vehicleItem}>
      <Image
        source={{ uri: item.vehicle_avatar.image }}
        style={styles.vehicleImage}
      />
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleName}>{item.name}</Text>
        <Text style={styles.vehiclePlate}>{item.license_plate}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          // Custom style cho bản đồ để phù hợp với theme
          // customMapStyle={mapStyle} // Sẽ thêm sau
        >
          <Marker coordinate={initialRegion} title="Vị trí của bạn" />
          {trips.map((trip) => (
            <Marker
              key={trip.id}
              coordinate={trip.start_coords}
              title={trip.name}
              // anchor giúp định vị icon đúng vào tọa độ
              anchor={{ x: 0.5, y: 0.5 }}
            >
              {/* Đặt component icon của bạn vào đây */}
              <View
                style={{
                  backgroundColor: COLORS.background,
                  padding: 8,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                }}
              >
                <Ionicons name="car-sport" size={24} color={COLORS.primary} />
              </View>
            </Marker>
          ))}
        </MapView>
        {/* Floating Search Bar (Giao diện tĩnh) */}
        <SafeAreaView style={styles.floatingContainer}>
          <View style={styles.searchBar}>
            <Text style={{ color: COLORS.textLight }}>
              Tìm kiếm chuyến đi...
            </Text>
            <Ionicons
              name="person-circle-outline"
              size={32}
              color={COLORS.primary}
            />
          </View>
        </SafeAreaView>
        {/* Sliding Bottom Panel (Giao diện tĩnh) */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0} // Bắt đầu ở điểm snap 25%
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          // Thêm các style từ StyleSheet của bạn
          backgroundStyle={{
            backgroundColor: COLORS.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          handleIndicatorStyle={styles.handleBar}
          style={styles.bottomSheetShadow} // Style cho bóng đổ
        >
          <BottomSheetView style={styles.contentContainer}>
            <Text style={styles.panelTitle}>Xe của tôi</Text>

            {/* Logic hiển thị loading hoặc danh sách */}
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={{ marginTop: 30 }}
              />
            ) : (
              <FlatList
                data={vehicles}
                renderItem={renderVehicleItem}
                keyExtractor={(item) => item.id.toString()}
                style={{ width: "100%", marginTop: 20 }}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Bạn chưa thêm xe nào.</Text>
                }
              />
            )}
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

// Sử dụng StyleSheet để code gọn gàng hơn
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 12,
    marginTop: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  // Style cho bóng đổ của BottomSheet
  bottomSheetShadow: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  // Style cho thanh handle (giữ nguyên)
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginBottom: 10,
    alignSelf: "center", // Thêm để căn giữa
  },
  // Style cho tiêu đề (giữ nguyên)
  panelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  // Style cho nội dung bên trong BottomSheet
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  // Style cho danh sách xe
  vehicleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  vehicleImage: {
    width: 60,
    height: 60,
    borderRadius: 30, // Bo tròn
    marginRight: 15,
    backgroundColor: COLORS.border, // Màu nền chờ
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  vehiclePlate: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  emptyText: {
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 20,
  },
});
export default HomeScreen;
