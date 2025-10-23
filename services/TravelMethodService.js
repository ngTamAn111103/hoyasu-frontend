import AsyncStorage from "@react-native-async-storage/async-storage";
import { TRAVEL_METHOD_URL } from "../constant/api"; 

/**
 * Hàm gọi API để lấy danh sách các phương tiện di chuyển (Xe buýt, Taxi, máy bay, ...).
 * @returns {Promise<Array|null>} Một mảng các đối tượng Travel Method nếu thành công, ngược lại trả về null.
 */
export const getTravelMethod = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    // Thực hiện gọi API với phương thức GET
    const response = await fetch(TRAVEL_METHOD_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 3. Gửi token trong header Authorization
        // Backend DRF sẽ dùng token này để xác định người dùng là ai
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      // Ném lỗi để khối catch có thể bắt được
      throw new Error(
        "Lỗi khi lấy danh sách các phương tiện di chuyển. Status: " + response.status,
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Đã xảy ra lỗi trong hàm getTravelMethod:", error);
    return null; // Trả về null nếu có lỗi
  }
};
