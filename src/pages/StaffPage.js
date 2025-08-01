// frontend/src/pages/StaffPage.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/auth';

function StaffPage() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newRole, setNewRole] = useState('');
    const [newPhoneNumber, setNewPhoneNumber] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('staff/');
            setStaff(response.data);
            setError('');
        } catch (err) {
            setError("Không thể tải danh sách nhân sự. Vui lòng thử lại.");
            console.error("Fetch staff error:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Trước tiên, tạo tài khoản người dùng mới
            const userResponse = await axiosInstance.post('auth/register/', {
                username: newUsername,
                email: newEmail,
                password: newPassword,
                password2: newPassword, // Xác nhận mật khẩu
                first_name: newFirstName,
                last_name: newLastName,
            });

            // Sau khi tạo người dùng thành công, tạo hồ sơ nhân sự
            await axiosInstance.post('staff/', {
                user_id: userResponse.data.user.id,
                role: newRole,
                phone_number: newPhoneNumber,
            });

            // Reset form
            setNewUsername('');
            setNewEmail('');
            setNewPassword('');
            setNewFirstName('');
            setNewLastName('');
            setNewRole('');
            setNewPhoneNumber('');

            fetchStaff(); // Tải lại danh sách sau khi thêm thành công
        } catch (err) {
            setError("Không thể thêm nhân sự. Vui lòng kiểm tra lại thông tin.");
            console.error("Add staff error:", err.response?.data || err.message);
        }
    };

    const handleDeleteStaff = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa nhân sự này?")) return;
        try {
            await axiosInstance.delete(`staff/${id}/`);
            fetchStaff();
        } catch (err) {
            setError("Không thể xóa nhân sự. Vui lòng thử lại.");
            console.error("Delete staff error:", err.response?.data || err.message);
        }
    };

    if (loading) return <div className="text-center py-8">Đang tải nhân sự...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Nhân sự</h2>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Thêm Nhân sự Mới</h3>
                <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Tên đăng nhập:</label>
                        <input
                            type="text"
                            id="username"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu:</label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">Tên:</label>
                        <input
                            type="text"
                            id="firstName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newFirstName}
                            onChange={(e) => setNewFirstName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">Họ:</label>
                        <input
                            type="text"
                            id="lastName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newLastName}
                            onChange={(e) => setNewLastName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Vai trò:</label>
                        <input
                            type="text"
                            id="role"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Số điện thoại:</label>
                        <input
                            type="text"
                            id="phoneNumber"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newPhoneNumber}
                            onChange={(e) => setNewPhoneNumber(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Thêm Nhân sự
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Danh sách Nhân sự</h3>
                {staff.length === 0 ? (
                    <p className="text-gray-600">Chưa có nhân sự nào.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {staff.map((person) => (
                                    <tr key={person.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{person.user.last_name} {person.user.first_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{person.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{person.user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{person.phone_number || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteStaff(person.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StaffPage;
