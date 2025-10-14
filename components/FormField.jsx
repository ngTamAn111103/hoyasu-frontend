import { View, Text, TextInput } from "react-native";
import React from "react";
import { COLORS } from "../constant/color"; 

const FormField = ({
  title, // Tiêu đề của trường input, ví dụ: "Email"
  value, // Giá trị hiện tại của input
  placeholder, // Chữ gợi ý khi input trống
  handleChangeText, // Hàm được gọi khi người dùng nhập chữ
  otherStyles, // Các class style bổ sung nếu cần
  ...props // Nhận các props khác như keyboardType, secureTextEntry
}) => {
  return (
    // View này chứa cả tiêu đề và ô input
    <View className={`w-3/4 ${otherStyles}`}>
      {title && <Text className="mb-2 font-bold text-gray-700">{title}</Text>}
      <TextInput
        className="rounded border border-gray-300 p-3"
        value={value}
        placeholder={placeholder}
        onChangeText={handleChangeText}
        placeholderTextColor={COLORS.textLight} // <-- 2. Áp dụng màu textLight

        {...props} // Áp dụng các props còn lại ở đây
      />
    </View>
  );
};

export default FormField;