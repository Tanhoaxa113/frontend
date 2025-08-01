// frontend/src/pages/PartnersPage.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/auth'; // Dùng axiosInstance đã cấu hình

function PartnersPage() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newPartnerName, setNewPartnerName] = useState('');
    const [newPartnerContact, setNewPartnerContact] = useState('');

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('partners/');
            setPartners(response.data);
            setError('');
        } catch (err) {
            setError("Không thể tải danh sách đối tác. Vui lòng thử lại.");
            console.error("Lỗi tải đối tác:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPartner = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axiosInstance.post('partners/', {
                name: newPartnerName,
                contact_info: newPartnerContact
            });
            setNewPartnerName('');
            setNewPartnerContact('');
            fetchPartners(); // Tải lại danh sách sau khi thêm thành công
        } catch (err) {
            setError("Không thể thêm đối tác. Vui lòng kiểm tra lại thông tin.");
            console.error("Lỗi thêm đối tác:", err.response?.data || err.message);
        }
    };

    const handleDeletePartner = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa đối tác này?")) return; // Sử dụng confirm tạm thời, nên thay bằng modal tùy chỉnh
        try {
            await axiosInstance.delete(`partners/${id}/`);
            fetchPartners(); // Tải lại danh sách sau khi xóa
        } catch (err) {
            setError("Không thể xóa đối tác. Vui lòng thử lại.");
            console.error("Lỗi xóa đối tác:", err.response?.data || err.message);
        }
    };

    if (loading) return <div className="text-center py-8">Đang tải đối tác...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Đối tác</h2>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Thêm đối tác mới</h3>
                <form onSubmit={handleAddPartner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="newPartnerName" className="block text-gray-700 text-sm font-bold mb-2">Tên đối tác:</label>
                        <input
                            type="text"
                            id="newPartnerName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newPartnerName}
                            onChange={(e) => setNewPartnerName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="newPartnerContact" className="block text-gray-700 text-sm font-bold mb-2">Thông tin liên hệ:</label>
                        <textarea
                            id="newPartnerContact"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newPartnerContact}
                            onChange={(e) => setNewPartnerContact(e.target.value)}
                            rows="3"
                        ></textarea>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Thêm đối tác
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Danh sách đối tác</h3>
                {partners.length === 0 ? (
                    <p className="text-gray-600">Chưa có đối tác nào.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đối tác</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin liên hệ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {partners.map((partner) => (
                                    <tr key={partner.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{partner.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{partner.contact_info}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => alert('Chức năng chỉnh sửa chưa triển khai.')}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Chỉnh sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeletePartner(partner.id)}
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

export default PartnersPage;
