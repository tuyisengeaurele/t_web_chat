import User from '../models/User.js';
import Conversation from '../models/Conversation.js';

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
          ],
        },
      ],
    })
      .select('username email avatar isOnline lastSeen')
      .limit(20);

    res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'username email avatar bio isOnline lastSeen'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    }).populate('participants', 'username email avatar isOnline lastSeen');

    const contacts = conversations.map((conv) => {
      const other = conv.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );
      return { conversationId: conv._id, user: other };
    });

    res.json({ contacts });
  } catch (err) {
    next(err);
  }
};
