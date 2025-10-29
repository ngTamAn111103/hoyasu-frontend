import AsyncStorage from "@react-native-async-storage/async-storage";
import { TRIP_COORDINATES_URL } from "../constant/api";

/**
 * Hàm gọi API để tạo bản ghi hành trình một chuyến đi (trip-coordinates) mới.
 * @param {object} location - Dữ liệu toạ độ của chuyến đi.
 * @returns {Promise<object|null>} Dữ liệu toạ độ của chuyến đi đã tạo nếu thành công, ngược lại trả về null.
 */
export const addTripCoordinate = async (location) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      console.log("Không tìm thấy token - addTripCoordinate");
      return null;
    }

    const response = await fetch(TRIP_COORDINATES_URL, {
      method: "POST", // Sử dụng phương thức POST
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(location), // Gửi dữ liệu trong body
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi API khi ghi hành trình chuyến đi", errorData);
      throw new Error("Lỗi từ server: " + response.status);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Đã xảy ra lỗi trong hàm addTripCoordinate:", error);
    return null;
  }
};