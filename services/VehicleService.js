
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VEHICLES_URL } from "../constant/api"; // Chỉnh sửa đường dẫn nếu cần

/**
 * Hàm gọi API để lấy danh sách các phương tiện của người dùng đã đăng nhập.
 * @returns {Promise<Array|null>} Một mảng các đối tượng vehicle nếu thành công, ngược lại trả về null.
 */
export const getMyVehicles = async () => {
  try {
    // 1. Lấy token xác thực từ AsyncStorage
    const token = await AsyncStorage.getItem("accessToken");

    // Nếu không có token, không thể thực hiện yêu cầu
    if (!token) {
      console.log("Không tìm thấy token, người dùng chưa đăng nhập.");
      return null;
    }

    // 2. Thực hiện gọi API với phương thức GET
    const response = await fetch(VEHICLES_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 3. Gửi token trong header Authorization
        // Backend DRF sẽ dùng token này để xác định người dùng là ai
        Authorization: "Bearer " + token,
      },
    });

    // 4. Kiểm tra nếu yêu cầu không thành công (ví dụ: token hết hạn, lỗi server)
    if (!response.ok) {
      // Ném lỗi để khối catch có thể bắt được
      throw new Error("Lỗi khi lấy danh sách xe. Status: " + response.status);
    }

    // 5. Chuyển đổi dữ liệu trả về từ JSON sang đối tượng JavaScript
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Đã xảy ra lỗi trong hàm getMyVehicles:", error);
    return null; // Trả về null nếu có lỗi
  }
};