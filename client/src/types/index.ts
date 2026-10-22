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
  shares: number;
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
  autoRefreshInterval: number;
  theme: 'dark' | 'light';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  preferences: UserPreferences;
}

export interface PlatformConnectionStatus {
  platform: SocialPlatform;
  connected: boolean;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  connectedAt?: string;
  isMock?: boolean;
  expiresAt?: string;
}

export interface AnalyticsSummary {
  totalPosts: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalEngagement: number;
  avgEngagementPerPost: number;
  totalBookmarks: number;
  connectedPlatformsCount: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  platforms: Record<string, { posts: number; likes: number; shares: number; comments: number }>;
  connectedAccounts: Array<{
    platform: SocialPlatform;
    username: string;
    displayName: string;
    isMock: boolean;
    connectedAt: string;
  }>;
}
