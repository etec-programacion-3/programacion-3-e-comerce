import express from 'express';
import { 
  getConversations, 
  createConversation, 
  getConversationById,
  deleteConversation 
} from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getConversations)
  .post(createConversation);

router.route('/:id')
  .get(getConversationById)
  .delete(deleteConversation);

export default router;
