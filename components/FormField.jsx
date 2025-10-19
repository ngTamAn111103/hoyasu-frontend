import { View, Text, TextInput, StyleSheet } from "react-native";
import React from "react";
import { COLORS } from "../constant/color";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles, // Prop này bây giờ nên là một đối tượng style
  ...props
}) => {
  return (
    // View này chứa cả tiêu đề và ô input
    <View style={[styles.container, otherStyles]}> 
      {title && <Text style={styles.title}>{title}</Text>} 
      <TextInput
        style={styles.input} 
        value={value}
        placeholder={placeholder}
        onChangeText={handleChangeText}
        placeholderTextColor={COLORS.textLight}
        {...props}
      />
    </View>
  );
};

// --- Bảng StyleSheet ---
const styles = StyleSheet.create({
  container: {
    width: "75%", // (từ w-3/4)
  },
  title: {
    marginBottom: 8, // (từ mb-2)
    fontWeight: "bold", // (từ font-bold)
    color: "#374151", // (mã màu của text-gray-700)
  },
  input: {
    borderRadius: 4, // (từ rounded) - bạn có thể chỉnh lại
    borderWidth: 1, // (từ border)
    borderColor: "#D1D5DB", // (mã màu của border-gray-300)
    padding: 12, // (từ p-3)
  },
});

export default FormField;