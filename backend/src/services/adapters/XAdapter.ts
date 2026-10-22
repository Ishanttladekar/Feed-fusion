import axios from 'axios';
import { SocialAdapter, OAuthResult } from './BaseAdapter';
import { FeedPost, SocialPlatform } from '../../types';
import { config } from '../../config/env';

export class XAdapter implements SocialAdapter {
  platform: SocialPlatform = 'twitter';

  getAuthUrl(state: string, codeChallenge?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.twitter.clientId,
      redirect_uri: config.twitter.redirectUri,
      scope: 'tweet.read users.read offline.access like.read',
      state,
      code_challenge: codeChallenge || 'challenge',
      code_challenge_method: 'S256',
    });

    return `${config.twitter.authorizeUrl}?${params.toString()}`;
  }

  async handleCallback(code: string, codeVerifier?: string): Promise<OAuthResult> {
    if (!config.twitter.clientId || !config.twitter.clientSecret) {
      throw new Error('Twitter credentials (TWITTER_CLIENT_ID / TWITTER_CLIENT_SECRET) are not configured.');
    }

    const authHeader = Buffer.from(
      `${config.twitter.clientId}:${config.twitter.clientSecret}`
    ).toString('base64');

    const bodyParams = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: config.twitter.clientId,
      redirect_uri: config.twitter.redirectUri,
      code_verifier: codeVerifier || 'challenge',
    });

    const tokenResponse = await axios.post(
      config.twitter.tokenUrl,
      bodyParams.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authHeader}`,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Fetch user profile from /2/users/me
    const userResponse = await axios.get(`${config.twitter.apiBase}/users/me?user.fields=profile_image_url,verified`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = userResponse.data.data;

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      platformUserId: userData.id,
      username: userData.username,
      displayName: userData.name,
      avatarUrl: userData.profile_image_url || '',
      rawProfile: userData,
    };
  }

  async fetchUserPosts(accessToken: string, limit = 20): Promise<FeedPost[]> {
    try {
      // 1. Get user profile
      const userRes = await axios.get(`${config.twitter.apiBase}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userId = userRes.data.data.id;
      const user = userRes.data.data;

      // 2. Get user tweets with attachments and public metrics
      const tweetsRes = await axios.get(
        `${config.twitter.apiBase}/users/${userId}/tweets?max_results=${Math.min(limit, 50)}&tweet.fields=created_at,public_metrics,entities,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url,type`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const tweets = tweetsRes.data.data || [];
      const mediaMap: Record<string, any> = {};

      if (tweetsRes.data.includes?.media) {
        tweetsRes.data.includes.media.forEach((m: any) => {
          mediaMap[m.media_key] = m;
        });
      }

      return tweets.map((t: any): FeedPost => {
        const mediaItems = (t.attachments?.media_keys || [])
          .map((key: string) => {
            const item = mediaMap[key];
            if (!item) return null;
            return {
              type: item.type === 'video' ? 'video' : 'image',
              url: item.url || item.preview_image_url,
              thumbnail: item.preview_image_url,
            };
          })
          .filter(Boolean);

        return {
          id: `x-${t.id}`,
          platform: 'twitter',
          author: {
            name: user.name,
            username: user.username,
            avatar: user.profile_image_url || '',
            verified: user.verified || false,
            profileUrl: `https://twitter.com/${user.username}`,
          },
          content: t.text,
          media: mediaItems.length > 0 ? mediaItems : undefined,
          metrics: {
            likes: t.public_metrics?.like_count || 0,
            comments: t.public_metrics?.reply_count || 0,
            shares: t.public_metrics?.retweet_count || 0,
            views: t.public_metrics?.impression_count || 0,
          },
          createdAt: t.created_at || new Date().toISOString(),
          permalink: `https://twitter.com/${user.username}/status/${t.id}`,
          tags: (t.entities?.hashtags || []).map((h: any) => h.tag),
        };
      });
    } catch (error: any) {
      console.error('[XAdapter] Error fetching posts:', error.response?.data || error.message);
      throw new Error(`X API Error: ${error.response?.data?.detail || error.message}`);
    }
  }
}
