import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { SocialAccount } from '../models/SocialAccount';
import { Bookmark } from '../models/Bookmark';
import { PostLike } from '../models/PostLike';
import { FeedPost, SocialPlatform } from '../types';
import { getAdapter } from '../services/adapters';
import { INITIAL_MOCK_POSTS, generateSimulatedPost } from '../services/mockData';
import { socketService } from '../services/socketService';

export async function getFeed(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const user = req.user!;
    const platformFilter = (req.query.platform as string) || 'all';
    const searchQuery = ((req.query.query as string) || '').toLowerCase().trim();
    const sortBy = (req.query.sort as string) || 'latest';
    const forceMock = req.query.mock === 'true' || user.preferences?.mockMode;

    // Find user's active connected accounts
    const accounts = await SocialAccount.find({ userId, isActive: true });

    let aggregatedPosts: FeedPost[] = [];

    if (forceMock || accounts.length === 0) {
      // In Mock mode or if no accounts connected yet, return rich mock data
      aggregatedPosts = [...INITIAL_MOCK_POSTS];
    } else {
      // Fetch from connected accounts
      const fetchPromises = accounts.map(async (acc) => {
        try {
          const adapter = getAdapter(acc.platform, acc.isMock);
          const decryptedToken = acc.getDecryptedAccessToken();
          return await adapter.fetchUserPosts(decryptedToken, 15);
        } catch (err: any) {
          console.warn(`[Feed Aggregator] Error fetching for ${acc.platform}:`, err.message);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      aggregatedPosts = results.flat();

      // If user has connected accounts but no posts found yet, supplement with mock items
      if (aggregatedPosts.length === 0) {
        aggregatedPosts = [...INITIAL_MOCK_POSTS];
      }
    }

    // Filter by platform
    if (platformFilter !== 'all') {
      aggregatedPosts = aggregatedPosts.filter((post) => post.platform === platformFilter);
    }

    // Filter by search query
    if (searchQuery) {
      aggregatedPosts = aggregatedPosts.filter((post) => {
        const inContent = post.content.toLowerCase().includes(searchQuery);
        const inAuthor =
          post.author.name.toLowerCase().includes(searchQuery) ||
          post.author.username.toLowerCase().includes(searchQuery);
        const inTags = (post.tags || []).some((t) => t.toLowerCase().includes(searchQuery));
        return inContent || inAuthor || inTags;
      });
    }

    // Retrieve user bookmarks & likes to annotate posts
    const [bookmarks, likes] = await Promise.all([
      Bookmark.find({ userId }).select('postId'),
      PostLike.find({ userId }).select('postId'),
    ]);

    const bookmarkSet = new Set(bookmarks.map((b) => b.postId));
    const likeSet = new Set(likes.map((l) => l.postId));

    aggregatedPosts = aggregatedPosts.map((post) => ({
      ...post,
      isBookmarked: bookmarkSet.has(post.id),
      isLiked: likeSet.has(post.id),
    }));

    // Sorting
    if (sortBy === 'popular') {
      aggregatedPosts.sort((a, b) => {
        const scoreA = a.metrics.likes + a.metrics.shares * 2 + a.metrics.comments * 1.5;
        const scoreB = b.metrics.likes + b.metrics.shares * 2 + b.metrics.comments * 1.5;
        return scoreB - scoreA;
      });
    } else if (sortBy === 'trending') {
      aggregatedPosts.sort((a, b) => {
        const hoursAgoA = Math.max(0.1, (Date.now() - new Date(a.createdAt).getTime()) / 3600000);
        const hoursAgoB = Math.max(0.1, (Date.now() - new Date(b.createdAt).getTime()) / 3600000);
        const velocityA = (a.metrics.likes + a.metrics.shares * 3) / hoursAgoA;
        const velocityB = (b.metrics.likes + b.metrics.shares * 3) / hoursAgoB;
        return velocityB - velocityA;
      });
    } else {
      // Default: latest
      aggregatedPosts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    res.json({
      success: true,
      total: aggregatedPosts.length,
      platformFilter,
      sortBy,
      posts: aggregatedPosts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function simulateNewPost(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const platform = req.body?.platform as SocialPlatform | undefined;
    const newPost = generateSimulatedPost(platform);

    // Broadcast through socket.io to all listening clients
    socketService.emitNewPost(newPost);

    res.json({
      success: true,
      message: 'Simulated post broadcasted via WebSocket',
      post: newPost,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function toggleBookmark(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { post } = req.body as { post: FeedPost };

    if (!post || !post.id) {
      res.status(400).json({ success: false, error: 'Post object with id is required.' });
      return;
    }

    const existing = await Bookmark.findOne({ userId, postId: post.id });

    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      res.json({
        success: true,
        bookmarked: false,
        message: 'Post removed from bookmarks',
      });
    } else {
      await Bookmark.create({
        userId,
        postId: post.id,
        platform: post.platform,
        post,
      });
      res.json({
        success: true,
        bookmarked: true,
        message: 'Post saved to bookmarks',
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getBookmarks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const bookmarks = await Bookmark.find({ userId }).sort({ createdAt: -1 });

    const posts = bookmarks.map((b) => ({
      ...b.post,
      isBookmarked: true,
    }));

    res.json({
      success: true,
      total: posts.length,
      posts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function toggleLike(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { postId, platform } = req.body;

    if (!postId || !platform) {
      res.status(400).json({ success: false, error: 'postId and platform are required.' });
      return;
    }

    const existing = await PostLike.findOne({ userId, postId });

    if (existing) {
      await PostLike.findByIdAndDelete(existing._id);
      res.json({ success: true, liked: false });
    } else {
      await PostLike.create({ userId, postId, platform });
      res.json({ success: true, liked: true });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
