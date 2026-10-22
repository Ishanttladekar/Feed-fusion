import api from './api';
import { PlatformConnectionStatus, SocialPlatform } from '../types';

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
};
