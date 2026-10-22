import { Router } from 'express';
import { getAccounts, connectMockAccount, disconnectAccount } from '../controllers/accountController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getAccounts);
router.post('/connect-mock', connectMockAccount);
router.delete('/:platform', disconnectAccount);

export default router;
