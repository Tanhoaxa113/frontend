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
import ChatPage from './pages/ChatPage';
import PrivateRoute from './auth/PrivateRoute';
import { checkAuth, logoutUser } from './api/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100">Đang tải...</div>;
  }

  return (
    <Router>
      {/* Layout chính: flex, full màn hình, không bị cuộn */}
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {isAuthenticated && (
          // Cột 1: Sidebar chính, không co lại
          <nav className="w-64 bg-gray-800 text-white p-4 flex flex-col flex-shrink-0">
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
        {/* Vùng nội dung chính, chiếm phần còn lại và tự quản lý layout bên trong */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            
            {/* Các trang khác sẽ có thanh cuộn riêng */}
            <Route path="/dashboard" element={<PrivateRoute isAuthenticated={isAuthenticated}><div className="p-8 overflow-y-auto h-full"><DashboardPage /></div></PrivateRoute>} />
            <Route path="/partners" element={<PrivateRoute isAuthenticated={isAuthenticated}><div className="p-8 overflow-y-auto h-full"><PartnersPage /></div></PrivateRoute>} />
            <Route path="/projects" element={<PrivateRoute isAuthenticated={isAuthenticated}><div className="p-8 overflow-y-auto h-full"><ProjectsPage /></div></PrivateRoute>} />
            <Route path="/projects/:id" element={<PrivateRoute isAuthenticated={isAuthenticated}><div className="p-8 overflow-y-auto h-full"><ProjectDetailPage /></div></PrivateRoute>} />
            <Route path="/contracts" element={<PrivateRoute isAuthenticated={isAuthenticated}><div className="p-8 overflow-y-auto h-full"><ContractsPage /></div></PrivateRoute>} />
            <Route path="/staff" element={<PrivateRoute isAuthenticated={isAuthenticated}><div className="p-8 overflow-y-auto h-full"><StaffPage /></div></PrivateRoute>} />
            <Route path="/equipment" element={<PrivateRoute isAuthenticated={isAuthenticated}><div className="p-8 overflow-y-auto h-full"><EquipmentPage /></div></PrivateRoute>} />
            
            {/* Trang Chat sẽ tự quản lý layout 2 cột bên trong nó */}
            <Route path="/chat" element={<PrivateRoute isAuthenticated={isAuthenticated}><ChatPage /></PrivateRoute>} />
            <Route path="/chat/:groupName" element={<PrivateRoute isAuthenticated={isAuthenticated}><ChatPage /></PrivateRoute>} />
            
            <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
