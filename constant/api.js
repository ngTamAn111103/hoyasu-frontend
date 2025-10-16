export const API_BASE_URL = "http://10.0.2.2:8000/";

export const REGISTER_URL = `${API_BASE_URL}auth/register/`;
export const LOGIN_URL = `${API_BASE_URL}auth/token/`;

// Lấy danh sách xe của người dùng
export const VEHICLES_URL = `${API_BASE_URL}api/vehicles/`; 
// Lấy danh sách ảnh đại diện của xe
export const VEHICLE_AVATARS_URL = `${API_BASE_URL}api/vehicle-avatars/`;