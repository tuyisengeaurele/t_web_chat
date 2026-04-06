import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSocket from '../hooks/useSocket';
import Sidebar from '../components/sidebar/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';

const ChatPage = () => {
  const { isAuthenticated, rehydrateSocket } = useAuthStore();

  useEffect(() => {
    rehydrateSocket();
  }, [rehydrateSocket]);

  useSocket();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      <Sidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
