import { Router } from 'express';
import { getCredentialsStatus, updateCredentials } from '../controllers/credentialsController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getCredentialsStatus);
router.post('/', updateCredentials);

export default router;
