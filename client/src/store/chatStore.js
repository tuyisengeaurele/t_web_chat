import { create } from 'zustand';
import { messagesAPI } from '../services/api';

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},
  onlineUsers: {},
  searchResults: [],
  isLoadingMessages: false,
  isSendingMessage: false,

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation });
  },

  loadConversations: async () => {
    try {
      const res = await messagesAPI.getConversations();
      set({ conversations: res.data.conversations });
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  },

  startConversation: async (recipientId) => {
    try {
      const res = await messagesAPI.startConversation(recipientId);
      const conversation = res.data.conversation;

      set((state) => {
        const exists = state.conversations.find((c) => c._id === conversation._id);
        return {
          conversations: exists
            ? state.conversations
            : [conversation, ...state.conversations],
          activeConversation: conversation,
        };
      });

      return conversation;
    } catch (err) {
      console.error('Failed to start conversation', err);
    }
  },

  loadMessages: async (conversationId, page = 1) => {
    set({ isLoadingMessages: true });
    try {
      const res = await messagesAPI.getMessages(conversationId, page);
      const newMessages = res.data.messages;

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]:
            page === 1
              ? newMessages
              : [...newMessages, ...(state.messages[conversationId] || [])],
        },
        isLoadingMessages: false,
      }));

      return res.data.pagination;
    } catch (err) {
      console.error('Failed to load messages', err);
      set({ isLoadingMessages: false });
    }
  },

  addMessage: (message) => {
    const { conversationId } = message;
    set((state) => {
      const existing = state.messages[conversationId] || [];
      const isDuplicate = existing.some((m) => m._id === message._id);
      if (isDuplicate) return state;

      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existing, message],
        },
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? { ...c, lastMessage: message, updatedAt: new Date() } : c
        ),
      };
    });
  },

  setTyping: (conversationId, userId, username, isTyping) => {
    set((state) => {
      const key = `${conversationId}:${userId}`;
      const typingUsers = { ...state.typingUsers };

      if (isTyping) {
        typingUsers[key] = { conversationId, userId, username };
      } else {
        delete typingUsers[key];
      }

      return { typingUsers };
    });
  },

  setUserOnline: (userId, isOnline, lastSeen) => {
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: { isOnline, lastSeen } },
      conversations: state.conversations.map((c) => ({
        ...c,
        participants: c.participants?.map((p) =>
          p._id === userId ? { ...p, isOnline, lastSeen: lastSeen || p.lastSeen } : p
        ),
      })),
    }));
  },

  updateMessageStatus: (conversationId, seenBy) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((m) =>
          m.status !== 'seen' ? { ...m, status: 'seen' } : m
        ),
      },
    }));
  },

  getTypingForConversation: (conversationId) => {
    const { typingUsers } = get();
    return Object.values(typingUsers).filter((t) => t.conversationId === conversationId);
  },

  clearSearch: () => set({ searchResults: [] }),
}));

export default useChatStore;
