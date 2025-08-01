// frontend/src/pages/ContractsPage.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/auth';

function ContractsPage() {
    const [contracts, setContracts] = useState([]);
    const [partners, setPartners] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newContractNumber, setNewContractNumber] = useState('');
    const [newPartner, setNewPartner] = useState('');
    const [newProject, setNewProject] = useState('');
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');
    const [newContractValue, setNewContractValue] = useState('');

    const [editingContract, setEditingContract] = useState(null); // State để lưu hợp đồng đang chỉnh sửa

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const contractsResponse = await axiosInstance.get('contracts/');
            const partnersResponse = await axiosInstance.get('partners/');
            const projectsResponse = await axiosInstance.get('projects/');

            setContracts(contractsResponse.data);
            setPartners(partnersResponse.data);
            setProjects(projectsResponse.data);
            setError('');
        } catch (err) {
            setError("Không thể tải dữ liệu. Vui lòng thử lại.");
            console.error("Fetch data error:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'draft': return 'Bản nháp';
            case 'active': return 'Hoạt động';
            case 'expired': return 'Hết hạn';
            case 'cancelled': return 'Hủy bỏ';
            case 'completed': return 'Hoàn thành';
            default: return status;
        }
    };

    const handleAddContract = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axiosInstance.post('contracts/', {
                contract_number: newContractNumber,
                partner: newPartner,
                project: newProject || null,
                start_date: newStartDate,
                end_date: newEndDate,
                value: newContractValue,
                status: 'draft',
            });
            // Reset form
            setNewContractNumber('');
            setNewPartner('');
            setNewProject('');
            setNewStartDate('');
            setNewEndDate('');
            setNewContractValue('');
            fetchData(); // Tải lại dữ liệu sau khi thêm thành công
        } catch (err) {
            setError("Không thể thêm hợp đồng. Vui lòng kiểm tra lại thông tin.");
            console.error("Add contract error:", err.response?.data || err.message);
        }
    };

    const handleEditClick = (contract) => {
        setEditingContract(contract);
        setNewContractNumber(contract.contract_number);
        setNewPartner(contract.partner);
        setNewProject(contract.project || '');
        setNewStartDate(contract.start_date);
        setNewEndDate(contract.end_date);
        setNewContractValue(contract.value);
    };

    const handleUpdateContract = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axiosInstance.put(`contracts/${editingContract.id}/`, {
                contract_number: newContractNumber,
                partner: newPartner,
                project: newProject || null,
                start_date: newStartDate,
                end_date: newEndDate,
                value: newContractValue,
                status: editingContract.status,
            });
            // Reset form và state chỉnh sửa
            setEditingContract(null);
            setNewContractNumber('');
            setNewPartner('');
            setNewProject('');
            setNewStartDate('');
            setNewEndDate('');
            setNewContractValue('');
            fetchData();
        } catch (err) {
            setError("Không thể cập nhật hợp đồng. Vui lòng kiểm tra lại thông tin.");
            console.error("Update contract error:", err.response?.data || err.message);
        }
    };

    const handleCancelEdit = () => {
        setEditingContract(null);
        setNewContractNumber('');
        setNewPartner('');
        setNewProject('');
        setNewStartDate('');
        setNewEndDate('');
        setNewContractValue('');
    };

    const handleDeleteContract = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa hợp đồng này?")) return;
        try {
            await axiosInstance.delete(`contracts/${id}/`);
            fetchData();
        } catch (err) {
            setError("Không thể xóa hợp đồng. Vui lòng thử lại.");
            console.error("Delete contract error:", err.response?.data || err.message);
        }
    };

    if (loading) return <div className="text-center py-8">Đang tải hợp đồng...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Hợp đồng</h2>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{editingContract ? 'Chỉnh sửa Hợp đồng' : 'Thêm Hợp đồng Mới'}</h3>
                <form onSubmit={editingContract ? handleUpdateContract : handleAddContract} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="contractNumber" className="block text-gray-700 text-sm font-bold mb-2">Số hợp đồng:</label>
                        <input
                            type="text"
                            id="contractNumber"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newContractNumber}
                            onChange={(e) => setNewContractNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="partner" className="block text-gray-700 text-sm font-bold mb-2">Đối tác:</label>
                        <select
                            id="partner"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newPartner}
                            onChange={(e) => setNewPartner(e.target.value)}
                            required
                        >
                            <option value="">Chọn đối tác</option>
                            {partners.map((partner) => (
                                <option key={partner.id} value={partner.id}>{partner.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="project" className="block text-gray-700 text-sm font-bold mb-2">Dự án:</label>
                        <select
                            id="project"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newProject}
                            onChange={(e) => setNewProject(e.target.value)}
                        >
                            <option value="">Không có dự án</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Ngày bắt đầu:</label>
                        <input
                            type="date"
                            id="startDate"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newStartDate}
                            onChange={(e) => setNewStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">Ngày kết thúc:</label>
                        <input
                            type="date"
                            id="endDate"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newEndDate}
                            onChange={(e) => setNewEndDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="value" className="block text-gray-700 text-sm font-bold mb-2">Giá trị hợp đồng (VNĐ):</label>
                        <input
                            type="number"
                            id="value"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newContractValue}
                            onChange={(e) => setNewContractValue(e.target.value)}
                            required
                        />
                    </div>
                    <div className="lg:col-span-3 flex justify-end">
                        <button
                            type="submit"
                            className={`mt-4 font-bold py-2 px-4 rounded ${editingContract ? 'bg-blue-500 hover:bg-blue-700' : 'bg-green-500 hover:bg-green-700'} text-white`}
                        >
                            {editingContract ? 'Cập nhật Hợp đồng' : 'Thêm Hợp đồng'}
                        </button>
                        {editingContract && (
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
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Danh sách Hợp đồng</h3>
                {contracts.length === 0 ? (
                    <p className="text-gray-600">Chưa có hợp đồng nào.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số hợp đồng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đối tác</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dự án</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {contracts.map((contract) => (
                                    <tr key={contract.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{contract.contract_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{contract.partner_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{contract.project_name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="capitalize">{getStatusText(contract.status)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{contract.value} VNĐ</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEditClick(contract)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Chỉnh sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteContract(contract.id)}
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

export default ContractsPage;
