// frontend/src/pages/RegisterPage.js
import React, { useState } from 'react';
import axiosInstance from '../api/auth'; // Sử dụng axiosInstance đã cấu hình
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== password2) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            const response = await axiosInstance.post('auth/register/', {
                username,
                email,
                password,
                password2,
                first_name: firstName,
                last_name: lastName,
            });
            setSuccessMessage(response.data.message + ". Bây giờ bạn có thể đăng nhập.");
            // Tùy chọn: Chuyển hướng về trang đăng nhập sau 2 giây
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData) {
                if (errorData.username) setError("Tên đăng nhập: " + errorData.username[0]);
                else if (errorData.email) setError("Email: " + errorData.email[0]);
                else if (errorData.password) setError("Mật khẩu: " + errorData.password[0]);
                else if (errorData.password2) setError("Mật khẩu xác nhận: " + errorData.password2[0]);
                else setError("Đăng ký thất bại. Vui lòng thử lại.");
            } else {
                setError("Đăng ký thất bại. Vui lòng thử lại.");
            }
            console.error("Lỗi đăng ký:", err.response?.data || err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Đăng ký Tài khoản Mới</h2>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm mb-4 text-center">{successMessage}</p>}
                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Tên đăng nhập:</label>
                        <input
                            type="text"
                            id="username"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">Tên:</label>
                            <input
                                type="text"
                                id="firstName"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">Họ:</label>
                            <input
                                type="text"
                                id="lastName"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu:</label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password2" className="block text-gray-700 text-sm font-bold mb-2">Xác nhận mật khẩu:</label>
                        <input
                            type="password"
                            id="password2"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            Đăng ký
                        </button>
                    </div>
                    <p className="text-center text-gray-600 text-sm mt-4">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-blue-500 hover:text-blue-800">Đăng nhập ngay!</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;
