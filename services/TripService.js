import AsyncStorage from "@react-native-async-storage/async-storage";
import { TRIP_URL } from "../constant/api";

/**
 * Hàm gọi API để tạo một chuyến đi (Trip) mới với phương tiện cá nhân (Vehicle).
 * @param {object} tripByVehicleData - Dữ liệu của chuyến đi cần tạo.
 * @returns {Promise<object|null>} Dữ liệu chuyến đi đã tạo nếu thành công, ngược lại trả về null.
 */
export const createTripByVehicle = async (tripByVehicleData) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      console.log("Không tìm thấy token.");
      return null;
    }

    const response = await fetch(TRIP_URL, {
      method: "POST", // Sử dụng phương thức POST
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(tripByVehicleData), // Gửi dữ liệu trong body
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi API khi tạo chuyến đi bằng vehicle:", errorData);
      throw new Error("Lỗi từ server: " + response.status);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Đã xảy ra lỗi trong hàm createTripByVehicle:", error);
    return null;
  }
};

/**
 * Kiểm tra và lấy chuyến đi đang hoạt động (nếu có)
 */
export const getActiveTrip = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      console.log("Không tìm thấy token.");
      return null;
    }

    // GỌI API MỚI CHUYÊN BIỆT
    const response = await fetch(`${TRIP_URL}active/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    // Nếu server trả về 204, nghĩa là không có chuyến đi đang hoạt động
    if (response.status === 204) {
      return null; // Không có chuyến đi
    }

    if (!response.ok) {
      throw new Error("Lỗi khi kiểm tra chuyến đi: " + response.status);
    }

    // Nếu là 200 OK, response.json() sẽ là ĐỐI TƯỢNG (object)
    const activeTripObject = await response.json();

    
    return activeTripObject; // Trả về đối tượng chuyến đi
    
  } catch (error) {
    console.error("Đã xảy ra lỗi trong hàm getActiveTrip:", error);
    return null;
  }
};