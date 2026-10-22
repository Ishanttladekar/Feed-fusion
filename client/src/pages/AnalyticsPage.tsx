import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Heart,
  Repeat2,
  MessageCircle,
  TrendingUp,
  Layers,
  Sparkles,
  Camera,
  Share2,
} from 'lucide-react';
import { AnalyticsData, SocialPlatform } from '../types';
import { analyticsService } from '../services/analyticsService';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const result = await analyticsService.getAnalytics();
        setData(result);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex-1 max-w-4xl mx-auto flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-slate-800 rounded-xl w-60" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-850 rounded-2xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const { summary, platforms } = data;

  const statCards = [
    {
      title: 'Aggregated Posts',
      value: summary.totalPosts.toLocaleString(),
      icon: Layers,
      color: 'text-brand-400',
      bgColor: 'bg-brand-500/10',
    },
    {
      title: 'Total Likes & Reactions',
      value: summary.totalLikes.toLocaleString(),
      icon: Heart,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
    },
    {
      title: 'Total Shares & Reposts',
      value: summary.totalShares.toLocaleString(),
      icon: Repeat2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Avg Engagement / Post',
      value: summary.avgEngagementPerPost.toLocaleString(),
      icon: TrendingUp,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  const platformMeta: Record<string, { name: string; color: string; icon: React.ReactNode }> = {
    twitter: {
      name: 'X (Twitter)',
      color: 'bg-neutral-800',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    instagram: {
      name: 'Instagram',
      color: 'instagram-gradient',
      icon: <Camera className="w-3.5 h-3.5 text-white" />,
    },
    facebook: {
      name: 'Facebook',
      color: 'bg-[#1877F2]',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Analytics & Insights</h1>
        <p className="text-sm text-slate-400">
          Holistic engagement metrics aggregated across your social channels.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{c.title}</span>
                <div className={`p-2 rounded-xl ${c.bgColor} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-100 tracking-tight">{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* Platform Breakdown Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col gap-5">
        <h3 className="font-bold text-base text-slate-100">Post Volume & Distribution</h3>

        {/* Visual Multi-segment bar */}
        <div className="h-4 w-full rounded-full overflow-hidden bg-slate-900 flex">
          {Object.entries(platforms).map(([platformKey, stat]) => {
            const percentage = summary.totalPosts > 0 ? (stat.posts / summary.totalPosts) * 100 : 0;
            return (
              <div
                key={platformKey}
                style={{ width: `${percentage}%` }}
                title={`${platformMeta[platformKey]?.name}: ${Math.round(percentage)}%`}
                className={`h-full ${
                  platformKey === 'twitter'
                    ? 'bg-neutral-600'
                    : platformKey === 'instagram'
                    ? 'bg-rose-500'
                    : 'bg-blue-600'
                }`}
              />
            );
          })}
        </div>

        {/* Platform Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {Object.entries(platforms).map(([platformKey, stat]) => {
            const meta = platformMeta[platformKey];
            const percentage = summary.totalPosts > 0 ? Math.round((stat.posts / summary.totalPosts) * 100) : 0;

            return (
              <div
                key={platformKey}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${meta.color}`}>{meta.icon}</div>
                    <span className="font-bold text-sm text-slate-200">{meta.name}</span>
                  </div>
                  <span className="text-xs font-bold text-brand-400">{percentage}%</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800">
                  <div>
                    <p className="text-slate-400 text-[10px]">Posts</p>
                    <p className="font-bold text-slate-200">{stat.posts}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Likes</p>
                    <p className="font-bold text-slate-200">{stat.likes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Shares</p>
                    <p className="font-bold text-slate-200">{stat.shares.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
