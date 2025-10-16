import AsyncStorage from "@react-native-async-storage/async-storage";
import { VEHICLES_URL } from "../constant/api"; // Chỉnh sửa đường dẫn nếu cần
import { VEHICLE_AVATARS_URL } from "../constant/api"; // Chỉnh sửa đường dẫn nếu cần

/**
 * Hàm gọi API để lấy danh sách các ảnh đại diện của xe khi người dùng tạo xe mới.
 * @returns {Promise<Array|null>} Một mảng các đối tượng Vehicle Avatar nếu thành công, ngược lại trả về null.
 */
export const getVehicleAvatars = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    // Thực hiện gọi API với phương thức GET
    const response = await fetch(VEHICLE_AVATARS_URL, {
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
        "Lỗi khi lấy danh sách ảnh đại diện cho xe. Status: " + response.status,
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Đã xảy ra lỗi trong hàm getVehicleAvatars:", error);
    return null; // Trả về null nếu có lỗi
  }
};
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

/**
 * Lấy thông tin chi tiết của một chiếc xe cụ thể.
 * @param {number} id - ID của xe cần lấy.
 * @returns {Promise<object|null>} Dữ liệu chi tiết của xe nếu thành công.
 */
export const getVehicleDetails = async (id) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return null;

    // URL sẽ có dạng: http://.../api/vehicles/5/
    const response = await fetch(`${VEHICLES_URL}${id}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    if (!response.ok) {
      throw new Error("Lỗi khi lấy chi tiết xe.");
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi trong hàm getVehicleDetails:", error);
    return null;
  }
};

/**
 * Hàm gọi API để tạo một phương tiện mới.
 * @param {object} vehicleData - Dữ liệu của xe cần tạo.
 * @returns {Promise<object|null>} Dữ liệu xe đã tạo nếu thành công, ngược lại trả về null.
 */
export const createVehicle = async (vehicleData) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      console.log("Không tìm thấy token.");
      return null;
    }

    const response = await fetch(VEHICLES_URL, {
      method: "POST", // Sử dụng phương thức POST
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(vehicleData), // Gửi dữ liệu trong body
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi API khi tạo xe:", errorData);
      throw new Error("Lỗi từ server: " + response.status);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Đã xảy ra lỗi trong hàm createVehicle:", error);
    return null;
  }
};
