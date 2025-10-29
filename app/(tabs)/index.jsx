// Thư viện react cơ bản
import {
  Alert,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import React, { useEffect, useState, useRef, useMemo } from "react";
// Thư viện react nâng cao
import {
  FlatList,
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
// Bản đồ
import MapView, { Marker, Polyline } from "react-native-maps";
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
import {
  createTripByVehicle,
  getActiveTrip,
  endActiveTrip,
} from "../../services/TripService";

import { addTripCoordinate } from "../../services/TripCoordinatesService";

// Quản lý trạng thái đăng nhập
import { useAuth } from "../../context/AuthContext";

// Giao diện/Chức năng của màn hình Home
const HomeScreen = () => {
  // HẰNG SỐ
  const LATITUDE_DELTA = 0.01;
  const LONGITUDE_DELTA = 0.005;
  // Toạ độ mặc định khi vừa render MapView
  let INITIAL_REGION = {
    latitude: 10.851548396166965,
    longitude: 106.75812846725613,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };
  const DELAY_LONG_PRESS = 500;

  // useRef
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const locationSubscriptionRef = useRef(null);

  // useState
  // Vị trí lấy 1 lần duy nhất, khi người dùng vào app
  const [currentLocation, setCurrentLocation] = useState({
    latitude: INITIAL_REGION.latitude,
    longitude: INITIAL_REGION.longitude,
  });
  // Danh sách chuyến đi người dùng đã di chuyển
  const [trips, setTrips] = useState([]);
  // Danh sách phương tiện cá nhân
  const [vehicles, setVehicles] = useState([]);
  // Danh sách (only 1) chuyến đi chưa kết thúc
  const [activeTrip, setActiveTrip] = useState(null);
  // State để vẽ đường đi
  const [path, setPath] = useState([]);
  // Danh sách phương thức di chuyển
  const [travelMethod, setTravelMethod] = useState([]);

  // Lấy trạng thái xác thực: Tránh gọi API khi chưa đăng nhập
  const { isSignedIn, isLoading: isAuthLoading } = useAuth();

  // Trạng thái lấy API vehicle
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  // Trạng thái lấy API travel method
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  // Trạng thái lấy API chuyến đi đang thực hiện
  const [isLoadingActiveTrip, setIsLoadingActiveTrip] = useState(false);
  // Trạng thái đang lấy GPS
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  // Trạng thái lấy GPS background nền -> Để ẩn banner đi
  const [isGPSBackground, setIsGPSBackground] = useState(false);
  // Kiểm tra xem có activeTrip hay không && activeTrip có phải được bắt đầu bằng vehicle không
  const isVehicleTrip = activeTrip && activeTrip.vehicle;

  // useMemo
  const snapPoints = useMemo(() => ["10%", "50%", "75%"], []);

  // Function

  // 5. Hàm gọi API lấy chuyến đi chưa kết thúc.
  const fetchActiveTrip = async () => {
    setIsLoadingActiveTrip(true);
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
      setIsLoadingActiveTrip(false);
    }
  };

  // useEffect: Chỉ chạy 1 lần duy nhất
  useEffect(() => {
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
      setIsLoadingVehicles(true);
      try {
        const data = await getMyVehicles();
        if (data) {
          setVehicles(data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách xe:", error);
      } finally {
        setIsLoadingVehicles(false);
      }
    };
    // 4. Hàm gọi API danh sách các phương tiện di chuyển (Xe buýt, Taxi, máy bay, ...).
    const fetchTravelMethod = async () => {
      setIsLoadingMethods(true);
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
        setIsLoadingMethods(false);
      }
    };

    if (!isAuthLoading && isSignedIn) {
      fetchTrips();
      fetchVehicles();
      fetchTravelMethod();
      fetchActiveTrip();
    }
  }, []); // Chỉ chạy 1 lần

  // Handle
  // 1. Lấy vị trí khi người dùng nhấn vào nút Tìm tôi, chỉ yêu cầu 1 lần và không chạy nền
  const handleFindMyLocation = async () => {
    try {
      if (!mapRef.current) {
        return;
      }

      // hiển thị hộp thoại xin quyền
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        // Alert.alert("Lỗi", "Quyền truy cập vị trí đã bị từ chối.");
        setIsLoadingGPS(false);
        return;
      }
      setIsLoadingGPS(true);
      // Lấy vị trí hiện tại 1 lần duy nhất
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Lowest, // Chỉ cần tương đối để hiển thị lên giao diện
        timeout: 1000, // Thêm timeout 5 giây
      });

      // Tạo tọa độ (2-key) và vùng (4-key)
      const userCoord = location.coords;
      setCurrentLocation(userCoord); // <-- SỬA: Set toạ độ (2-key)

      const userRegion = {
        latitude: userCoord.latitude,
        longitude: userCoord.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      mapRef.current?.animateToRegion(userRegion, 1000); // Vẫn animate bằng Vùng (4-key)
    } catch (error) {
      console.error("Lỗi khi xin/lấy vị trí:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi lấy vị trí.");
    } finally {
      setIsLoadingGPS(false);
    }
  };
  // Handle xử lý Long Press (nhấn giữ) của các phương tiện cá nhân (vehicle)
  const handleCreateTripByVehicle = async (vehicleData) => {
    bottomSheetRef.current?.snapToIndex(0);
    try {
      // Lấy vị trí khi người dùng bắt đầu chuyến đi, chỉ yêu cầu 1 lần và không chạy nền
      let { status } = await Location.requestForegroundPermissionsAsync();
      // Thông báo ra cho người dùng -> Không thể tạo chuyến đi
      if (status !== "granted") {
        Alert.alert(
          "Không thể tạo chuyến đi",
          "Quyền truy cập vị trí đã bị từ chối.",
        );
        setIsGPSBackground(false);
        return;
      }
      setIsLoadingGPS(true);
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 5000,
      });

      // Tạo dữ liệu chuyến đi
      const data = {
        vehicle_id: vehicleData.id,
        start_latitude: parseFloat(location.coords.latitude.toFixed(6)),
        start_longitude: parseFloat(location.coords.longitude.toFixed(6)),
      };

      // --- 4. Gọi API tạo chuyến đi ---
      const result = await createTripByVehicle(data);

      if (result) {
        fetchActiveTrip();

        const userCoord = location.coords;
        setCurrentLocation(userCoord); // <-- SỬA: Set toạ độ (2-key)

        const userRegion = {
          latitude: userCoord.latitude,
          longitude: userCoord.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        mapRef.current?.animateToRegion(userRegion, 1000); // Animate bằng Vùng (4-key)

        Alert.alert("Thành công", "Đã tạo chuyến đi!");
      } else {
        Alert.alert("Lỗi", "Không thể tạo chuyến đi. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo chuyến đi:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi không mong muốn.");
    } finally {
      setIsLoadingGPS(false);
    }
  };

  // Hàm lấy vị trí của người dùng liên tục + chạy nền
  const handleRequestBackgroundPermission = async () => {
    let { status } = await Location.requestBackgroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Lỗi", "Quyền truy cập vị trí đã bị từ chối.");
      setIsGPSBackground(false);
      return;
    }
    // Đã nhận được GPS background -> Ẩn banner đi
    setIsGPSBackground(true);
    locationSubscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        // timeInterval: 1000, // 1 giây
        distanceInterval: 50, // 10 mét
      },
      // Ghi lại hành trình chuyến đi
      async (newLocation) => {
        // 1. Cập nhật lại vị trí hiện tại của bản thân
        setCurrentLocation(newLocation.coords);

        const newCoord = {
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
        };

        setPath((prevPath) => [...prevPath, newCoord]);

        const newRegion = {
          latitude: newCoord.latitude,
          longitude: newCoord.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };

        mapRef.current?.animateToRegion(newRegion, 1000);

        // 2. Gửi dữ liệu về Backend (Tác vụ nền)
        // MỚI: Phải kiểm tra xem activeTrip có ID không
        if (activeTrip && activeTrip.id) {
          try {
            // Chuẩn bị dữ liệu gửi đi
            const coordinateData = {
              latitude: parseFloat(newCoord.latitude.toFixed(6)),
              longitude: parseFloat(newCoord.longitude.toFixed(6)),
              trip: activeTrip.id,
            };

            // Gọi API
            // Quan trọng: Chúng ta "không await" ở đây.
            // Đây là kiểu "Fire and Forget" (Bắn và Quên)
            addTripCoordinate(coordinateData);
          } catch (error) {
            // TUYỆT ĐỐI KHÔNG Alert.alert ở đây
            // Vì nó sẽ hiện thông báo lỗi mỗi giây nếu mất mạng
            console.error("Lỗi khi gửi tọa độ về server:", error);
          }
        }
      },
    );

    // Để dừng theo dõi:
    // locationSubscription.remove();
  };

  // Handle kết thúc chuyến đi
  const handleEndTrip = async () => {
    // Nếu không có chuyến đi nào hiện tại || không lấy được vị trí hiện tại
    if (!activeTrip || !currentLocation) {
      return;
    }
    // Ngừng theo dõi GPS ngay lập tức để không có tọa độ nào bị lọt.
    locationSubscriptionRef.current?.remove();
    locationSubscriptionRef.current = null;
    try {
      // Tạo biến json để gửi tới API
      const endData = {
        // 1. Dùng toFixed(6) cho vĩ độ (latitude)
        end_latitude: parseFloat(currentLocation.latitude.toFixed(6)),

        // 2. Dùng toFixed(7) cho kinh độ (longitude)
        end_longitude: parseFloat(currentLocation.longitude.toFixed(6)),

        end_time: new Date().toISOString(),
        total_distance: 10,
      };
      const result = await endActiveTrip(activeTrip.id, endData);

      if (result) {
        // DỌN DẸP STATE
        setActiveTrip(null);
        setPath([]); // Xóa đường vẽ
        setIsGPSBackground(false);
        const userRegion = {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        mapRef.current?.animateToRegion(userRegion, 1000);
        Alert.alert("Đã kết thúc", "Chuyến đi của bạn đã được lưu.");
      }
    } catch (error) {
      console.error("Lỗi khi kết thúc chuyến đi - handleEndTrip: ", error);
    }
  };

  // Render item
  // --- Hàm Render cho FlatList Xe ---
  const renderVehicleItem = ({ item }) => {
    // 1. Kiểm tra xem vehicle này có đang phải là xe đang Trip không
    const isActive = activeTrip && activeTrip.vehicle?.id === item.id;
    // 2. activeTrip đang có giá trị thì gán bằng True
    const isDisabled = activeTrip != null;

    return (
      <TouchableOpacity
        style={[
          styles.vehicleItem,

          // Nếu item này bị vô hiệu hóa, VÀ nó không phải là item đang active, thì áp dụng style làm mờ nó đi
          isDisabled && !isActive && styles.itemDisabled,
          // Nếu item này chính là item đang active, thì áp dụng style làm nổi bật nó lên
          isActive && styles.itemActive,
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
              {isVehicleTrip ? (
                <Image
                  source={{ uri: activeTrip.vehicle.vehicle_avatar.image }}
                  style={{ width: 45, height: 45, borderRadius: 15 }}
                />
              ) : (
                <Ionicons name="pin" size={24} color={COLORS.primary} />
              )}
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
          <Polyline
            coordinates={path} // Lấy dữ liệu từ state
            strokeColor={COLORS.primary} // Màu của đường
            strokeWidth={6} // Độ dày
          />
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

          <View style={styles.controlsContainer}>
            {/* 3. Banner thông báo chạy nền (Bên trái) */}
            {/* Nếu đang có chuyến đi & Chưa cấp quyền GPS background */}
            {activeTrip && !isGPSBackground && (
              <TouchableOpacity
                style={styles.bgPermissionBanner}
                onPress={handleRequestBackgroundPermission} // <-- Tạo hàm này
              >
                <Ionicons name="warning-outline" size={20} color="#FFA000" />
                <Text style={styles.bgPermissionText}>
                  Chuyến đi sẽ dừng nếu tắt màn hình. Nhấn để cho phép chạy nền.
                </Text>
              </TouchableOpacity>
            )}

            {/* 4. Nút "Tìm tôi" (Bên phải) */}
            {/* Luôn hiển thị, nhưng đẩy sang phải */}
            <TouchableOpacity
              style={styles.recenterButton}
              onPress={handleFindMyLocation}
            >
              <Ionicons
                name="locate-outline"
                size={28}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        {/* Biểu tượng loading giữa màn hình */}
        {isLoadingGPS && (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ position: "absolute", top: "50%", left: "50%" }}
          />
        )}

        {/* Nút kết thúc chuyến đi */}
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
            {isLoadingVehicles ? (
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
            {isLoadingMethods ? (
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
  // --- Cảnh báo về GPS chạy nền ---
  controlsContainer: {
    flexDirection: "row", // Sắp xếp theo hàng ngang
    alignItems: "center", // Căn giữa theo chiều dọc
    marginTop: 10,
  },
  bgPermissionBanner: {
    flex: 1, // Chiếm phần lớn không gian bên trái
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 160, 0, 0.1)", // Màu vàng nhạt
    borderColor: "#FFA000",
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    marginRight: 10, // Khoảng cách với nút 📍
  },
  bgPermissionText: {
    flex: 1, // Cho phép text tự xuống dòng
    color: "#D97706", // Màu vàng đậm
    fontSize: 12,
    marginLeft: 5,
  },
  // Nút tìm tôi
  recenterButton: {
    // dồn hết về phải && cách trên 10
    backgroundColor: COLORS.card,
    padding: 10,
    borderRadius: 50, // Bo tròn
    // Thêm bóng đổ (shadow) cho đẹp
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    //
    marginLeft: "auto",
  },
  // Nút kết thúc chuyến đi
  stopTripContainer: {
    position: "absolute",
    bottom: 100, // Đặt vị trí bạn muốn
    left: 20,
    right: 20,
  },
  stopButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  stopButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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
  // Style cho container của 1 phương tiện/phương thức
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
  // Container cho Name/Plate
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  // Biển số xe/metadata
  vehiclePlate: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  // Nếu không có xe nào thì
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
});
