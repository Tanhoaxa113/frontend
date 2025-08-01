// frontend/src/pages/ProjectsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/auth';

function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('projects/');
            setProjects(response.data);
            setError('');
        } catch (err) {
            setError("Không thể tải danh sách dự án. Vui lòng thử lại.");
            console.error("Fetch projects error:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProject = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axiosInstance.post('projects/', {
                name: newProjectName,
                description: newProjectDescription,
                start_date: new Date().toISOString().slice(0, 10), // Sử dụng ngày hiện tại
                status: 'planning',
            });
            setNewProjectName('');
            setNewProjectDescription('');
            fetchProjects(); // Tải lại danh sách sau khi thêm thành công
        } catch (err) {
            setError("Không thể thêm dự án. Vui lòng kiểm tra lại thông tin.");
            console.error("Add project error:", err.response?.data || err.message);
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa dự án này?")) return;
        try {
            await axiosInstance.delete(`projects/${id}/`);
            fetchProjects();
        } catch (err) {
            setError("Không thể xóa dự án. Vui lòng thử lại.");
            console.error("Delete project error:", err.response?.data || err.message);
        }
    };

    if (loading) return <div className="text-center py-8">Đang tải dự án...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Dự án</h2>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Thêm Dự án Mới</h3>
                <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="newProjectName" className="block text-gray-700 text-sm font-bold mb-2">Tên dự án:</label>
                        <input
                            type="text"
                            id="newProjectName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="newProjectDescription" className="block text-gray-700 text-sm font-bold mb-2">Mô tả:</label>
                        <textarea
                            id="newProjectDescription"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                            rows="3"
                        ></textarea>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Thêm Dự án
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Danh sách Dự án</h3>
                {projects.length === 0 ? (
                    <p className="text-gray-600">Chưa có dự án nào.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên dự án</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày bắt đầu</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {projects.map((project) => (
                                    <tr key={project.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-900 font-semibold">
                                                {project.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">{project.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap capitalize">{project.status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{project.start_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteProject(project.id)}
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

export default ProjectsPage;
