import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const onlineUsers = new Map();

const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return next(new Error('User not found'));

    socket.user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
};

const registerSocketHandlers = (io) => {
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();

    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id });

    socket.join(userId);

    io.emit('user:online', { userId, isOnline: true });

    const conversations = await Conversation.find({ participants: userId });
    conversations.forEach((conv) => socket.join(conv._id.toString()));

    socket.on('message:send', async (data, callback) => {
      try {
        const { conversationId, content, type = 'text' } = data;

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conversation) {
          return callback?.({ error: 'Conversation not found' });
        }

        const message = await Message.create({
          conversationId,
          sender: userId,
          content,
          type,
        });

        await message.populate('sender', 'username avatar');

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        io.to(conversationId).emit('message:new', { message });

        callback?.({ success: true, message });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    socket.on('message:seen', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          {
            conversationId,
            sender: { $ne: userId },
            'seenBy.user': { $ne: userId },
          },
          {
            $set: { status: 'seen' },
            $addToSet: { seenBy: { user: userId, seenAt: new Date() } },
          }
        );

        socket.to(conversationId).emit('message:seen', { conversationId, seenBy: userId });
      } catch (err) {
        console.error('message:seen error', err);
      }
    });

    socket.on('typing:start', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:start', {
        conversationId,
        userId,
        username: socket.user.username,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:stop', { conversationId, userId });
    });

    socket.on('conversation:join', async ({ conversationId }) => {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });
      if (conversation) socket.join(conversationId);
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: null,
      });

      io.emit('user:offline', { userId, lastSeen: new Date() });
    });
  });
};

export { registerSocketHandlers, onlineUsers };
