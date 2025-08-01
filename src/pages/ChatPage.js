// frontend/src/pages/ChatPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/auth';

// --- Component Modal để thêm thành viên ---
const AddMemberModal = ({ isOpen, onClose, onAddMember, currentGroup }) => {
    const [email, setEmail] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!email.trim()) return;
        setIsSearching(true);
        setSearchError('');
        setFoundUser(null);
        try {
            const response = await axiosInstance.get(`users/search/?email=${email}`);
            if (currentGroup.members.some(member => member.id === response.data.id)) {
                setSearchError('Người dùng này đã ở trong nhóm.');
            } else {
                setFoundUser(response.data);
            }
        } catch (err) {
            setSearchError(err.response?.data?.error || 'Không tìm thấy người dùng.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleConfirmAdd = () => {
        if (foundUser) {
            onAddMember(foundUser.id);
            handleClose();
        }
    };

    const handleClose = () => {
        setEmail('');
        setFoundUser(null);
        setSearchError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Thêm thành viên vào nhóm "{currentGroup?.name}"</h2>
                <div className="flex gap-2">
                    <input
                        type="email"
                        placeholder="Nhập email của thành viên..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 shadow-sm border rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleSearch} disabled={isSearching} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300">
                        {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                </div>
                
                {searchError && <p className="text-red-500 mt-2">{searchError}</p>}

                {foundUser && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                        <p>Tìm thấy người dùng:</p>
                        <p className="font-semibold text-lg">{foundUser.full_name} ({foundUser.username})</p>
                        <button onClick={handleConfirmAdd} className="mt-2 w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600">
                            Xác nhận thêm
                        </button>
                    </div>
                )}

                <button onClick={handleClose} className="mt-4 w-full bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400">
                    Đóng
                </button>
            </div>
        </div>
    );
};


function ChatPage() {
    const { groupName } = useParams();
    const navigate = useNavigate();
    const [currentGroup, setCurrentGroup] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatGroups, setChatGroups] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const fetchChatData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [groupsResponse, userResponse] = await Promise.all([
                axiosInstance.get('chat-groups/'),
                axiosInstance.get('auth/whoami/')
            ]);
            
            setChatGroups(groupsResponse.data);
            setCurrentUser(userResponse.data);

            if (groupName) {
                const selectedGroup = groupsResponse.data.find(g => g.name === groupName);
                if (selectedGroup) {
                    setCurrentGroup(selectedGroup);
                    const messagesResponse = await axiosInstance.get(`chat-groups/${selectedGroup.id}/messages/`);
                    setMessages(messagesResponse.data);
                } else if (groupsResponse.data.length > 0) {
                    navigate(`/chat/${groupsResponse.data[0].name}`);
                }
            } else if (groupsResponse.data.length > 0) {
                 navigate(`/chat/${groupsResponse.data[0].name}`);
            }
        } catch (err) {
            setError("Không thể tải dữ liệu chat. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [groupName, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        fetchChatData();
    }, [groupName]);

    useEffect(() => {
        if (!currentGroup || !currentUser) {
            if (ws.current) ws.current.close();
            return;
        }

        const connectWebSocket = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            const apiHost = (new URL(axiosInstance.defaults.baseURL)).host;
            const encodedGroupName = encodeURIComponent(currentGroup.name);
            const wsUrl = `${protocol}${apiHost}/ws/chat/${encodedGroupName}/`;

            ws.current = new WebSocket(wsUrl);
            ws.current.onopen = () => console.log('WebSocket connected');
            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'chat_message' && data.message) {
                    setMessages((prev) => [...prev, data.message]);
                }
            };
            ws.current.onclose = () => console.log('WebSocket disconnected');
            ws.current.onerror = (err) => console.error('WebSocket error:', err);
        };

        connectWebSocket();

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [currentGroup, currentUser]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentGroup) return;
        
        const isFileChange = e.target.type === 'file';
        const file = isFileChange ? e.target.files[0] : fileInputRef.current?.files[0];
        const hasMessage = messageInput.trim() !== '';

        if (!hasMessage && !file) return;

        if (hasMessage && ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ content: messageInput }));
            setMessageInput('');
        }

        if (file) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('group_id', currentGroup.id);
            try {
                await axiosInstance.post('chat/upload-file/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } catch (err) {
                setError('Không thể tải file lên.');
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = null;
            }
        }
    };

    const handleAddGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        try {
            const response = await axiosInstance.post('chat-groups/', { name: newGroupName });
            setNewGroupName('');
            await fetchChatData();
            navigate(`/chat/${response.data.name}`);
        } catch (err) {
            setError(err.response?.data?.name?.[0] || "Không thể tạo nhóm chat.");
        }
    };

    const handleAddMember = async (userId) => {
        try {
            const response = await axiosInstance.post(`chat-groups/${currentGroup.id}/add-member/`, { user_id: userId });
            setCurrentGroup(prevGroup => ({
                ...prevGroup,
                members: [...prevGroup.members, response.data]
            }));
            alert('Thêm thành viên thành công!');
        } catch (err) {
            alert(err.response?.data?.error || "Lỗi khi thêm thành viên.");
        }
    };

    const handleLeaveGroup = async () => {
        if (window.confirm('Bạn có chắc chắn muốn rời khỏi nhóm này?')) {
            try {
                await axiosInstance.post(`chat-groups/${currentGroup.id}/leave_group/`);
                navigate('/chat');
                setCurrentGroup(null);
                setMessages([]);
                fetchChatData();
            } catch (err) {
                alert(err.response?.data?.error || 'Không thể rời nhóm.');
            }
        }
    };

    const handleDeleteGroup = async () => {
        if (window.confirm('Bạn có chắc chắn muốn XÓA nhóm này không? Hành động này không thể hoàn tác.')) {
            try {
                await axiosInstance.delete(`chat-groups/${currentGroup.id}/`);
                navigate('/chat');
                setCurrentGroup(null);
                setMessages([]);
                fetchChatData();
            } catch (err) {
                alert(err.response?.data?.error || 'Không thể xóa nhóm.');
            }
        }
    };

    if (loading) return <div className="flex-1 flex items-center justify-center">Đang tải...</div>;

    const isOwner = currentUser?.id === currentGroup?.owner?.id;

    return (
        <>
            <AddMemberModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAddMember={handleAddMember}
                currentGroup={currentGroup}
            />
            {/* Layout 2 cột chính của trang Chat */}
            <div className="flex h-full">
                {/* Cột 2: Danh sách nhóm chat */}
                <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b">
                        <h3 className="text-xl font-bold text-gray-800">Đoạn chat</h3>
                        <form onSubmit={handleAddGroup} className="flex mt-4">
                            <input type="text" placeholder="Tên nhóm mới..." value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="flex-1 shadow-sm border rounded-l py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r transition-colors">Tạo</button>
                        </form>
                    </div>
                    <ul className="flex-1 overflow-y-auto">
                        {chatGroups.map((group) => (
                            <li key={group.id} onClick={() => navigate(`/chat/${group.name}`)} className={`p-4 cursor-pointer border-l-4 ${currentGroup?.id === group.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-100'}`}>
                                <p className="font-semibold">{group.name}</p>
                                <p className="text-sm text-gray-500 truncate">Trưởng nhóm: {group.owner?.full_name || 'N/A'}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Cột 3: Nội dung cuộc trò chuyện */}
                <div className="flex-1 flex flex-col bg-gray-50">
                    {currentGroup ? (
                        <>
                            <header className="bg-white p-4 border-b border-gray-200 shadow-sm flex-shrink-0">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">{currentGroup.name}</h3>
                                        <p className="text-sm text-gray-600">Trưởng nhóm: {currentGroup.owner?.full_name || 'N/A'} | Thành viên: {currentGroup.members.length}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm transition-colors">Thêm thành viên</button>
                                        {!isOwner && <button onClick={handleLeaveGroup} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-sm transition-colors">Rời nhóm</button>}
                                        {isOwner && <button onClick={handleDeleteGroup} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition-colors">Xóa nhóm</button>}
                                    </div>
                                </div>
                            </header>
                            
                            {error && <p className="text-center py-2 bg-red-100 text-red-700">{error}</p>}

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, index) => (
                                    <div key={msg.id || index} className={`flex items-end gap-2 ${msg.sender === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-lg max-w-lg ${msg.sender === currentUser?.id ? 'bg-blue-500 text-white' : 'bg-white shadow-sm'}`}>
                                            <span className="font-semibold block text-sm">{msg.sender_full_name}</span>
                                            {msg.content && <p className="mt-1 text-base whitespace-pre-wrap">{msg.content}</p>}
                                            {msg.file_url && (
                                                msg.is_image ? (
                                                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                                                        <img src={msg.file_url} alt="Tệp ảnh" className="mt-2 max-w-xs h-auto rounded-lg cursor-pointer" />
                                                    </a>
                                                ) : (
                                                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={`mt-2 block p-2 rounded-lg ${msg.sender === currentUser?.id ? 'bg-blue-400 hover:bg-blue-300' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}>
                                                        Tải về: {msg.content?.replace('Đã gửi một tệp: ', '')}
                                                    </a>
                                                )
                                            )}
                                            <span className="block text-right text-xs mt-1 opacity-75">{new Date(msg.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <footer className="bg-white p-4 border-t border-gray-200 flex-shrink-0">
                                {isUploading && <p className="text-sm text-gray-500 mb-2 animate-pulse">Đang tải file lên...</p>}
                                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                                    <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 shadow-sm border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isUploading}/>
                                    <input type="file" id="fileInput" className="hidden" onChange={handleSubmit} ref={fileInputRef} disabled={isUploading}/>
                                    <label htmlFor="fileInput" className="cursor-pointer p-2 rounded-full hover:bg-gray-200 transition-colors">
                                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                    </label>
                                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors disabled:bg-blue-300" disabled={(!messageInput.trim() && !fileInputRef.current?.files?.length) || isUploading}>Gửi</button>
                                </form>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-500 text-lg">Vui lòng chọn hoặc tạo một nhóm chat để bắt đầu.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ChatPage;
