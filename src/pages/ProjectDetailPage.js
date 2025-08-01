// frontend/src/pages/ProjectDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/auth';

function ProjectDetailPage() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [financialRecords, setFinancialRecords] = useState([]);
    const [equipmentAssignments, setEquipmentAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            // Lấy thông tin chi tiết dự án
            const projectResponse = await axiosInstance.get(`projects/${id}/`);
            setProject(projectResponse.data);

            // Lấy danh sách các giai đoạn
            const milestonesResponse = await axiosInstance.get(`projects/${id}/milestones/`);
            setMilestones(milestonesResponse.data);

            // Lấy danh sách các công việc
            const tasksResponse = await axiosInstance.get(`projects/${id}/tasks/`);
            setTasks(tasksResponse.data);

            // Lấy danh sách các giao dịch tài chính
            const financialResponse = await axiosInstance.get(`projects/${id}/financial-records/`);
            setFinancialRecords(financialResponse.data);

            // Lấy danh sách phân bổ trang thiết bị
            const equipmentResponse = await axiosInstance.get(`projects/${id}/equipment-assignments/`);
            setEquipmentAssignments(equipmentResponse.data);

            setError('');
        } catch (err) {
            setError("Không thể tải chi tiết dự án. Vui lòng thử lại.");
            console.error("Fetch project details error:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const getFinancialRecordType = (type) => {
        switch (type) {
            case 'income': return 'Thu nhập';
            case 'expense': return 'Chi phí';
            case 'debt': return 'Công nợ';
            case 'funding': return 'Tài trợ';
            default: return type;
        }
    };

    if (loading) return <div className="text-center py-8">Đang tải chi tiết dự án...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
    if (!project) return <div className="text-center py-8">Không tìm thấy dự án.</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Chi tiết Dự án: {project.name}</h2>
                <Link to="/projects" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    Quay lại danh sách dự án
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Thông tin chung</h3>
                <p><strong>Mô tả:</strong> {project.description}</p>
                <p><strong>Ngày bắt đầu:</strong> {project.start_date}</p>
                <p><strong>Ngày kết thúc:</strong> {project.end_date || 'N/A'}</p>
                <p><strong>Trạng thái:</strong> <span className="capitalize">{project.status}</span></p>
                <p><strong>Ngân sách:</strong> {project.budget ? `${project.budget} VNĐ` : 'N/A'}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Các giai đoạn (Milestones)</h3>
                {milestones.length === 0 ? (
                    <p className="text-gray-600">Chưa có giai đoạn nào được thêm.</p>
                ) : (
                    <ul>
                        {milestones.map((milestone) => (
                            <li key={milestone.id} className="mb-2">
                                <span className="font-semibold">{milestone.name}</span> - Hạn chót: {milestone.due_date} ({milestone.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Công việc (Tasks)</h3>
                {tasks.length === 0 ? (
                    <p className="text-gray-600">Chưa có công việc nào được thêm.</p>
                ) : (
                    <ul>
                        {tasks.map((task) => (
                            <li key={task.id} className="mb-2">
                                <span className="font-semibold">{task.name}</span> - Trạng thái: {task.status} - Hạn chót: {task.due_date}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Tài chính dự án</h3>
                {financialRecords.length === 0 ? (
                    <p className="text-gray-600">Chưa có giao dịch tài chính nào.</p>
                ) : (
                    <ul>
                        {financialRecords.map((record) => (
                            <li key={record.id} className="mb-2">
                                <span className="font-semibold">{getFinancialRecordType(record.record_type)}:</span> {record.amount} VNĐ - ({record.description || 'Không có mô tả'}) - {record.date}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Phân bổ Trang thiết bị</h3>
                {equipmentAssignments.length === 0 ? (
                    <p className="text-gray-600">Chưa có thiết bị nào được phân bổ.</p>
                ) : (
                    <ul>
                        {equipmentAssignments.map((assignment) => (
                            <li key={assignment.id} className="mb-2">
                                <span className="font-semibold">{assignment.equipment_name}</span> - Người phân bổ: {assignment.assigned_by_username} - Ngày: {assignment.assigned_date}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default ProjectDetailPage;
