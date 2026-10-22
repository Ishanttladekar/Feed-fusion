import axios from 'axios';
import { SocialAdapter, OAuthResult } from './BaseAdapter';
import { FeedPost, SocialPlatform } from '../../types';
import { config } from '../../config/env';

export class FacebookAdapter implements SocialAdapter {
  platform: SocialPlatform = 'facebook';

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.facebook.appId,
      redirect_uri: config.facebook.redirectUri,
      scope: 'email,public_profile,pages_show_list,pages_read_engagement',
      response_type: 'code',
      state,
    });

    return `${config.facebook.authorizeUrl}?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<OAuthResult> {
    if (!config.facebook.appId || !config.facebook.appSecret) {
      throw new Error('Facebook credentials are not configured.');
    }

    const tokenRes = await axios.get(config.facebook.tokenUrl, {
      params: {
        client_id: config.facebook.appId,
        client_secret: config.facebook.appSecret,
        redirect_uri: config.facebook.redirectUri,
        code,
      },
    });

    const shortToken = tokenRes.data.access_token;

    // Exchange for long-lived page/user token (60 days)
    let finalToken = shortToken;
    let expiresIn = 5184000;

    try {
      const longRes = await axios.get(`${config.facebook.apiBase}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: config.facebook.appId,
          client_secret: config.facebook.appSecret,
          fb_exchange_token: shortToken,
        },
      });
      if (longRes.data.access_token) {
        finalToken = longRes.data.access_token;
        expiresIn = longRes.data.expires_in || 5184000;
      }
    } catch (err) {
      console.warn('[FacebookAdapter] Long token exchange notice:', err);
    }

    // Get user profile
    const profileRes = await axios.get(
      `${config.facebook.apiBase}/me?fields=id,name,picture.width(200).height(200)&access_token=${finalToken}`
    );

    const profile = profileRes.data;

    return {
      accessToken: finalToken,
      expiresIn,
      platformUserId: profile.id,
      username: profile.name.toLowerCase().replace(/\s+/g, '.'),
      displayName: profile.name,
      avatarUrl: profile.picture?.data?.url || '',
      rawProfile: profile,
    };
  }

  async fetchUserPosts(accessToken: string, limit = 20): Promise<FeedPost[]> {
    try {
      // 1. Get profile for author details
      const profileRes = await axios.get(
        `${config.facebook.apiBase}/me?fields=id,name,picture.width(200).height(200)&access_token=${accessToken}`
      );
      const profile = profileRes.data;

      // 2. Fetch posts feed
      const feedRes = await axios.get(
        `${config.facebook.apiBase}/me/feed?fields=id,message,created_time,full_picture,permalink_url,shares,reactions.summary(total_count),comments.summary(total_count)&limit=${limit}&access_token=${accessToken}`
      );

      const items = feedRes.data.data || [];

      return items.map((item: any): FeedPost => {
        const tags = (item.message?.match(/#\w+/g) || []).map((t: string) => t.substring(1));

        return {
          id: `fb-${item.id}`,
          platform: 'facebook',
          author: {
            name: profile.name,
            username: profile.name.toLowerCase().replace(/\s+/g, '.'),
            avatar: profile.picture?.data?.url || '',
            verified: false,
            profileUrl: `https://facebook.com/${profile.id}`,
          },
          content: item.message || '',
          media: item.full_picture
            ? [
                {
                  type: 'image',
                  url: item.full_picture,
                  aspectRatio: '16/9',
                },
              ]
            : undefined,
          metrics: {
            likes: item.reactions?.summary?.total_count || 0,
            comments: item.comments?.summary?.total_count || 0,
            shares: item.shares?.count || 0,
          },
          createdAt: item.created_time || new Date().toISOString(),
          permalink: item.permalink_url || `https://facebook.com/${item.id}`,
          tags,
        };
      });
    } catch (error: any) {
      console.error('[FacebookAdapter] Error fetching posts:', error.response?.data || error.message);
      throw new Error(`Facebook API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}
