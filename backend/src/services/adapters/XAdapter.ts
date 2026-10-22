import axios from 'axios';
import { SocialAdapter, OAuthResult } from './BaseAdapter';
import { FeedPost, SocialPlatform } from '../../types';
import { config } from '../../config/env';

export class XAdapter implements SocialAdapter {
  platform: SocialPlatform = 'twitter';

  getAuthUrl(state: string, codeChallenge?: string): string {
    if (!config.twitter.clientId) {
      throw new Error('Twitter Client ID is not configured. Please add TWITTER_CLIENT_ID in settings or backend/.env.');
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.twitter.clientId,
      redirect_uri: config.twitter.redirectUri,
      // Required scopes for reading following timeline, user profile, and offline token refresh
      scope: 'tweet.read users.read offline.access follows.read like.read',
      state,
      code_challenge: codeChallenge || 'challenge',
      code_challenge_method: 'S256',
    });

    return `${config.twitter.authorizeUrl}?${params.toString()}`;
  }

  async handleCallback(code: string, codeVerifier?: string): Promise<OAuthResult> {
    if (!config.twitter.clientId || !config.twitter.clientSecret) {
      throw new Error('Twitter credentials (TWITTER_CLIENT_ID / TWITTER_CLIENT_SECRET) are missing.');
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
    const userResponse = await axios.get(
      `${config.twitter.apiBase}/users/me?user.fields=profile_image_url,verified`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

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

  /**
   * Fetches the reverse chronological home timeline (tweets from accounts the user follows)
   */
  async fetchUserPosts(accessToken: string, limit = 20): Promise<FeedPost[]> {
    try {
      // 1. Get authenticated user ID
      const userRes = await axios.get(`${config.twitter.apiBase}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userId = userRes.data.data.id;

      // 2. Fetch reverse chronological timeline (Tweets from people the user follows)
      let tweetsRes: any;
      try {
        tweetsRes = await axios.get(
          `${config.twitter.apiBase}/users/${userId}/timelines/reverse_chronological?max_results=${Math.min(
            Math.max(limit, 5),
            50
          )}&tweet.fields=created_at,public_metrics,entities,attachments,author_id&expansions=attachments.media_keys,author_id&media.fields=url,preview_image_url,type&user.fields=name,username,profile_image_url,verified`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      } catch (timelineErr: any) {
        console.warn(
          '[XAdapter] Reverse chronological timeline unavailable, falling back to user timeline:',
          timelineErr.response?.data?.title || timelineErr.message
        );
        // Fallback to user timeline if app permissions restrict reverse_chronological
        tweetsRes = await axios.get(
          `${config.twitter.apiBase}/users/${userId}/tweets?max_results=${Math.min(
            Math.max(limit, 5),
            50
          )}&tweet.fields=created_at,public_metrics,entities,attachments,author_id&expansions=attachments.media_keys,author_id&media.fields=url,preview_image_url,type&user.fields=name,username,profile_image_url,verified`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      }

      const tweets = tweetsRes.data?.data || [];
      const mediaMap: Record<string, any> = {};
      const usersMap: Record<string, any> = {};

      if (tweetsRes.data?.includes?.media) {
        tweetsRes.data.includes.media.forEach((m: any) => {
          mediaMap[m.media_key] = m;
        });
      }

      if (tweetsRes.data?.includes?.users) {
        tweetsRes.data.includes.users.forEach((u: any) => {
          usersMap[u.id] = u;
        });
      }

      return tweets.map((t: any): FeedPost => {
        // Author can be any followed account
        const author = usersMap[t.author_id] || {
          name: 'Twitter User',
          username: 'user',
          profile_image_url: '',
          verified: false,
        };

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
            name: author.name,
            username: author.username,
            avatar: author.profile_image_url || '',
            verified: author.verified || false,
            profileUrl: `https://twitter.com/${author.username}`,
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
          permalink: `https://twitter.com/${author.username}/status/${t.id}`,
          tags: (t.entities?.hashtags || []).map((h: any) => h.tag),
        };
      });
    } catch (error: any) {
      console.error('[XAdapter] Error fetching followed timeline:', error.response?.data || error.message);
      throw new Error(`X API Error: ${error.response?.data?.detail || error.message}`);
    }
  }
}
