import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import Avatar from '../common/Avatar';
import ConversationItem from './ConversationItem';
import SearchPanel from './SearchPanel';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { conversations, activeConversation, setActiveConversation, loadConversations } = useChatStore();
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div className="w-80 flex flex-col border-r border-gray-200 bg-white h-full shrink-0">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Avatar user={user} size="md" showOnline />
          <div>
            <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
            <p className="text-xs text-emerald-600 font-medium">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(true)}
            title="New chat"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-200 rounded-full transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {showSearch ? (
          <SearchPanel onClose={() => setShowSearch(false)} />
        ) : (
          <div className="h-full overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm text-gray-400 mb-1">No conversations yet</p>
                <p className="text-xs text-gray-300">Click + to start a new chat</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv._id}
                  conversation={conv}
                  isActive={activeConversation?._id === conv._id}
                  onClick={() => setActiveConversation(conv)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
