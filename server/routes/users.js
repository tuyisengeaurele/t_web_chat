import { Router } from 'express';
import { searchUsers, getUserById, getContacts } from '../controllers/userController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/search', searchUsers);
router.get('/contacts', getContacts);
router.get('/:id', getUserById);

export default router;
