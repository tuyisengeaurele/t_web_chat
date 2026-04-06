import { useEffect, useRef, useCallback } from 'react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import { messagesAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import { formatDate } from '../../utils/formatters';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';

const DateDivider = ({ date }) => (
  <div className="flex items-center justify-center my-3">
    <span className="bg-white text-gray-400 text-xs px-3 py-1 rounded-full shadow-sm border border-gray-100">
      {formatDate(date)}
    </span>
  </div>
);

const shouldShowDateDivider = (messages, index) => {
  if (index === 0) return true;
  const curr = new Date(messages[index].createdAt);
  const prev = new Date(messages[index - 1].createdAt);
  return curr.toDateString() !== prev.toDateString();
};

const ChatWindow = () => {
  const { activeConversation, messages, loadMessages, getTypingForConversation } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const bottomRef = useRef(null);
  const conversationId = activeConversation?._id;
  const conversationMessages = messages[conversationId] || [];
  const typingUsers = conversationId ? getTypingForConversation(conversationId) : [];

  useEffect(() => {
    if (!conversationId) return;

    loadMessages(conversationId);
    messagesAPI.markAsSeen(conversationId).catch(() => {});

    const socket = getSocket();
    socket?.emit('message:seen', { conversationId });
    socket?.emit('conversation:join', { conversationId });
  }, [conversationId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length, typingUsers.length]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Your Messages</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          Select a conversation or search for someone to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
      <ChatHeader conversation={activeConversation} />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {conversationMessages.map((msg, index) => (
          <div key={msg._id}>
            {shouldShowDateDivider(conversationMessages, index) && (
              <DateDivider date={msg.createdAt} />
            )}
            <MessageBubble
              message={msg}
              isMine={msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id}
            />
          </div>
        ))}

        <TypingIndicator users={typingUsers} />
        <div ref={bottomRef} />
      </div>

      <MessageInput conversationId={conversationId} />
    </div>
  );
};

export default ChatWindow;
