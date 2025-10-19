import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet, // <--- Đã thêm
} from "react-native";
import React from "react";
import { COLORS } from "../constant/color";

const CustomButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
  isDisabled,
}) => {
  // Nút sẽ bị vô hiệu hóa nếu đang loading HOẶC form không hợp lệ
  const disabled = isLoading || isDisabled;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.container, // Style cơ bản
        disabled ? styles.containerDisabled : styles.containerEnabled, // Style động
        containerStyles, // Style tùy chỉnh từ props
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={[styles.text, textStyles]}>{title}</Text> // <--- Đã thay đổi
      )}
    </TouchableOpacity>
  );
};

// --- Bảng StyleSheet ---
const styles = StyleSheet.create({
  container: {
    width: "75%", // (từ w-3/4)
    borderRadius: 4, // (từ rounded) - bạn có thể chỉnh lại (rounded-md, rounded-lg...)
    padding: 12, // (từ p-3)
    alignItems: "center", // Thêm vào để ActivityIndicator căn giữa
    justifyContent: "center", // Thêm vào để ActivityIndicator căn giữa
  },
  containerEnabled: {
    backgroundColor: COLORS.primary, // (từ bg-primary) - FIXME: Đảm bảo 'primary' tồn tại trong COLORS
  },
  containerDisabled: {
    backgroundColor: "#A0AEC0", // (từ bg-gray-400)
  },
  text: {
    textAlign: "center", // (từ text-center)
    fontWeight: "bold", // (từ font-bold)
    color: COLORS.white, // (từ text-white) - FIXME: Đảm bảo 'white' tồn tại trong COLORS
  },
});

export default CustomButton;