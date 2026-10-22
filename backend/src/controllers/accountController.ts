import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { SocialAccount } from '../models/SocialAccount';
import { SocialPlatform, PlatformConnectionStatus } from '../types';
import { MockAdapter } from '../services/adapters/MockAdapter';

const SUPPORTED_PLATFORMS: SocialPlatform[] = ['twitter', 'instagram', 'facebook'];

export async function getAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const connectedAccounts = await SocialAccount.find({ userId });

    const accountMap = new Map(connectedAccounts.map((acc) => [acc.platform, acc]));

    const statusList: PlatformConnectionStatus[] = SUPPORTED_PLATFORMS.map((platform) => {
      const existing = accountMap.get(platform);
      if (existing && existing.isActive) {
        return {
          platform,
          connected: true,
          username: existing.username,
          displayName: existing.displayName,
          avatarUrl: existing.avatarUrl,
          connectedAt: existing.connectedAt,
          isMock: existing.isMock,
          expiresAt: existing.tokenExpiresAt,
        };
      }
      return {
        platform,
        connected: false,
      };
    });

    res.json({
      success: true,
      accounts: statusList,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function connectMockAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { platform } = req.body as { platform: SocialPlatform };

    if (!SUPPORTED_PLATFORMS.includes(platform)) {
      res.status(400).json({ success: false, error: `Invalid platform: ${platform}` });
      return;
    }

    const mockAdapter = new MockAdapter(platform);
    const mockData = await mockAdapter.handleCallback('mock_code_123');

    const account = await SocialAccount.findOneAndUpdate(
      { userId, platform },
      {
        platformUserId: mockData.platformUserId,
        username: mockData.username,
        displayName: mockData.displayName,
        avatarUrl: mockData.avatarUrl,
        accessToken: mockData.accessToken,
        refreshToken: mockData.refreshToken,
        tokenExpiresAt: new Date(Date.now() + (mockData.expiresIn || 7200) * 1000),
        isMock: true,
        isActive: true,
        connectedAt: new Date(),
        rawProfile: mockData.rawProfile,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Connected ${platform} (Mock Mode) successfully`,
      account: {
        platform: account.platform,
        connected: true,
        username: account.username,
        displayName: account.displayName,
        avatarUrl: account.avatarUrl,
        isMock: true,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function disconnectAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { platform } = req.params as { platform: SocialPlatform };

    if (!SUPPORTED_PLATFORMS.includes(platform)) {
      res.status(400).json({ success: false, error: `Invalid platform: ${platform}` });
      return;
    }

    await SocialAccount.findOneAndDelete({ userId, platform });

    res.json({
      success: true,
      message: `Disconnected ${platform} successfully`,
      platform,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
