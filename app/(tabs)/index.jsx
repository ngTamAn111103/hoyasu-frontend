// Thư viện react cơ bản
import {
  Alert,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useRef, useMemo } from "react";
// Thư viện react nâng cao
import {
  FlatList,
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
// Bản đồ
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

// Color
import { COLORS } from "../../constant/color";
// ICON
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
// Bottom sheet
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

// API
import { getMyVehicles } from "../../services/VehicleService";
import { getTravelMethod } from "../../services/TravelMethodService";
import { createTripByVehicle, getActiveTrip, endActiveTrip } from "../../services/TripService";

import { Image } from "expo-image";

// Giao diện/Chức năng của màn hình Home
const HomeScreen = () => {
  // HẰNG SỐ
  // Toạ độ mặc định khi vừa render MapView
  let INITIAL_REGION = {
    latitude: 10.851548396166965,
    longitude: 106.75812846725613,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  const DELAY_LONG_PRESS = 500;

  // useRef
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);

  // useState
  // Vị trí lấy 1 lần duy nhất, khi người dùng vào app
  const [currentLocation, setCurrentLocation] = useState(INITIAL_REGION);
  // Danh sách chuyến đi người dùng đã di chuyển
  const [trips, setTrips] = useState([]);
  // Trạng thái loading
  const [isLoading, setIsLoading] = useState(false);
  // Danh sách phương tiện cá nhân
  const [vehicles, setVehicles] = useState([]);
  // Danh sách (only 1) chuyến đi chưa kết thúc
  const [activeTrip, setActiveTrip] = useState(null);
  // Danh sách phương thức di chuyển
  const [travelMethod, setTravelMethod] = useState([]);
  // useMemo
  const snapPoints = useMemo(() => ["10%", "50%", "75%"], []);
  // Function

  // useEffect: Chỉ chạy 1 lần duy nhất
  useEffect(() => {
    // 1. Lấy vị trí khi người dùng vừa vào app, chỉ yêu cầu 1 lần và không chạy nền
    const requestAndGetLocation = async () => {
      try {
        // hiển thị hộp thoại xin quyền
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          // Alert.alert("Lỗi", "Quyền truy cập vị trí đã bị từ chối.");
          return;
        }

        // Lấy vị trí hiện tại 1 lần duy nhất
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest, // Chỉ cần tương đối để hiển thị lên giao diện
          timeout: 5000, // Thêm timeout 5 giây
        });

        // Tạo vùng mới từ tọa độ GPS lấy được
        const userRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.005,
        };
        setCurrentLocation(userRegion);

        // Gán hiệu ứng cho mapRef
        mapRef.current?.animateToRegion(userRegion, 1000);
      } catch (error) {
        console.error("Lỗi khi xin/lấy vị trí:", error);
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi lấy vị trí.");
      }
    };
    // 2. Lấy danh sách chuyến đi đã thực hiện
    const fetchTrips = async () => {
      setTrips([
        {
          id: 1,
          name: "Chuyến đi sáng nay",
          start_coords: {
            latitude: 10.852548396166965,
            longitude: 106.75812846725613,
          },
        },
        {
          id: 2,
          name: "Về nhà chiều qua",
          start_coords: { latitude: 10.8231, longitude: 106.6297 },
        },
      ]);
    };
    // 3. Hàm gọi API danh sách xe cá nhân
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
    // 4. Hàm gọi API danh sách các phương tiện di chuyển (Xe buýt, Taxi, máy bay, ...).
    const fetchTravelMethod = async () => {
      setIsLoading(true);
      try {
        const data = await getTravelMethod();
        if (data) {
          setTravelMethod(data);
        }
      } catch (error) {
        console.error(
          "Lỗi khi tải danh sách các phương tiện di chuyển:",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    requestAndGetLocation();
    fetchTrips();
    fetchVehicles();
    fetchTravelMethod();
  }, []); // Chỉ chạy 1 lần

  // Handle
  // Handle xử lý Long Press (nhấn giữ) của các phương tiện cá nhân (vehicle)
  const handleCreateTripByVehicle = async (vehicleData) => {
    try {
      // Xin quyền lấy ngay cả khi chạy nền
      let { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Quyền truy cập vị trí liên tục đã bị từ chối.");
        return; // Dừng lại
      }

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // 1 giây
          distanceInterval: 10, // 10 mét
        },
        (newLocation) => {
          // Hàm này được gọi liên tục với vị trí mới
          // (newLocation.coords.latitude, ...)
          console.log(newLocation);
          
        },
      );

      // Để dừng theo dõi:
      // locationSubscription.remove();

      // Tạo dữ liệu chuyến đi
      const data = {
        vehicle_id: vehicleData.id,
        start_latitude: parseFloat(location.coords.latitude.toFixed(6)),
        start_longitude: parseFloat(location.coords.longitude.toFixed(6)),
      };

      // --- 4. Gọi API tạo chuyến đi ---
      const result = await createTripByVehicle(data);

      if (result) {
        Alert.alert("Thành công", "Đã tạo chuyến đi!");
        // fetchActiveTrip();
      } else {
        Alert.alert("Lỗi", "Không thể tạo chuyến đi. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo chuyến đi:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi không mong muốn.");
    }

    bottomSheetRef.current?.snapToIndex(0);
  };

  // Render item
  // --- Hàm Render cho FlatList Xe ---
  const renderVehicleItem = ({ item }) => {
    // 1. Kiểm tra xem item này có đang active không
    const isActive = activeTrip && activeTrip.vehicle?.id === item.id;
    // 2. Kiểm tra xem nút có bị vô hiệu hóa không
    // (Bất kỳ chuyến đi nào đang active cũng sẽ vô hiệu hóa TẤT CẢ)
    const isDisabled = activeTrip != null;

    return (
      <TouchableOpacity
        style={[
          styles.vehicleItem,
          // 3. Áp dụng style phụ
          isDisabled && !isActive && styles.itemDisabled, // Nếu item này bị vô hiệu hóa, VÀ nó không phải là item đang active, thì áp dụng style làm mờ nó đi
          isActive && styles.itemActive, // Nếu item này chính là item đang active, thì áp dụng style làm nổi bật nó lên
        ]}
        onLongPress={() => handleCreateTripByVehicle(item)}
        delayLongPress={DELAY_LONG_PRESS}
        disabled={isDisabled}
      >
        <Image
          source={{ uri: item.vehicle_avatar.image }}
          style={styles.vehicleImage}
        />
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>{item.name}</Text>
          <Text style={styles.vehiclePlate}>{item.license_plate}</Text>
        </View>
        {/* 5. Thêm một "huy hiệu" để báo đang active */}
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>Đang đi</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  // --- Hàm Render cho FlatList Phương thức khác ---
  const renderTravelMethodItem = ({ item }) => {
    // 1. Kiểm tra xem item.data_schema có tồn tại hay không
    const schemaLabels = item.data_schema
      ? Object.values(item.data_schema) // Lấy ra mảng các object [ {label: ...}, {label: ...} ]
          .map((field) => field.label) // Lấy ra mảng các chuỗi [ "Tuyến xe", "Giá vé", ... ]
          .join(", ") // Nối chúng lại: "Tuyến xe, Giá vé, ..."
      : null; // Nếu data_schema là null, không hiển thị gì

    return (
      <TouchableOpacity
        style={styles.vehicleItem}
        onLongPress={() => handleCreateTripByTravelMethod(item)}
        delayLongPress={DELAY_LONG_PRESS}
      >
        <Image source={{ uri: item.icon }} style={styles.vehicleImage} />
        <View style={styles.vehicleInfo}>
          {/* Dòng này giữ nguyên */}
          <Text style={styles.vehicleName}>{item.name}</Text>

          {/* 2. Hiển thị các label đã được nối, nếu có */}
          {schemaLabels && (
            <Text
              style={styles.vehiclePlate} // Tận dụng style cũ (chữ nhỏ, màu xám)
              numberOfLines={1} // Đảm bảo chỉ hiển thị trên 1 dòng
            >
              {schemaLabels}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    // Bao bọc: Thao tác vuốt, chụm, nhấn
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* Bản đồ */}
        <MapView
          style={styles.map}
          initialRegion={INITIAL_REGION}
          ref={mapRef}
          // Custom style cho bản đồ để phù hợp với theme
          // customMapStyle={mapStyle} // Sẽ thêm sau
        >
          <Marker
            key="myLocation"
            coordinate={currentLocation}
            title="Vị trí của bạn"
          >
            <View style={styles.myLocation}>
              <Ionicons name="pin" size={24} color={COLORS.primary} />
            </View>
          </Marker>
          {trips.map((trip) => (
            <Marker
              key={trip.id}
              coordinate={trip.start_coords}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.trip}>
                <Ionicons name="car-sport" size={24} color={COLORS.primary} />
              </View>
            </Marker>
          ))}
          {/* <Polyline
            coordinates={path} // Lấy dữ liệu từ state
            strokeColor={COLORS.primary} // Màu của đường
            strokeWidth={6} // Độ dày
          /> */}
        </MapView>
        {/* Search Bar */}
        <SafeAreaView style={styles.floatingContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={{ color: COLORS.textLight }}
              placeholder="Tìm kiếm chuyến đi..."
            ></TextInput>
            <Ionicons
              name="person-circle-outline"
              size={32}
              color={COLORS.primary}
            />
          </View>
        </SafeAreaView>
        {/* Sliding Bottom Panel (Danh sách phương tiện/phương thức di chuyển) */}
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={0}
          backgroundStyle={{
            backgroundColor: COLORS.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          handleIndicatorStyle={styles.handleBar}
          style={styles.bottomSheetShadow}
        >
          <BottomSheetScrollView style={styles.scrollContainer}>
            <Text style={styles.panelTitle}>Xe của tôi</Text>
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
                scrollEnabled={false}
              />
            )}
            <Text style={styles.panelTitle}>Phương thức khác</Text>

            {/* Logic hiển thị loading hoặc danh sách */}
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={{ marginTop: 30 }}
              />
            ) : (
              <FlatList
                data={travelMethod}
                renderItem={renderTravelMethodItem}
                keyExtractor={(item) => item.id.toString()}
                style={{ width: "100%", marginTop: 20 }}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Bạn chưa thêm xe nào.</Text>
                }
                scrollEnabled={false}
              />
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  // GestureHandlerRootView
  container: {
    flex: 1, // Chiếm toàn bộ màn hình
  },
  // Bản đồ
  map: {
    // shortcut:chiếm toàn bộ không gian của component cha chứa nó
    ...StyleSheet.absoluteFillObject,
  },
  // Vị trí hiện tại của bản thân khi vừa vào app
  myLocation: {
    backgroundColor: COLORS.background,
    padding: 5,
    borderRadius: 50,
    borderColor: COLORS.border,
    borderWidth: 2,
  },
  // Trip
  trip: {
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  // Thanh tìm kiếm
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
  // Liên quan tới Bottom Sheet
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginBottom: 10,
    alignSelf: "center", // Thêm để căn giữa
  },
  bottomSheetShadow: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // "Xe của tôi"
  panelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },
  // Style cho danh sách xe
  vehicleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    position: "relative", // <-- Thêm để định vị "huy hiệu"
  },
  vehicleImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: COLORS.border,
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
