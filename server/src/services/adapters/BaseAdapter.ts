import { FeedPost, SocialPlatform } from '../../types';

export interface OAuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  platformUserId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  rawProfile?: any;
}

export interface SocialAdapter {
  platform: SocialPlatform;
  getAuthUrl(state: string, codeVerifier?: string): string;
  handleCallback(code: string, codeVerifier?: string): Promise<OAuthResult>;
  fetchUserPosts(accessToken: string, limit?: number): Promise<FeedPost[]>;
}
