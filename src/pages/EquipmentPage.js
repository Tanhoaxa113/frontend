// frontend/src/pages/EquipmentPage.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/auth'; // Import axiosInstance đã cấu hình

function EquipmentPage() {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newEquipmentName, setNewEquipmentName] = useState('');
    const [newEquipmentDescription, setNewEquipmentDescription] = useState('');
    const [newEquipmentQuantity, setNewEquipmentQuantity] = useState(1);
    const [newEquipmentStatus, setNewEquipmentStatus] = useState('available');

    const [editingEquipment, setEditingEquipment] = useState(null); // State để lưu thiết bị đang chỉnh sửa

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('equipment/');
            setEquipment(response.data);
            setError('');
        } catch (err) {
            setError("Không thể tải danh sách trang thiết bị. Vui lòng thử lại.");
            console.error("Lỗi tải thiết bị:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEquipment = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axiosInstance.post('equipment/', {
                name: newEquipmentName,
                description: newEquipmentDescription,
                quantity: newEquipmentQuantity,
                status: newEquipmentStatus,
            });
            // Reset form
            setNewEquipmentName('');
            setNewEquipmentDescription('');
            setNewEquipmentQuantity(1);
            setNewEquipmentStatus('available');
            fetchEquipment(); // Tải lại danh sách sau khi thêm thành công
        } catch (err) {
            setError("Không thể thêm trang thiết bị. Vui lòng kiểm tra lại thông tin.");
            console.error("Lỗi thêm thiết bị:", err.response?.data || err.message);
        }
    };

    const handleEditClick = (item) => {
        setEditingEquipment(item);
        setNewEquipmentName(item.name);
        setNewEquipmentDescription(item.description);
        setNewEquipmentQuantity(item.quantity);
        setNewEquipmentStatus(item.status);
    };

    const handleUpdateEquipment = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axiosInstance.put(`equipment/${editingEquipment.id}/`, {
                name: newEquipmentName,
                description: newEquipmentDescription,
                quantity: newEquipmentQuantity,
                status: newEquipmentStatus,
            });
            // Reset form và state chỉnh sửa
            setEditingEquipment(null);
            setNewEquipmentName('');
            setNewEquipmentDescription('');
            setNewEquipmentQuantity(1);
            setNewEquipmentStatus('available');
            fetchEquipment();
        } catch (err) {
            setError("Không thể cập nhật trang thiết bị. Vui lòng kiểm tra lại thông tin.");
            console.error("Lỗi cập nhật thiết bị:", err.response?.data || err.message);
        }
    };

    const handleCancelEdit = () => {
        setEditingEquipment(null);
        setNewEquipmentName('');
        setNewEquipmentDescription('');
        setNewEquipmentQuantity(1);
        setNewEquipmentStatus('available');
    };

    const handleDeleteEquipment = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa trang thiết bị này?")) return; // Nên thay bằng modal tùy chỉnh
        try {
            await axiosInstance.delete(`equipment/${id}/`);
            fetchEquipment(); // Tải lại danh sách sau khi xóa
        } catch (err) {
            setError("Không thể xóa trang thiết bị. Vui lòng thử lại.");
            console.error("Lỗi xóa thiết bị:", err.response?.data || err.message);
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'available': return 'Khả dụng';
            case 'in_use': return 'Đang sử dụng';
            case 'under_maintenance': return 'Đang bảo trì';
            case 'broken': return 'Hỏng';
            case 'retired': return 'Ngừng sử dụng';
            default: return status;
        }
    };

    if (loading) return <div className="text-center py-8">Đang tải trang thiết bị...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Trang thiết bị</h2>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    {editingEquipment ? 'Chỉnh sửa Trang thiết bị' : 'Thêm Trang thiết bị Mới'}
                </h3>
                <form onSubmit={editingEquipment ? handleUpdateEquipment : handleAddEquipment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="newEquipmentName" className="block text-gray-700 text-sm font-bold mb-2">Tên thiết bị:</label>
                        <input
                            type="text"
                            id="newEquipmentName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newEquipmentName}
                            onChange={(e) => setNewEquipmentName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="newEquipmentQuantity" className="block text-gray-700 text-sm font-bold mb-2">Số lượng:</label>
                        <input
                            type="number"
                            id="newEquipmentQuantity"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newEquipmentQuantity}
                            onChange={(e) => setNewEquipmentQuantity(parseInt(e.target.value) || 1)}
                            min="1"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="newEquipmentStatus" className="block text-gray-700 text-sm font-bold mb-2">Trạng thái:</label>
                        <select
                            id="newEquipmentStatus"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newEquipmentStatus}
                            onChange={(e) => setNewEquipmentStatus(e.target.value)}
                            required
                        >
                            <option value="available">Khả dụng</option>
                            <option value="in_use">Đang sử dụng</option>
                            <option value="under_maintenance">Đang bảo trì</option>
                            <option value="broken">Hỏng</option>
                            <option value="retired">Ngừng sử dụng</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="newEquipmentDescription" className="block text-gray-700 text-sm font-bold mb-2">Mô tả:</label>
                        <textarea
                            id="newEquipmentDescription"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newEquipmentDescription}
                            onChange={(e) => setNewEquipmentDescription(e.target.value)}
                            rows="3"
                        ></textarea>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            className={`mt-4 font-bold py-2 px-4 rounded ${editingEquipment ? 'bg-blue-500 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-700'} text-white`}
                        >
                            {editingEquipment ? 'Cập nhật Thiết bị' : 'Thêm Thiết bị'}
                        </button>
                        {editingEquipment && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="mt-4 ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Hủy
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Danh sách Trang thiết bị</h3>
                {equipment.length === 0 ? (
                    <p className="text-gray-600">Chưa có trang thiết bị nào.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên thiết bị</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {equipment.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'available' ? 'bg-green-100 text-green-800' :
                                                    item.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                                                        item.status === 'under_maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {getStatusText(item.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEditClick(item)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Chỉnh sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEquipment(item.id)}
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

export default EquipmentPage;
