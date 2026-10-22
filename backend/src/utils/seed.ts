import { User } from '../models/User';
import { SocialAccount } from '../models/SocialAccount';
import { Bookmark } from '../models/Bookmark';
import { INITIAL_MOCK_POSTS } from '../services/mockData';
import { MockAdapter } from '../services/adapters/MockAdapter';

export async function seedDemoData(): Promise<void> {
  try {
    const demoEmail = 'demo@feedfusion.io';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      console.log('[Seed] Creating demo user...');
      demoUser = await User.create({
        name: 'Alex Rivers',
        email: demoEmail,
        password: 'demo1234',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
        preferences: {
          mockMode: true,
          defaultPlatformFilter: 'all',
          autoRefreshInterval: 15,
          theme: 'dark',
        },
      });

      // Connect 3 mock accounts for this demo user
      const platforms = ['twitter', 'instagram', 'facebook'] as const;
      for (const platform of platforms) {
        const mockAdapter = new MockAdapter(platform);
        const mockData = await mockAdapter.handleCallback('seed_code');

        await SocialAccount.create({
          userId: demoUser._id,
          platform,
          platformUserId: mockData.platformUserId,
          username: mockData.username,
          displayName: mockData.displayName,
          avatarUrl: mockData.avatarUrl,
          accessToken: mockData.accessToken,
          isMock: true,
          isActive: true,
          connectedAt: new Date(),
          rawProfile: mockData.rawProfile,
        });
      }

      // Pre-bookmark first 2 posts
      if (INITIAL_MOCK_POSTS.length >= 2) {
        await Bookmark.create({
          userId: demoUser._id,
          postId: INITIAL_MOCK_POSTS[0].id,
          platform: INITIAL_MOCK_POSTS[0].platform,
          post: INITIAL_MOCK_POSTS[0],
        });
        await Bookmark.create({
          userId: demoUser._id,
          postId: INITIAL_MOCK_POSTS[1].id,
          platform: INITIAL_MOCK_POSTS[1].platform,
          post: INITIAL_MOCK_POSTS[1],
        });
      }

      console.log('[Seed] Demo user and accounts initialized successfully!');
    }
  } catch (error) {
    console.warn('[Seed] Notice during demo seed:', error);
  }
}
