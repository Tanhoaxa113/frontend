// frontend/src/pages/ChatPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/auth';

function ChatPage() {
    const { groupName } = useParams();
    const navigate = useNavigate();
    const [currentGroup, setCurrentGroup] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatGroups, setChatGroups] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [newGroupName, setNewGroupName] = useState('');
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const fetchChatData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const groupsResponse = await axiosInstance.get('chat-groups/');
            setChatGroups(groupsResponse.data);

            const userResponse = await axiosInstance.get('auth/whoami/');
            setCurrentUser(userResponse.data);

            if (groupName) {
                const selectedGroup = groupsResponse.data.find(g => g.name === groupName);
                if (selectedGroup) {
                    setCurrentGroup(selectedGroup);
                    const messagesResponse = await axiosInstance.get(`chat-groups/${selectedGroup.id}/messages/`);
                    setMessages(messagesResponse.data.map(msg => ({
                        ...msg,
                        type: 'chat_message',
                        sender_username: msg.sender_username,
                        timestamp: msg.timestamp,
                        file: msg.file,
                        image: msg.image,
                        content: msg.content
                    })));
                } else {
                    setCurrentGroup(null);
                    setMessages([]);
                }
            }
        } catch (err) {
            setError("Không thể tải dữ liệu chat. Vui lòng kiểm tra kết nối.");
            console.error("Lỗi tải dữ liệu chat:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    }, [groupName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        fetchChatData();
    }, [fetchChatData]);

    useEffect(() => {
        if (!currentGroup) {
            if (ws.current) ws.current.close();
            return;
        }

        const connectWebSocket = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            const encodedGroupName = encodeURIComponent(currentGroup.name);
            const wsUrl = `${protocol}localhost:8000/ws/chat/${encodedGroupName}/`;

            if (ws.current) {
                ws.current.close();
            }

            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log('WebSocket connected');
                setError('');
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'chat_message') {
                    // Tin nhắn mới đến, cập nhật state ngay lập tức
                    setMessages((prevMessages) => [...prevMessages, data]);
                } else if (data.type === 'error') {
                    setError(data.message);
                }
            };

            ws.current.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                if (!event.wasClean) {
                    setTimeout(connectWebSocket, 3000);
                }
            };

            ws.current.onerror = (err) => {
                console.error('WebSocket error:', err);
                setError("Lỗi kết nối chat. Vui lòng kiểm tra server.");
                ws.current.close();
            };
        };

        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [currentGroup]);
    
    const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentGroup) {
        setError("Vui lòng chọn một nhóm chat.");
        return;
    }

    const file = fileInputRef.current?.files[0];
    const hasMessage = messageInput.trim() !== '';
    const hasFile = !!file;

    if (!hasMessage && !hasFile) return;

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        if (hasFile) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64data = reader.result.split(',')[1];
                ws.current.send(JSON.stringify({
                    group_name: currentGroup.name,
                    file_name: file.name,
                    file_data_base64: base64data,
                    is_image: file.type.startsWith('image/'),
                }));
                // Reset sau khi gửi file
                if (fileInputRef.current) {
                    fileInputRef.current.value = null;
                }
            };
        }

        if (hasMessage) {
            ws.current.send(JSON.stringify({
                content: messageInput,
                group_name: currentGroup.name
            }));
            setMessageInput('');
        }
    } else {
        setError("Kết nối chat chưa sẵn sàng. Vui lòng thử lại sau.");
    }
};

    const handleGroupChange = (group) => {
        navigate(`/chat/${group.name}`);
    };
    const handleFileChange = (event) => {
    // Tùy bạn muốn xử lý gì ở đây. Có thể để trống nếu không cần preview file.
    console.log("File selected:", event.target.files[0]);
    };
    const handleAddGroup = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axiosInstance.post('chat-groups/', {
                name: newGroupName,
            });
            setNewGroupName('');
            fetchChatData();
            alert(`Đã tạo nhóm chat '${response.data.name}' thành công!`);
        } catch (err) {
            setError("Không thể tạo nhóm chat. Vui lòng kiểm tra lại thông tin.");
            console.error("Lỗi tạo nhóm chat:", err.response?.data || err.message);
        }
    };

    const handleAddMember = async () => {
        if (!newMemberUsername || !currentGroup) {
            setError("Vui lòng chọn nhóm chat và cung cấp tên người dùng.");
            return;
        }
        try {
            await axiosInstance.post(`chat-groups/${currentGroup.id}/add-member/`, {
                username: newMemberUsername,
            });
            setNewMemberUsername('');
            alert(`Đã thêm ${newMemberUsername} vào nhóm chat.`);
            fetchChatData();
        } catch (err) {
            setError("Không thể thêm thành viên. Vui lòng kiểm tra lại tên người dùng.");
            console.error("Lỗi thêm thành viên:", err.response?.data || err.message);
        }
    };

    if (loading) return <div className="text-center py-8">Đang tải dữ liệu chat...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

    return (
        <div className="flex h-screen">
            <div className="w-1/4 bg-white p-4 overflow-y-auto border-r border-gray-200">
                <h3 className="text-xl font-bold mb-4">Nhóm chat</h3>
                <form onSubmit={handleAddGroup} className="flex mb-4">
                    <input
                        type="text"
                        placeholder="Tên nhóm mới..."
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="flex-1 shadow appearance-none border rounded-l py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-r"
                    >
                        Tạo
                    </button>
                </form>
                <ul>
                    {chatGroups.map((group) => (
                        <li
                            key={group.id}
                            onClick={() => handleGroupChange(group)}
                            className={`p-2 cursor-pointer rounded-lg ${currentGroup?.id === group.id ? 'bg-blue-200' : 'hover:bg-gray-100'}`}
                        >
                            {group.name}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex-1 flex flex-col">
                {currentGroup ? (
                    <>
                        <header className="bg-gray-200 p-4 border-b border-gray-300">
                            <h3 className="text-xl font-bold">{currentGroup.name}</h3>
                            <div className="mt-2">
                                <p>Thành viên: {currentGroup.members.length}</p>
                                <div className="flex mt-2 space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Tên người dùng..."
                                        value={newMemberUsername}
                                        onChange={(e) => setNewMemberUsername(e.target.value)}
                                        className="flex-1 shadow appearance-none border rounded py-1 px-2 text-sm"
                                    />
                                    <button
                                        onClick={handleAddMember}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Thêm
                                    </button>
                                </div>
                            </div>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 flex flex-col">
                            {messages.length === 0 ? (
                                <p className="text-gray-500 text-center">Bắt đầu cuộc trò chuyện!</p>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={index} className={`flex mb-2 ${msg.sender_username === currentUser?.username ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-lg max-w-sm ${msg.sender_username === currentUser?.username ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                                            <span className="font-semibold">{msg.sender_username}</span>
                                            {msg.content && <p className="mt-1">{msg.content}</p>}
                                            {msg.file && !msg.image && <a href={`http://localhost:8000${msg.file}`} target="_blank" rel="noopener noreferrer" className="text-sm underline">Tệp đính kèm</a>}
                                            {msg.image && <img src={`http://localhost:8000${msg.image}`} alt="Tệp ảnh" className="mt-2 max-w-full h-auto rounded" />}
                                            <span className="block text-right text-xs mt-1 opacity-75">
                                                {new Date(msg.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <footer className="bg-white p-4 border-t border-gray-300">
                            <form onSubmit={handleSubmit} className="flex items-center">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                                <input
                                    type="file"
                                    id="fileInput"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                />
                                <label htmlFor="fileInput" className="ml-2 cursor-pointer">
                                    <svg className="w-6 h-6 text-gray-600 hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                </label>
                                <button
                                    type="submit"
                                    className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Gửi
                                </button>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Vui lòng chọn một nhóm chat để bắt đầu.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatPage;
