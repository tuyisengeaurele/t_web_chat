import { useState, useRef } from 'react';
import { messagesAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import useChatStore from '../../store/chatStore';
import useTyping from '../../hooks/useTyping';

const MessageInput = ({ conversationId }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { addMessage } = useChatStore();
  const { startTyping, stopTyping } = useTyping(conversationId);

  const handleTextChange = (e) => {
    setText(e.target.value);
    startTyping();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    const content = text.trim();
    if (!content || isSending) return;

    stopTyping();
    setText('');
    setIsSending(true);

    try {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('message:send', { conversationId, content, type: 'text' }, ({ message, error }) => {
          if (message) addMessage(message);
          if (error) console.error('Send error:', error);
        });
      } else {
        const res = await messagesAPI.sendMessage(conversationId, { content });
        addMessage(res.data.message);
      }
    } catch (err) {
      console.error('Failed to send message', err);
      setText(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      const res = await messagesAPI.sendMessage(conversationId, formData);
      addMessage(res.data.message);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-end gap-2 px-4 py-3 bg-white border-t border-gray-200">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition shrink-0 mb-0.5"
        title="Attach file"
      >
        {isUploading ? (
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="flex-1 flex items-end bg-gray-100 rounded-2xl px-4 py-2">
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none resize-none max-h-32 leading-relaxed"
          style={{ height: 'auto' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!text.trim() || isSending}
        className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition shrink-0 mb-0.5"
        title="Send"
      >
        <svg className="w-5 h-5 rotate-45 -translate-x-px translate-y-px" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
};

export default MessageInput;
