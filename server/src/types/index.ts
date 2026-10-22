export type SocialPlatform = 'twitter' | 'instagram' | 'facebook';

export interface PostAuthor {
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  profileUrl?: string;
}

export interface PostMedia {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
  aspectRatio?: string;
}

export interface PostMetrics {
  likes: number;
  comments: number;
  shares: number; // or retweets
  views?: number;
}

export interface FeedPost {
  id: string;
  platform: SocialPlatform;
  author: PostAuthor;
  content: string;
  media?: PostMedia[];
  metrics: PostMetrics;
  createdAt: string;
  permalink: string;
  tags?: string[];
  isBookmarked?: boolean;
  isLiked?: boolean;
}

export interface UserPreferences {
  mockMode: boolean;
  defaultPlatformFilter: string;
  autoRefreshInterval: number; // seconds, 0 = disabled
}

export interface PlatformConnectionStatus {
  platform: SocialPlatform;
  connected: boolean;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  connectedAt?: Date;
  isMock?: boolean;
  expiresAt?: Date;
}
