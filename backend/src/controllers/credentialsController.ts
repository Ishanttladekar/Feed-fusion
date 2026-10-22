import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthenticatedRequest } from '../middleware/auth';
import { config } from '../config/env';

export async function getCredentialsStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    res.json({
      success: true,
      credentials: {
        twitter: {
          configured: Boolean(config.twitter.clientId && config.twitter.clientSecret),
          clientId: config.twitter.clientId ? `${config.twitter.clientId.substring(0, 4)}...` : '',
          redirectUri: config.twitter.redirectUri,
        },
        instagram: {
          configured: Boolean(config.instagram.clientId && config.instagram.clientSecret),
          clientId: config.instagram.clientId ? `${config.instagram.clientId.substring(0, 4)}...` : '',
          redirectUri: config.instagram.redirectUri,
        },
        facebook: {
          configured: Boolean(config.facebook.appId && config.facebook.appSecret),
          appId: config.facebook.appId ? `${config.facebook.appId.substring(0, 4)}...` : '',
          redirectUri: config.facebook.redirectUri,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateCredentials(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      twitterClientId,
      twitterClientSecret,
      instagramClientId,
      instagramClientSecret,
      facebookAppId,
      facebookAppSecret,
    } = req.body;

    const envPath = path.resolve(__dirname, '../../.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const updates: Record<string, string> = {};

    if (twitterClientId !== undefined) {
      updates['TWITTER_CLIENT_ID'] = twitterClientId.trim();
      config.twitter.clientId = twitterClientId.trim();
    }
    if (twitterClientSecret !== undefined) {
      updates['TWITTER_CLIENT_SECRET'] = twitterClientSecret.trim();
      config.twitter.clientSecret = twitterClientSecret.trim();
    }
    if (instagramClientId !== undefined) {
      updates['INSTAGRAM_CLIENT_ID'] = instagramClientId.trim();
      config.instagram.clientId = instagramClientId.trim();
    }
    if (instagramClientSecret !== undefined) {
      updates['INSTAGRAM_CLIENT_SECRET'] = instagramClientSecret.trim();
      config.instagram.clientSecret = instagramClientSecret.trim();
    }
    if (facebookAppId !== undefined) {
      updates['FACEBOOK_APP_ID'] = facebookAppId.trim();
      config.facebook.appId = facebookAppId.trim();
    }
    if (facebookAppSecret !== undefined) {
      updates['FACEBOOK_APP_SECRET'] = facebookAppSecret.trim();
      config.facebook.appSecret = facebookAppSecret.trim();
    }

    // Update lines in .env or append
    let lines = envContent.split(/\r?\n/);
    for (const [key, val] of Object.entries(updates)) {
      const idx = lines.findIndex((line) => line.startsWith(`${key}=`));
      if (idx !== -1) {
        lines[idx] = `${key}=${val}`;
      } else {
        lines.push(`${key}=${val}`);
      }
    }

    fs.writeFileSync(envPath, lines.join('\n'), 'utf8');

    res.json({
      success: true,
      message: 'API credentials saved successfully and applied to active server session.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
