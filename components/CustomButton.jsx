import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import React from "react";
import { COLORS } from "../constant/color"; 

const CustomButton = ({
  title, // Tiêu đề của nút, ví dụ: "Sign Up"
  handlePress, // Hàm sẽ được gọi khi nhấn nút
  containerStyles, // Style cho thẻ TouchableOpacity (ví dụ: margin)
  textStyles, // Style cho chữ bên trong nút
  isLoading, // Trạng thái loading để hiển thị vòng xoay
  isDisabled, // Trạng thái vô hiệu hóa (do form invalid)
}) => {
  // Nút sẽ bị vô hiệu hóa nếu đang loading HOẶC form không hợp lệ
  const disabled = isLoading || isDisabled;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      className={`
        w-3/4 rounded p-3 
        ${disabled ? "bg-gray-400" : "bg-primary"} 
        ${containerStyles}
      `}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.white}  />
      ) : (
        <Text className={`text-center font-bold text-white ${textStyles}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;