import axios from 'axios';
import { SocialAdapter, OAuthResult } from './BaseAdapter';
import { FeedPost, SocialPlatform } from '../../types';
import { config } from '../../config/env';

export class InstagramAdapter implements SocialAdapter {
  platform: SocialPlatform = 'instagram';

  getAuthUrl(state: string): string {
    if (!config.instagram.clientId) {
      throw new Error('Instagram Client ID is not configured. Please add INSTAGRAM_CLIENT_ID in settings or backend/.env.');
    }

    const params = new URLSearchParams({
      client_id: config.instagram.clientId,
      redirect_uri: config.instagram.redirectUri,
      scope: 'user_profile,user_media',
      response_type: 'code',
      state,
    });

    return `${config.instagram.authorizeUrl}?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<OAuthResult> {
    if (!config.instagram.clientId || !config.instagram.clientSecret) {
      throw new Error('Instagram credentials (INSTAGRAM_CLIENT_ID / INSTAGRAM_CLIENT_SECRET) are missing.');
    }

    const form = new URLSearchParams({
      client_id: config.instagram.clientId,
      client_secret: config.instagram.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: config.instagram.redirectUri,
      code,
    });

    const tokenRes = await axios.post(config.instagram.tokenUrl, form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const shortLivedToken = tokenRes.data.access_token;
    const userId = tokenRes.data.user_id;

    // Exchange for long-lived token (60 days validity)
    let finalToken = shortLivedToken;
    let expiresIn = 5184000;

    try {
      const exchangeRes = await axios.get(
        `${config.instagram.apiBase}/access_token?grant_type=ig_exchange_token&client_secret=${config.instagram.clientSecret}&access_token=${shortLivedToken}`
      );
      if (exchangeRes.data.access_token) {
        finalToken = exchangeRes.data.access_token;
        expiresIn = exchangeRes.data.expires_in || 5184000;
      }
    } catch (err) {
      console.warn('[InstagramAdapter] Notice during long-lived token exchange:', err);
    }

    // Get user profile details
    const profileRes = await axios.get(
      `${config.instagram.apiBase}/me?fields=id,username,account_type&access_token=${finalToken}`
    );

    const profile = profileRes.data;

    return {
      accessToken: finalToken,
      expiresIn,
      platformUserId: profile.id || userId,
      username: profile.username || 'instagram_user',
      displayName: profile.username || 'Instagram User',
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username || userId}`,
      rawProfile: profile,
    };
  }

  async fetchUserPosts(accessToken: string, limit = 20): Promise<FeedPost[]> {
    try {
      const res = await axios.get(
        `${config.instagram.apiBase}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username,like_count,comments_count&limit=${limit}&access_token=${accessToken}`
      );

      const items = res.data.data || [];

      return items.map((item: any): FeedPost => {
        const isVideo = item.media_type === 'VIDEO';
        const mediaUrl = isVideo ? item.thumbnail_url || item.media_url : item.media_url;
        const tags = (item.caption?.match(/#\w+/g) || []).map((t: string) => t.substring(1));

        return {
          id: `ig-${item.id}`,
          platform: 'instagram',
          author: {
            name: item.username,
            username: item.username,
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${item.username}`,
            verified: false,
            profileUrl: `https://instagram.com/${item.username}`,
          },
          content: item.caption || '',
          media: mediaUrl
            ? [
                {
                  type: isVideo ? 'video' : 'image',
                  url: mediaUrl,
                  thumbnail: item.thumbnail_url,
                  aspectRatio: '1/1',
                },
              ]
            : undefined,
          metrics: {
            likes: item.like_count || 0,
            comments: item.comments_count || 0,
            shares: 0,
          },
          createdAt: item.timestamp || new Date().toISOString(),
          permalink: item.permalink || `https://instagram.com/p/${item.id}`,
          tags,
        };
      });
    } catch (error: any) {
      console.error('[InstagramAdapter] Error fetching posts:', error.response?.data || error.message);
      throw new Error(`Instagram API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Fetch posts from any followed creator or business account using the Meta Business Discovery API
   */
  async fetchFollowedAccountPosts(accessToken: string, igUserId: string, targetUsername: string): Promise<FeedPost[]> {
    try {
      const fields = `business_discovery.username(${targetUsername}){id,name,username,profile_picture_url,media{id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count}}`;
      const res = await axios.get(
        `https://graph.facebook.com/v19.0/${igUserId}?fields=${encodeURIComponent(fields)}&access_token=${accessToken}`
      );

      const discovery = res.data?.business_discovery;
      if (!discovery || !discovery.media?.data) return [];

      return discovery.media.data.map((item: any): FeedPost => {
        const isVideo = item.media_type === 'VIDEO';
        return {
          id: `ig-${item.id}`,
          platform: 'instagram',
          author: {
            name: discovery.name || discovery.username,
            username: discovery.username,
            avatar: discovery.profile_picture_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${discovery.username}`,
            verified: true,
            profileUrl: `https://instagram.com/${discovery.username}`,
          },
          content: item.caption || '',
          media: item.media_url
            ? [{ type: isVideo ? 'video' : 'image', url: item.media_url, aspectRatio: '1/1' }]
            : undefined,
          metrics: {
            likes: item.like_count || 0,
            comments: item.comments_count || 0,
            shares: 0,
          },
          createdAt: item.timestamp || new Date().toISOString(),
          permalink: item.permalink || `https://instagram.com/p/${item.id}`,
          tags: (item.caption?.match(/#\w+/g) || []).map((t: string) => t.substring(1)),
        };
      });
    } catch (err: any) {
      console.warn(`[InstagramAdapter] Could not fetch followed creator @${targetUsername}:`, err.message);
      return [];
    }
  }
}
