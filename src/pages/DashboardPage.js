// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/auth';

function DashboardPage() {
    const [stats, setStats] = useState({
        projects_in_progress: 0,
        overdue_tasks: 0,
        pending_contracts: 0,
        total_partners: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const projectsResponse = await axiosInstance.get('projects/');
            const tasksResponse = await axiosInstance.get('tasks/');
            const contractsResponse = await axiosInstance.get('contracts/');
            const partnersResponse = await axiosInstance.get('partners/');

            const projectsInProgress = projectsResponse.data.filter(
                (p) => p.status === 'in_progress'
            ).length;

            const overdueTasks = tasksResponse.data.filter((t) => {
                const today = new Date();
                const dueDate = new Date(t.due_date);
                return dueDate < today && t.status !== 'done';
            }).length;

            const pendingContracts = contractsResponse.data.filter(
                (c) => c.status === 'draft' || c.status === 'active'
            ).length;

            const totalPartners = partnersResponse.data.length;

            setStats({
                projects_in_progress: projectsInProgress,
                overdue_tasks: overdueTasks,
                pending_contracts: pendingContracts,
                total_partners: totalPartners,
            });
            setError('');
        } catch (err) {
            setError('Không thể tải dữ liệu Dashboard. Vui lòng thử lại.');
            console.error(
                'Fetch dashboard stats error:',
                err.response?.data || err.message
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return <div className="text-center py-8">Đang tải Dashboard...</div>;
    if (error)
        return <div className="text-center py-8 text-red-500">{error}</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h2>
            <p className="text-gray-700 mb-8">
                Chào mừng đến với hệ thống quản lý dự án, đối tác và hợp đồng!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                        Dự án đang tiến hành
                    </h3>
                    <p className="text-4xl font-bold text-blue-600">
                        {stats.projects_in_progress}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                        Nhiệm vụ quá hạn
                    </h3>
                    <p className="text-4xl font-bold text-red-600">
                        {stats.overdue_tasks}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                        Hợp đồng chờ duyệt
                    </h3>
                    <p className="text-4xl font-bold text-yellow-600">
                        {stats.pending_contracts}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                        Tổng số đối tác
                    </h3>
                    <p className="text-4xl font-bold text-green-600">
                        {stats.total_partners}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
