import axios from 'axios';

// URL cơ sở của API Django backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

// Hàm để lấy CSRF token từ cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Tạo một instance Axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Quan trọng để gửi và nhận cookie (CSRF token, session ID)
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'), // Đặt CSRF token ban đầu
    },
});

// Thêm interceptor để tự động cập nhật CSRF token cho mỗi request
axiosInstance.interceptors.request.use(config => {
    config.headers['X-CSRFToken'] = getCookie('csrftoken');
    return config;
}, error => {
    return Promise.reject(error);
});

export const loginUser = async (username, password) => {
    try {
        const response = await axiosInstance.post('auth/login/', { username, password });
        return response.data;
    } catch (error) {
        console.error("Lỗi đăng nhập:", error.response?.data || error.message);
        throw error; // Ném lỗi để component gọi có thể xử lý
    }
};

export const logoutUser = async () => {
    try {
        const response = await axiosInstance.post('auth/logout/');
        return response.data;
    } catch (error) {
        console.error("Lỗi đăng xuất:", error.response?.data || error.message);
        throw error;
    }
};

export const checkAuth = async () => {
    try {
        const response = await axiosInstance.get('auth/whoami/');
        return response.status === 200; // Trả về true nếu request thành công (người dùng đã đăng nhập)
    } catch (error) {
        return false; // Trả về false nếu có lỗi (người dùng chưa đăng nhập hoặc phiên hết hạn)
    }
};

// Export axiosInstance để các API khác sử dụng chung cấu hình và CSRF token
export default axiosInstance;