import { useRef, useCallback } from 'react';
import { getSocket } from '../services/socket';

const TYPING_DEBOUNCE_MS = 1500;

const useTyping = (conversationId) => {
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const startTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing:start', { conversationId });
    }

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('typing:stop', { conversationId });
    }, TYPING_DEBOUNCE_MS);
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return;

    clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit('typing:stop', { conversationId });
    }
  }, [conversationId]);

  return { startTyping, stopTyping };
};

export default useTyping;
