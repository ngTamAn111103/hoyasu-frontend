// Thư viện
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
} from "react-native";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constant/color";
import { useAuth } from "../../context/AuthContext";
import * as Location from 'expo-location';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { getMyVehicles } from "../../services/VehicleService";
import { createTripByVehicle, getActiveTrip, endActiveTrip } from "../../services/TripService";
import { getTravelMethod } from "../../services/TravelMethodService";

// Thời gian nhấn để tạo chuyến đi (ms)
const DELAY_LONG_PRESS = 500;

const HomeScreen = () => {
  // Mảng chuyến đi để thể hiện trên bản đồ
  const [trips, setTrips] = useState([]);
  // Mảng (1 item) chuyến đi đang thực hiện
  const [activeTrip, setActiveTrip] = useState(null);
  // Mảng phương tiện cá nhân
  const [vehicles, setVehicles] = useState([]);
  // Mảng phương thức di chuyển
  const [travelMethod, setTravelMethod] = useState([]);
  // Dành cho vị trí hiện tại của người dùng đang đứng
  const [currentLocation, setCurrentLocation] = useState(null); // State lưu vị trí
  // String hiển hiển thị lỗi nếu cần, (Không được quyền truy cập)
  const [locationError, setLocationError] = useState(null);
  // State để vẽ đường đi
  const [path, setPath] = useState([]);
  // 1. Thêm một ref để lưu subscription
  const locationSubscription = useRef(null);

  // Kiểm tra có đang trong trạng thái loading không?
  const [isLoading, setIsLoading] = useState(true);
  // Lấy trạng thái xác thực: Tránh gọi API khi chưa đăng nhập
  const { isSignedIn, isLoading: isAuthLoading } = useAuth();


  // --- Cấu hình BottomSheet ---
  const snapPoints = useMemo(() => ["10%", "50%", "75%"], []);
  const bottomSheetRef = useRef(null);

  // Vị trí hiện tại (Giả định)
  const initialRegion = {
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  // Tính toán region mới nếu có vị trí
  const region = currentLocation ? {
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.005,
  } : initialRegion;

  // 1. Hàm gọi API chuyến đi
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

  // 2. Hàm gọi API danh sách xe cá nhân
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

  // 3. Hàm gọi API danh sách các phương tiện di chuyển (Xe buýt, Taxi, máy bay, ...).
  const fetchTravelMethod = async () => {
    setIsLoading(true);
    try {
      const data = await getTravelMethod();
      if (data) {
        setTravelMethod(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách các phương tiện di chuyển:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // 4. Hàm gọi API lấy và kiểm tra xem đang có chuyến đi nào chưa kết thúc hay không.
  const fetchActiveTrip = async () => {
    setIsLoading(true);
    try {
      const data = await getActiveTrip();
      if (data) {
        setActiveTrip(data);
      } else {
        // Nếu mảng rỗng hoặc là null, gán activeTrip là null
        setActiveTrip(null);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyến đi chưa kết thúc:", error);
      setActiveTrip(null); // Đảm bảo gán null nếu có lỗi
    } finally {
      setIsLoading(false);
    }
  };

  // Handle xử lý trượt của Bottom sheet
  const handleSheetChanges = useCallback((index) => { }, []);

  // Hàm BẬT theo dõi
  const startWatchingLocation = useCallback(async () => {
    // Xin quyền
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Lỗi", "Quyền truy cập vị trí đã bị từ chối.");
      return;
    }

    // Bật theo dõi
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000, // 1 giây
        distanceInterval: 10, // 10 mét
      },
      (newLocation) => {
        setCurrentLocation(newLocation.coords); // Cập nhật vị trí marker
        // GHI LẠI ĐƯỜNG ĐI
        setPath((prevPath) => [...prevPath, newLocation.coords]);
        console.log(newLocation.coords);

      }
    );
  }, []); // Hàm này không đổi, nên dùng useCallback

  // Hàm TẮT theo dõi
  const stopWatchingLocation = useCallback(() => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  }, []); // Hàm này cũng không đổi

  // Handle xử lý Long Press (nhấn giữ) của các phương tiện cá nhân (vehicle)
  const handleCreateTripByVehicle = async (vehicleData) => {
    try {
      const result = await createTripByVehicle({
        vehicle_id: vehicleData.id,
        start_latitude: initialRegion.latitude,
        start_longitude: initialRegion.longitude,
      });

      if (result) {
        Alert.alert("Thành công", "Đã tạo chuyến đi mới bằng vehicle!");
        fetchActiveTrip();
      } else {
        Alert.alert(
          "Lỗi",
          "Không thể tạo chuyến đi mới bằng vehicle. Vui lòng thử lại.",
        );
      }
    } catch (error) {
      console.error("Lỗi khi tạo chuyến đi mới bằng vehicle:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi không mong muốn.");
    }

    // Tùy chọn: Tự động đóng BottomSheet lại
    bottomSheetRef.current?.snapToIndex(0);
  };

  // Gọi API và cập nhật lại các state nếu người dùng kết thúc chuyến đi
  const handleEndTrip = async () => {
    // Nếu không có chuyến đi nào hiện tại || không lấy được vị trí hiện tại
    if (!activeTrip || !currentLocation) {
      return
    }
    try {
      // Tạo biến json để gửi tới API
      const endData = {
        // 1. Dùng toFixed(6) cho vĩ độ (latitude)
        end_latitude: parseFloat(currentLocation.latitude.toFixed(6)),

        // 2. Dùng toFixed(7) cho kinh độ (longitude)
        end_longitude: parseFloat(currentLocation.longitude.toFixed(6)),

        total_distance: 10,
      };
      const result = await endActiveTrip(activeTrip.id, endData)
      if (result) {
        Alert.alert("Đã kết thúc", "Chuyến đi của bạn đã được lưu.");
        // DỌN DẸP STATE
        setActiveTrip(null); // <-- Tự động tắt GPS (do activeTrip đã nằm trong useEffect())
        setPath([]); // Xóa đường vẽ
      }

    } catch (error) {
      console.error("Lỗi khi kết thúc chuyến đi - handleEndTrip: ", error);

    }
  }


  // Handle xử lý Long Press (nhấn giữ) của các phương thức di chuyển (Travel method)
  const handleCreateTripByTravelMethod = async (item, type) => {
    console.log("Bắt đầu tạo chuyến đi cho (Công cộng):", item.name);
    // Gọi API: Tạo 1 bản ghi Trip bằng vehicle:
    try {
      // const result = await createTripByVehicle();
    } catch (error) { }

    // Tùy chọn: Tự động đóng BottomSheet lại
    // bottomSheetRef.current?.snapToIndex(0);
  };

  // --- Gọi API lần đầu khi load màn hình ---
  useEffect(() => {
    if (!isAuthLoading && isSignedIn) {
      fetchTrips();
      fetchVehicles();
      fetchTravelMethod();
      fetchActiveTrip();
    }
  }, [isSignedIn, isAuthLoading,]
  );
  // --- useEffect MỚI: Tự động Bật/Tắt GPS ---
  useEffect(() => {
    if (activeTrip) {
      // Có chuyến đi -> Bật GPS và bắt đầu ghi đường đi
      console.log("Bắt đầu theo dõi GPS cho chuyến đi...");
      setPath([]); // Xóa đường đi cũ
      startWatchingLocation();
    } else {
      // Không có chuyến đi -> Tắt GPS
      console.log("Dừng theo dõi GPS.");
      stopWatchingLocation();
    }

    // Hàm dọn dẹp: Tắt GPS khi component bị unmount
    return () => {
      stopWatchingLocation();
    };
  }, [activeTrip, startWatchingLocation, stopWatchingLocation]); // Chạy lại khi activeTrip thay đổi

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
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          region={region}
        // Custom style cho bản đồ để phù hợp với theme
        // customMapStyle={mapStyle} // Sẽ thêm sau
        >
          {currentLocation && (
            <Marker coordinate={currentLocation} title="Vị trí của bạn" />
          )}
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
          <Polyline
            coordinates={path} // Lấy dữ liệu từ state
            strokeColor={COLORS.primary} // Màu của đường
            strokeWidth={6} // Độ dày
          />
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
          <BottomSheetScrollView style={styles.scrollContainer}>
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
        {activeTrip && (
          <View style={styles.stopTripContainer}>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleEndTrip} // <-- Tạo hàm này ở Bước 4
            >
              <Text style={styles.stopButtonText}>KẾT THÚC CHUYẾN ĐI</Text>
            </TouchableOpacity>
          </View>
        )}
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
    textAlign: "center",
  },
  // Style cho nội dung bên trong BottomSheet
  scrollContainer: {
    flex: 1,
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
  // Style cho danh sách xe (khi bị vô hiệu hoá, không phải active)
  itemDisabled: {
    opacity: 0.4,
  },
  itemActive: {
    backgroundColor: COLORS.primary, // Nền màu chính
    borderColor: COLORS.border, // Viền màu chính
    borderWidth: 1,
  },
  // Style cho huy hiệu (active)
  activeBadge: {
    position: "absolute",
    top: "50%",
    right: 10,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  // ...
  stopTripContainer: {
    position: 'absolute',
    bottom: 30, // Đặt vị trí bạn muốn
    left: 20,
    right: 20,
  },
  stopButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // ...
});
export default HomeScreen;
