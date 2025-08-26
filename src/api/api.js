/* eslint-disable no-unused-vars */
import axios from "axios";

// ==================================================
// Axios Instance
// ==================================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true, // send cookies (XSRF-TOKEN, laravel_session)
});

// ==================================================
// Request Interceptor to Add Auth Token
// ==================================================
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage, cookie, or wherever you store it
    const token = localStorage.getItem('token') || getCookieValue('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================================================
// Helper function to get cookie value
// ==================================================
function getCookieValue(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// ==================================================
// Generic HTTP Methods
// ==================================================
export const get = (url, config = {}) => api.get(url, config);
export const post = (url, data = {}, config = {}) => api.post(url, data, config);
export const put = (url, data = {}, config = {}) => api.put(url, data, config);
export const del = (url, config = {}) => api.delete(url, config);

// ==================================================
// File Upload Method
// ==================================================
export const postFormData = (url, formData, config = {}) => {
  return api.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const putFormData = (url, formData, config = {}) => {
  return api.put(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ==================================================
// Get CSRF cookie before making authenticated requests
// ==================================================
export const getCsrfCookie = () => get("/sanctum/csrf-cookie");

// Hotel info
export const info = async () => { return get(`/api/hotel-info`); }


// ==================================================
// SECURITY AUTH
// ==================================================
export const login = (data) => post("/api/login", data);
export const logout = async () => { await getCsrfCookie(); return post("/api/logout"); };
export const register = (userData) => post("/api/register", userData);
export const resendVerification = async (data) => { return post("api/resend-email-verification",data); }
export const passwordResetRequest = async (data) => { return post("api/forgot-password-request",data); }
export const forgotPassword = async (data) => { return post("api/forgot-password",data); }

// ==================================================
// Admin APIs
// ==================================================

// Reports
export const reports = async (data) => { return get(`api/admin/reports?time_range=${data.time_range}`); }

// Room Management
export const rooms = async () => { return get("api/admin/rooms");}
export const createRoom = async (data) => {return post('api/admin/rooms',data); }
export const updateRoom = async (roomId,data) => {return put(`api/admin/rooms/${roomId}`,data); }
export const updateRoomImage = async (roomId, data) => {return put(`api/admin/rooms/${roomId}/update-image`,data); }
export const deleteRoom = async (roomId) => { return del(`api/admin/rooms/${roomId}`); }

// Booking Management
export const bookings = async () => { return get('api/admin/bookings'); }
export const updateBooking = async (bookingId, data) => { return put(`api/admin/bookings/${bookingId}`,data);}

// User Management
export const users = async () => { return get('api/admin/users'); }
export const updateUserRole = async (userId,data) => { return put(`api/admin/users/${userId}/update-role`,data); }
export const updateUserProfile = async (userId,data) => { return put(`api/admin/users/${userId}/profile`,data); }
export const updateUserImage = async (userId,data) => { return put(`api/admin/users/${userId}/profile-url`,data); }
export const showUserProfile = async (userId) => { return get(`api/admin/users/${userId}/profile`); }
export const updateUserPassword = async (userId, data) => { return put(`api/admin/users/${userId}/change-password`,data); }

// Settings
export const settings = async () => { return get('api/admin/settings') ;}
export const updateSettings = async (settingId, data) => { return put(`api/admin/settings/${settingId}`,data) ;}

// Payment Collections
export const paymentAnalytics = async(data) => { return get(`api/admin/payment-analytics?time_range=${data.time_range}`); }
export const createPayment = async(data) => { return post(`api/admin/payments`,data); }
export const updatePayment = async(data) => { return put(`api/admin/payments/${data.id}`,data); }
export const voidPayment = async(data) => { return put(`api/admin/payments/${data.id}/void-transaction`); }
export const payments = async(data = {}) => {
  const {
        page = 1,
        per_page = 15,
        time_range = '6months',
        search = '',
        payment_method = ''
    } = data;
    
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
        time_range,
        ...(search && { search }),
        ...(payment_method && { payment_method })
    });
    
    return get(`api/admin/payments?${params.toString()}`);
}


// ==================================================
// Guest APIs
// ==================================================
export const guestRooms = async () => { return get("api/guest/rooms");}
export const guestRoomReservation = async (data) => { return post(`api/guest/bookings`,data);}
export const guestBookings = async () => { return get(`api/guest/bookings`);}
export const guestCancelBooking = async (bookingId) => { return put(`api/guest/bookings/${bookingId}/cancel-booking`);}
export const guestUpdateUserProfile = async (userId,data) => { return put(`api/guest/users/${userId}/profile`,data); }
export const guestUpdateUserImage = async (userId,data) => { return put(`api/guest/users/${userId}/profile-url`,data); }
export const guestUpdateUserPassword = async (userId, data) => { return put(`api/guest/users/${userId}/change-password`,data); }

// Room availability checking features

// Check availability for specific date range and criteria
export const getAvailableRooms = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  return get(`api/guest/rooms/available?${queryString}`);
};
// Required params: { check_in, check_out, guests?, room_type? }

// Check individual room availability
export const checkRoomAvailability = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  return get(`api/guest/rooms/check-availability?${queryString}`);
};
// Required params: { room_id, check_in, check_out }

// Get room availability calendar for a specific room
export const getRoomAvailabilityCalendar = async (roomId, params) => {
  const queryString = new URLSearchParams(params).toString();
  return get(`api/guest/rooms/${roomId}/availability-calendar?${queryString}`);
};
// Required params: { month, year }

// Get availability summary for date range
export const getAvailabilitySummary = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  return get(`api/guest/rooms/availability-summary?${queryString}`);
};
// Required params: { check_in, check_out }

// Validate booking before creating (real-time availability check)
export const validateBooking = async (data) => {
  return post(`api/guest/bookings/validate`, data);
};
// Required params: { room_id, check_in, check_out, guests }

// Get similar available rooms (if selected room is not available)
export const getSimilarRooms = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  return get(`api/guest/rooms/similar?${queryString}`);
};
// Required params: { room_id, check_in, check_out, guests }

export default api;