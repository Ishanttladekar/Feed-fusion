import api from './api';
import { PlatformConnectionStatus, SocialPlatform } from '../types';

export interface FollowedItem {
  _id: string;
  platform: SocialPlatform;
  handle: string;
  displayName: string;
  avatarUrl: string;
  createdAt: string;
}

export interface PlatformCredentialsInfo {
  configured: boolean;
  clientId?: string;
  appId?: string;
  redirectUri: string;
}

export const accountService = {
  async getAccounts(): Promise<PlatformConnectionStatus[]> {
    const res = await api.get<{ success: boolean; accounts: PlatformConnectionStatus[] }>('/accounts');
    return res.data.accounts;
  },

  async connectMock(platform: SocialPlatform): Promise<PlatformConnectionStatus> {
    const res = await api.post<{ success: boolean; account: PlatformConnectionStatus }>('/accounts/connect-mock', {
      platform,
    });
    return res.data.account;
  },

  async disconnect(platform: SocialPlatform): Promise<void> {
    await api.delete(`/accounts/${platform}`);
  },

  async getOAuthUrl(platform: SocialPlatform, mock = false): Promise<string> {
    const res = await api.get<{ success: boolean; authUrl: string }>(`/oauth/${platform}/url`, {
      params: { mock },
    });
    return res.data.authUrl;
  },

  async getCredentials(): Promise<Record<string, PlatformCredentialsInfo>> {
    const res = await api.get<{ success: boolean; credentials: Record<string, PlatformCredentialsInfo> }>('/credentials');
    return res.data.credentials;
  },

  async updateCredentials(data: {
    twitterClientId?: string;
    twitterClientSecret?: string;
    instagramClientId?: string;
    instagramClientSecret?: string;
    facebookAppId?: string;
    facebookAppSecret?: string;
  }): Promise<void> {
    await api.post('/credentials', data);
  },

  async getFollowedAccounts(platform?: SocialPlatform): Promise<FollowedItem[]> {
    const res = await api.get<{ success: boolean; followed: FollowedItem[] }>('/followed', {
      params: { platform },
    });
    return res.data.followed;
  },

  async addFollowedAccount(platform: SocialPlatform, handle: string, displayName?: string): Promise<FollowedItem> {
    const res = await api.post<{ success: boolean; followed: FollowedItem }>('/followed', {
      platform,
      handle,
      displayName,
    });
    return res.data.followed;
  },

  async removeFollowedAccount(id: string): Promise<void> {
    await api.delete(`/followed/${id}`);
  },
};
