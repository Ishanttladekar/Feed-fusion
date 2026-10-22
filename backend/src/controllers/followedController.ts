import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { FollowedAccount } from '../models/FollowedAccount';
import { SocialPlatform } from '../types';

export async function getFollowedAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const platform = req.query.platform as SocialPlatform | undefined;

    const filter: any = { userId };
    if (platform) filter.platform = platform;

    const list = await FollowedAccount.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      followed: list,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function addFollowedAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    let { platform, handle, displayName } = req.body;

    if (!platform || !handle) {
      res.status(400).json({ success: false, error: 'Platform and handle are required.' });
      return;
    }

    handle = handle.replace(/^@/, '').trim();

    const existing = await FollowedAccount.findOne({ userId, platform, handle });
    if (existing) {
      res.status(400).json({ success: false, error: `You are already following @${handle} on ${platform}.` });
      return;
    }

    const created = await FollowedAccount.create({
      userId,
      platform,
      handle,
      displayName: displayName || `@${handle}`,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${handle}`,
    });

    res.status(201).json({
      success: true,
      message: `Added @${handle} to followed ${platform} accounts`,
      followed: created,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function removeFollowedAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await FollowedAccount.findOneAndDelete({ _id: id, userId });

    res.json({
      success: true,
      message: 'Removed from followed accounts',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
