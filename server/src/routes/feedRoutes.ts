import { Router } from 'express';
import {
  getFeed,
  simulateNewPost,
  toggleBookmark,
  getBookmarks,
  toggleLike,
} from '../controllers/feedController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getFeed);
router.post('/simulate', simulateNewPost);
router.post('/bookmark', toggleBookmark);
router.get('/bookmarks', getBookmarks);
router.post('/like', toggleLike);

export default router;
