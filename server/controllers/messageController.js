import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const userId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    }).populate('participants', 'username email avatar isOnline lastSeen');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, recipientId],
      });
      await conversation.populate('participants', 'username email avatar isOnline lastSeen');
    }

    res.json({ conversation });
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'username email avatar isOnline lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [messages, total] = await Promise.all([
      Message.find({ conversationId })
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversationId }),
    ]);

    res.json({
      messages: messages.reverse(),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text' } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messageData = {
      conversationId,
      sender: req.user._id,
      content,
      type,
    };

    if (req.file) {
      messageData.type = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
      messageData.media = {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    const message = await Message.create(messageData);
    await message.populate('sender', 'username avatar');

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};

export const markAsSeen = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

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

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
