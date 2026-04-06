import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.create({ username, email, password });
    const token = signToken(user._id);

    res.status(201).json({ token, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username, bio } = req.body;
    const update = {};

    if (username) update.username = username;
    if (bio !== undefined) update.bio = bio;
    if (req.file) update.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    });

    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};
