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
  StyleSheet, 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getVehicleAvatars } from "../../services/VehicleService";

const VehicleForm = ({ onSubmit, onCancel }) => {
  // State để quản lý dữ liệu form
  const [name, setName] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [odometer, setOdometer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [vehicleAvatars, setVehicleAvatars] = useState([]);

  // Sử dụng useEffect để gọi API khi component được render lần đầu
  useEffect(() => {
    const fetchVehicleAvatars = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getVehicleAvatars();
        if (data) {
          setVehicleAvatars(data);
        }
      } catch (e) {
        setError("Không thể tải dữ liệu xe.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicleAvatars();
  }, []);

  const handleSave = () => {
    const vehicleData = {
      name: name,
      license_plate: licensePlate,
      odometer: odometer,
      vehicle_avatar_id: selectedAvatarId,
    };
    onSubmit(vehicleData);
  };

  // Hàm render cho mỗi avatar trong FlatList
  const renderAvatar = ({ item }) => {
    const isSelected = item.id === selectedAvatarId;
    return (
      <TouchableOpacity
        onPress={() => setSelectedAvatarId(item.id)}
        // Áp dụng style động
        style={[
          styles.avatarWrapper,
          isSelected ? styles.avatarSelected : styles.avatarDefault,
        ]}
      >
        <Image source={{ uri: item.image }} style={styles.avatarImage} />
      </TouchableOpacity>
    );
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex1} 
    >
      <SafeAreaView style={styles.safeArea}> 
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header của Modal */}
          <View style={styles.header}> 
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.headerButtonText}>Hủy</Text> 
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thêm xe mới</Text> 
            <View style={{ width: 40 }} />
          </View>
          {/* Nội dung Form */}
          <View style={styles.formContainer}> 
            {/* --- Phần chọn Avatar --- */}
            <Text style={styles.label}> 
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
            <View style={styles.inputGroup}> 
              <Text style={styles.label}>Tên xe (Gợi nhớ)</Text> 
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ví dụ: My Winner X, Xe đi làm"
                style={styles.textInput} 
              />
            </View>

            <View style={styles.inputGroupSpaced}> 
              <Text style={styles.label}>Biển số xe</Text> 
              <TextInput
                value={licensePlate}
                onChangeText={setLicensePlate}
                placeholder="Ví dụ: 59-X3 12345"
                autoCapitalize="characters"
                style={styles.textInput} 
              />
            </View>

            <View style={styles.inputGroupSpaced}> 
              <Text style={styles.label}>Số ODO (km)</Text> 
              <TextInput
                value={odometer}
                onChangeText={setOdometer}
                placeholder="Ví dụ: 53000"
                keyboardType="numeric"
                style={styles.textInput} 
              />
            </View>
          </View>

          {/* Đẩy nút Lưu xuống dưới cùng */}
          <View style={styles.flex1} /> 
          {/* Nút Lưu */}
          <View style={styles.saveButtonContainer}> 
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}> 
              <Text style={styles.saveButtonText}>Lưu lại</Text> 
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

// --- Bảng StyleSheet ---
const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6", // (từ bg-gray-100)
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB", // (từ border-gray-200)
    padding: 16,
  },
  headerButtonText: {
    fontSize: 18, // (từ text-lg)
    color: "#3B82F6", // (từ text-blue-500)
  },
  headerTitle: {
    fontSize: 20, // (từ text-xl)
    fontWeight: "bold", // (từ font-bold)
  },
  formContainer: {
    padding: 20, // (từ p-5)
  },
  label: {
    marginBottom: 12, // (từ mb-3)
    fontSize: 16, // (từ text-base)
    fontWeight: "600", // (từ font-semibold)
    color: "#374151", // (từ text-gray-700)
  },
  avatarWrapper: {
    height: 80, // (từ h-20)
    width: 80, // (từ w-20)
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40, // (từ rounded-full)
    borderWidth: 2,
    padding: 4, // (từ p-1)
  },
  avatarSelected: {
    borderColor: "#3B82F6", // (từ border-blue-500)
  },
  avatarDefault: {
    borderColor: "transparent", // (từ border-transparent)
  },
  avatarImage: {
    height: "100%",
    width: "100%",
    borderRadius: 40, // (từ rounded-full)
  },
  inputGroup: {
    marginTop: 24, // (từ mt-6)
  },
  inputGroupSpaced: {
    marginTop: 16, // (từ mt-4)
  },
  textInput: {
    borderRadius: 8, // (từ rounded-lg)
    borderWidth: 1,
    borderColor: "#D1D5DB", // (từ border-gray-300)
    backgroundColor: "#FFFFFF", // (từ bg-white)
    padding: 16, // (từ p-4)
    fontSize: 16, // (từ text-base)
  },
  saveButtonContainer: {
    padding: 20, // (từ p-5)
  },
  saveButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8, // (từ rounded-lg)
    backgroundColor: "#3B82F6", // (từ bg-blue-500)
    padding: 16, // (từ p-4)
    // (từ shadow)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 18, // (từ text-lg)
    fontWeight: "bold", // (từ font-bold)
    color: "#FFFFFF", // (từ text-white)
  },
});

export default VehicleForm;