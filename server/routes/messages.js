import { Router } from 'express';
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsSeen,
} from '../controllers/messageController.js';
import protect from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/conversations/:recipientId/start', getOrCreateConversation);
router.get('/:conversationId', getMessages);
router.post('/:conversationId', upload.single('media'), sendMessage);
router.patch('/:conversationId/seen', markAsSeen);

export default router;
