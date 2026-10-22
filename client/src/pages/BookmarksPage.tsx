import React, { useState, useEffect } from 'react';
import { Bookmark, SearchX, RefreshCw } from 'lucide-react';
import { FeedPost } from '../types';
import { feedService } from '../services/feedService';
import { FeedCard } from '../components/FeedCard';

export const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await feedService.getBookmarks();
      setBookmarks(data);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleBookmarkToggled = (postId: string, isBookmarked: boolean) => {
    if (!isBookmarked) {
      setBookmarks((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Saved Bookmarks</h1>
          <p className="text-sm text-slate-400">
            Posts you've saved across X, Instagram, and Facebook for later reference.
          </p>
        </div>
        <button
          onClick={loadBookmarks}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Refresh bookmarks"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="glass-card rounded-2xl p-5 border border-slate-800 animate-pulse flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800" />
                <div className="w-32 h-3.5 bg-slate-800 rounded" />
              </div>
              <div className="w-full h-20 bg-slate-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 border border-slate-800 text-center flex flex-col items-center gap-3 my-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No bookmarks saved yet</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Click the save bookmark ribbon on any post in your unified feed to store it here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookmarks.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              onBookmarkToggled={handleBookmarkToggled}
            />
          ))}
        </div>
      )}
    </div>
  );
};
