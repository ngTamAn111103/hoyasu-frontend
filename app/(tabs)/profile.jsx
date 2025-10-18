import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useAuth } from "../../context/AuthContext"; 

const ProfileScreen = () => {
  const { signOut } = useAuth(); // Lấy hàm signOut từ context
  const handleLogout = async () => {
    await signOut();
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Hồ Sơ</Text>
      <TouchableOpacity
              onPress={handleLogout}
              style={{ backgroundColor: 'red', padding: 15, borderRadius: 10 }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Đăng Xuất</Text>
            </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;