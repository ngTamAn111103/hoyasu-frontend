import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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

const HomeScreen = () => {
  const [trips, setTrips] = useState([]); // State để lưu danh sách chuyến đi
  // variables
  const snapPoints = useMemo(() => ['25%', '50%', '75%'], []);
  // ref
  const bottomSheetRef = useRef < BottomSheet > null;

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);
  // useEffect để gọi API khi màn hình được tải
  useEffect(() => {
    const fetchTrips = async () => {
      // Đây là nơi bạn sẽ gọi API GET /api/trips/
      // const fetchedTrips = await yourApi.getTrips();
      // setTrips(fetchedTrips);

      // Dữ liệu giả lập để minh họa
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

    fetchTrips();
  }, []);

  // Tọa độ giả lập, sau này sẽ thay bằng vị trí thực của người dùng
  const initialRegion = {
    latitude: 10.7769, // Vĩ độ của TP.HCM
    longitude: 106.7009, // Kinh độ của TP.HCM
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

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
        <BottomSheet snapPoints={snapPoints}>
          <BottomSheetView style={styles.contentContainer}>
            <Text>Awesome 🎉</Text>
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
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
});

export default HomeScreen;
