import { useEffect } from 'react';
import { getSocket } from '../services/socket';
import useChatStore from '../store/chatStore';

const useSocket = () => {
  const { addMessage, setTyping, setUserOnline, updateMessageStatus } = useChatStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNewMessage = ({ message }) => {
      addMessage(message);
    };

    const onTypingStart = ({ conversationId, userId, username }) => {
      setTyping(conversationId, userId, username, true);
    };

    const onTypingStop = ({ conversationId, userId }) => {
      setTyping(conversationId, userId, null, false);
    };

    const onUserOnline = ({ userId }) => {
      setUserOnline(userId, true, null);
    };

    const onUserOffline = ({ userId, lastSeen }) => {
      setUserOnline(userId, false, lastSeen);
    };

    const onMessageSeen = ({ conversationId, seenBy }) => {
      updateMessageStatus(conversationId, seenBy);
    };

    socket.on('message:new', onNewMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('user:online', onUserOnline);
    socket.on('user:offline', onUserOffline);
    socket.on('message:seen', onMessageSeen);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('user:online', onUserOnline);
      socket.off('user:offline', onUserOffline);
      socket.off('message:seen', onMessageSeen);
    };
  }, [addMessage, setTyping, setUserOnline, updateMessageStatus]);
};

export default useSocket;
