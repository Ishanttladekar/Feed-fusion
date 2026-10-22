import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { SocialAccount } from '../models/SocialAccount';
import { Bookmark } from '../models/Bookmark';
import { INITIAL_MOCK_POSTS } from '../services/mockData';

export async function getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const [accounts, totalBookmarks] = await Promise.all([
      SocialAccount.find({ userId }),
      Bookmark.countDocuments({ userId }),
    ]);

    // Aggregate statistics from current posts
    const posts = INITIAL_MOCK_POSTS;
    const platformBreakdown: Record<string, { posts: number; likes: number; shares: number; comments: number }> = {
      twitter: { posts: 0, likes: 0, shares: 0, comments: 0 },
      instagram: { posts: 0, likes: 0, shares: 0, comments: 0 },
      facebook: { posts: 0, likes: 0, shares: 0, comments: 0 },
    };

    let totalLikes = 0;
    let totalShares = 0;
    let totalComments = 0;

    posts.forEach((p) => {
      if (platformBreakdown[p.platform]) {
        platformBreakdown[p.platform].posts += 1;
        platformBreakdown[p.platform].likes += p.metrics.likes;
        platformBreakdown[p.platform].shares += p.metrics.shares;
        platformBreakdown[p.platform].comments += p.metrics.comments;

        totalLikes += p.metrics.likes;
        totalShares += p.metrics.shares;
        totalComments += p.metrics.comments;
      }
    });

    const totalEngagement = totalLikes + totalShares + totalComments;
    const avgEngagementPerPost = posts.length > 0 ? Math.round(totalEngagement / posts.length) : 0;

    res.json({
      success: true,
      summary: {
        totalPosts: posts.length,
        totalLikes,
        totalShares,
        totalComments,
        totalEngagement,
        avgEngagementPerPost,
        totalBookmarks,
        connectedPlatformsCount: accounts.length,
      },
      platforms: platformBreakdown,
      connectedAccounts: accounts.map((a) => ({
        platform: a.platform,
        username: a.username,
        displayName: a.displayName,
        isMock: a.isMock,
        connectedAt: a.connectedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
