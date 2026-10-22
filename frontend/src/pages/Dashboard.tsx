import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FeedPost, SocialPlatform } from '../types';
import { feedService } from '../services/feedService';
import { useAuth } from '../context/AuthContext';
import { FeedCard } from '../components/FeedCard';
import { PlatformFilter } from '../components/PlatformFilter';
import { LivePostNotification } from '../components/LivePostNotification';
import {
  Sparkles,
  Flame,
  Clock,
  RefreshCw,
  SearchX,
  Share2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DashboardProps {
  searchQuery: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ searchQuery }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [needsConnection, setNeedsConnection] = useState<boolean>(false);

  const fetchFeed = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await feedService.getFeed({
        platform: platformFilter,
        query: searchQuery,
        sort: sortBy,
        mock: user?.preferences?.mockMode,
      });
      setPosts(data.posts);
      setNeedsConnection((data as any).needsConnection || false);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [platformFilter, sortBy, searchQuery, user?.preferences?.mockMode]);

  const handleLoadLivePosts = (newPosts: FeedPost[]) => {
    setPosts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const filteredNew = newPosts.filter((p) => !existingIds.has(p.id));
      return [...filteredNew, ...prev];
    });
  };

  const postCounts: Record<string, number> = {
    all: posts.length,
    twitter: posts.filter((p) => p.platform === 'twitter').length,
    instagram: posts.filter((p) => p.platform === 'instagram').length,
    facebook: posts.filter((p) => p.platform === 'facebook').length,
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto flex flex-col gap-5">
      {/* Live Stream Notification Pop-down */}
      <LivePostNotification onLoadPosts={handleLoadLivePosts} />

      {/* Real Mode Onboarding Notice if user has not connected personal accounts yet */}
      {!user?.preferences?.mockMode && needsConnection && (
        <div className="glass-panel rounded-2xl p-6 border border-brand-500/30 flex flex-col gap-3 shadow-xl shadow-brand-500/10">
          <div className="flex items-center gap-2 text-brand-400">
            <Share2 className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-100">Connect Your Real Accounts to See Following Feeds</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            You are in <strong>Real API Mode</strong>. To load posts from accounts, creators, and pages you follow on X, Instagram, and Facebook, connect your accounts via official OAuth.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Link
              to="/accounts"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-md shadow-brand-500/20"
            >
              <span>Connect Accounts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Control Bar: Platform Filters & Sorting */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <PlatformFilter
            currentFilter={platformFilter}
            onSelect={setPlatformFilter}
            postCounts={postCounts}
          />

          <button
            onClick={() => fetchFeed(true)}
            disabled={refreshing || loading}
            title="Refresh feed"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>

        {/* Sort Chips */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-medium">
            Showing <strong className="text-slate-200">{posts.length}</strong> posts
          </span>

          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setSortBy('latest')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                sortBy === 'latest'
                  ? 'bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30'
                  : 'hover:text-slate-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Latest</span>
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                sortBy === 'popular'
                  ? 'bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30'
                  : 'hover:text-slate-200'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Popular</span>
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                sortBy === 'trending'
                  ? 'bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30'
                  : 'hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Trending</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feed Cards Stream */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="glass-card rounded-2xl p-5 border border-slate-800 animate-pulse flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-800" />
                <div className="flex flex-col gap-2">
                  <div className="w-32 h-3.5 bg-slate-800 rounded" />
                  <div className="w-20 h-2.5 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="w-full h-16 bg-slate-800/60 rounded-xl" />
              <div className="w-full h-48 bg-slate-800/40 rounded-xl" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 border border-slate-800 text-center flex flex-col items-center gap-3 my-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No posts in feed</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {searchQuery
              ? `No posts matched "${searchQuery}". Try different keywords.`
              : 'Connect your accounts or add specific creators you follow to see their latest updates here.'}
          </p>
          <Link
            to="/accounts"
            className="mt-2 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition"
          >
            Manage Connected Accounts
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
