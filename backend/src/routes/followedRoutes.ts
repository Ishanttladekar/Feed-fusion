import { Router } from 'express';
import {
  getFollowedAccounts,
  addFollowedAccount,
  removeFollowedAccount,
} from '../controllers/followedController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getFollowedAccounts);
router.post('/', addFollowedAccount);
router.delete('/:id', removeFollowedAccount);

export default router;
