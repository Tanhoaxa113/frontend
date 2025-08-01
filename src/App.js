// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PartnersPage from './pages/PartnersPage';
import ProjectsPage from './pages/ProjectsPage';
import ContractsPage from './pages/ContractsPage';
import StaffPage from './pages/StaffPage';
import EquipmentPage from './pages/EquipmentPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage'; // Import trang chat mới

import PrivateRoute from './auth/PrivateRoute';
import { checkAuth, logoutUser } from './api/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Kiểm tra trạng thái đăng nhập khi ứng dụng khởi động
  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAuth();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };
    verifyAuth();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    // Sau khi đăng xuất, tự động chuyển hướng về trang đăng nhập
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100">Đang tải ứng dụng...</div>;
  }

  return (
    <Router>
      <div className="flex min-h-screen">
        {isAuthenticated && (
          <nav className="w-64 bg-gray-800 text-white p-4 flex flex-col">
            <h1 className="text-2xl font-bold mb-6">Quản lý Hệ thống</h1>
            <ul className="flex-grow space-y-2">
              <li><Link to="/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</Link></li>
              <li><Link to="/partners" className="block py-2 px-4 rounded hover:bg-gray-700">Đối tác</Link></li>
              <li><Link to="/projects" className="block py-2 px-4 rounded hover:bg-gray-700">Dự án</Link></li>
              <li><Link to="/contracts" className="block py-2 px-4 rounded hover:bg-gray-700">Hợp đồng</Link></li>
              <li><Link to="/staff" className="block py-2 px-4 rounded hover:bg-gray-700">Nhân sự</Link></li>
              <li><Link to="/equipment" className="block py-2 px-4 rounded hover:bg-gray-700">Trang thiết bị</Link></li>
              <li><Link to="/chat" className="block py-2 px-4 rounded hover:bg-gray-700">Chat</Link></li>
            </ul>
            <div className="mt-auto">
              <button onClick={handleLogout} className="block w-full text-left py-2 px-4 rounded hover:bg-gray-700">Đăng xuất</button>
            </div>
          </nav>
        )}
        <div className="flex-1 p-8 bg-gray-100 overflow-auto">
          <Routes>
            <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={<PrivateRoute isAuthenticated={isAuthenticated}><DashboardPage /></PrivateRoute>} />
            <Route path="/partners" element={<PrivateRoute isAuthenticated={isAuthenticated}><PartnersPage /></PrivateRoute>} />
            <Route path="/projects" element={<PrivateRoute isAuthenticated={isAuthenticated}><ProjectsPage /></PrivateRoute>} />
            <Route path="/projects/:id" element={<PrivateRoute isAuthenticated={isAuthenticated}><ProjectDetailPage /></PrivateRoute>} />
            <Route path="/contracts" element={<PrivateRoute isAuthenticated={isAuthenticated}><ContractsPage /></PrivateRoute>} />
            <Route path="/staff" element={<PrivateRoute isAuthenticated={isAuthenticated}><StaffPage /></PrivateRoute>} />
            <Route path="/equipment" element={<PrivateRoute isAuthenticated={isAuthenticated}><EquipmentPage /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute isAuthenticated={isAuthenticated}><ChatPage /></PrivateRoute>} />
            <Route path="/chat/:groupName" element={<PrivateRoute isAuthenticated={isAuthenticated}><ChatPage /></PrivateRoute>} />
            <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
