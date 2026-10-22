import api from './api';
import { FeedPost, SocialPlatform } from '../types';

export interface FeedResponse {
  success: boolean;
  total: number;
  platformFilter: string;
  sortBy: string;
  posts: FeedPost[];
}

export const feedService = {
  async getFeed(params?: {
    platform?: string;
    query?: string;
    sort?: string;
    mock?: boolean;
  }): Promise<FeedResponse> {
    const res = await api.get<FeedResponse>('/feed', { params });
    return res.data;
  },

  async toggleLike(postId: string, platform: SocialPlatform): Promise<{ liked: boolean }> {
    const res = await api.post<{ success: boolean; liked: boolean }>('/feed/like', { postId, platform });
    return res.data;
  },

  async toggleBookmark(post: FeedPost): Promise<{ bookmarked: boolean }> {
    const res = await api.post<{ success: boolean; bookmarked: boolean }>('/feed/bookmark', { post });
    return res.data;
  },

  async getBookmarks(): Promise<FeedPost[]> {
    const res = await api.get<{ success: boolean; total: number; posts: FeedPost[] }>('/feed/bookmarks');
    return res.data.posts;
  },

  async simulatePost(platform?: SocialPlatform): Promise<FeedPost> {
    const res = await api.post<{ success: boolean; post: FeedPost }>('/feed/simulate', { platform });
    return res.data.post;
  },
};
