import api from './api';
import { AnalyticsData } from '../types';

export const analyticsService = {
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await api.get<{ success: boolean } & AnalyticsData>('/analytics');
    return {
      summary: res.data.summary,
      platforms: res.data.platforms,
      connectedAccounts: res.data.connectedAccounts,
    };
  },
};
