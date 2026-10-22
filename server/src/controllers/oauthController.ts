import { Request, Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth';
import { SocialPlatform } from '../types';
import { getAdapter } from '../services/adapters';
import { SocialAccount } from '../models/SocialAccount';
import { config } from '../config/env';

// Temporary state cache (in-memory with 10-minute expiration)
const oauthStateCache = new Map<string, { userId: string; platform: SocialPlatform; codeVerifier?: string; expiresAt: number }>();

export async function getAuthUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const platform = req.params.platform as SocialPlatform;
    const isMock = req.query.mock === 'true';

    const state = crypto.randomBytes(24).toString('hex');
    let codeVerifier: string | undefined;
    let codeChallenge: string | undefined;

    if (platform === 'twitter') {
      // PKCE for Twitter
      codeVerifier = crypto.randomBytes(32).toString('base64url');
      codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    }

    // Cache state
    oauthStateCache.set(state, {
      userId,
      platform,
      codeVerifier,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    const adapter = getAdapter(platform, isMock);
    const authUrl = adapter.getAuthUrl(state, codeChallenge);

    res.json({
      success: true,
      authUrl,
      state,
      isMock,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function handleOAuthCallback(req: Request, res: Response): Promise<void> {
  const platform = req.params.platform as SocialPlatform;
  const { code, state, error, error_description } = req.query as {
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
  };

  const redirectError = (msg: string) => {
    return res.redirect(`${config.frontendUrl}/accounts?error=${encodeURIComponent(msg)}&platform=${platform}`);
  };

  if (error) {
    return redirectError(error_description || error);
  }

  if (!code || !state) {
    return redirectError('Missing authorization code or state parameter.');
  }

  const cached = oauthStateCache.get(state);
  if (!cached || cached.expiresAt < Date.now()) {
    return redirectError('State parameter expired or invalid. Please retry.');
  }

  oauthStateCache.delete(state);

  try {
    const adapter = getAdapter(platform, false);
    const oauthData = await adapter.handleCallback(code, cached.codeVerifier);

    await SocialAccount.findOneAndUpdate(
      { userId: cached.userId, platform },
      {
        platformUserId: oauthData.platformUserId,
        username: oauthData.username,
        displayName: oauthData.displayName,
        avatarUrl: oauthData.avatarUrl,
        accessToken: oauthData.accessToken,
        refreshToken: oauthData.refreshToken,
        tokenExpiresAt: oauthData.expiresIn ? new Date(Date.now() + oauthData.expiresIn * 1000) : undefined,
        isMock: false,
        isActive: true,
        connectedAt: new Date(),
        rawProfile: oauthData.rawProfile,
      },
      { upsert: true, new: true }
    );

    res.redirect(`${config.frontendUrl}/accounts?success=connected&platform=${platform}`);
  } catch (err: any) {
    console.error(`[OAuth Callback Error] ${platform}:`, err);
    redirectError(err.message || 'OAuth authentication failed.');
  }
}
