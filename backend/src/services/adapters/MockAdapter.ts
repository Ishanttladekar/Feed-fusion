import { SocialPlatform, FeedPost } from '../../types';
import { SocialAdapter, OAuthResult } from './BaseAdapter';
import { INITIAL_MOCK_POSTS, generateSimulatedPost } from '../mockData';

export class MockAdapter implements SocialAdapter {
  platform: SocialPlatform;

  constructor(platform: SocialPlatform) {
    this.platform = platform;
  }

  getAuthUrl(state: string, _codeVerifier?: string): string {
    // Returns a mock authorization redirect URL
    return `/mock-auth?platform=${this.platform}&state=${encodeURIComponent(state)}`;
  }

  async handleCallback(code: string, _codeVerifier?: string): Promise<OAuthResult> {
    const mockAccounts: Record<SocialPlatform, OAuthResult> = {
      twitter: {
        accessToken: `mock_x_token_${Date.now()}`,
        refreshToken: `mock_x_refresh_${Date.now()}`,
        expiresIn: 7200,
        platformUserId: 'x-mock-user-101',
        username: 'alex_creator',
        displayName: 'Alex Rivers',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
        rawProfile: { followers_count: 14200, following_count: 420 },
      },
      instagram: {
        accessToken: `mock_ig_token_${Date.now()}`,
        expiresIn: 5184000, // 60 days
        platformUserId: 'ig-mock-user-202',
        username: 'alex.visuals',
        displayName: 'Alex Rivers 📸',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
        rawProfile: { media_count: 84, account_type: 'BUSINESS' },
      },
      facebook: {
        accessToken: `mock_fb_token_${Date.now()}`,
        expiresIn: 5184000,
        platformUserId: 'fb-mock-user-303',
        username: 'alexrivers.official',
        displayName: 'Alex Rivers',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
        rawProfile: { verified: true },
      },
    };

    return mockAccounts[this.platform];
  }

  async fetchUserPosts(_accessToken: string, limit = 20): Promise<FeedPost[]> {
    const platformPosts = INITIAL_MOCK_POSTS.filter((p) => p.platform === this.platform);
    return platformPosts.slice(0, limit);
  }
}
