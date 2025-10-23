import { Platform } from 'react-native';

const androidApiUrl = "http://10.0.2.2:8000/";
const iosApiUrl = "http://localhost:8000/";

// ----------------------------------
export const API_BASE_URL = Platform.OS === 'android' ? androidApiUrl : iosApiUrl;
// Đăng ký
export const REGISTER_URL = `${API_BASE_URL}auth/register/`;
// Đăng nhập
export const LOGIN_URL = `${API_BASE_URL}auth/token/`;
// ----------------------------------
// Lấy danh sách xe của người dùng
export const VEHICLES_URL = `${API_BASE_URL}api/vehicles/`; 
// Lấy danh sách ảnh đại diện của xe
export const VEHICLE_AVATARS_URL = `${API_BASE_URL}api/vehicle-avatars/`;
// ----------------------------------
// Lấy danh sách phương thức di chuyển
export const TRAVEL_METHOD_URL = `${API_BASE_URL}api/travel-methods/`;