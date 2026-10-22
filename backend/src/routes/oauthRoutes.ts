import { Router } from 'express';
import { getAuthUrl, handleOAuthCallback } from '../controllers/oauthController';
import { protect } from '../middleware/auth';

const router = Router();

// Endpoint for frontend to retrieve redirect URL (protected)
router.get('/:platform/url', protect, getAuthUrl);

// Public callback endpoint redirect from Twitter / Facebook / Instagram
router.get('/:platform/callback', handleOAuthCallback);

export default router;
