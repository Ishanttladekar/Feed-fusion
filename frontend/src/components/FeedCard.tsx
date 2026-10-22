import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share,
  ExternalLink,
  CheckCircle,
  Eye,
  Camera,
} from 'lucide-react';
import { FeedPost, SocialPlatform } from '../types';
import { feedService } from '../services/feedService';

interface FeedCardProps {
  post: FeedPost;
  onBookmarkToggled?: (postId: string, isBookmarked: boolean) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post, onBookmarkToggled }) => {
  const [isLiked, setIsLiked] = useState<boolean>(post.isLiked || false);
  const [likesCount, setLikesCount] = useState<number>(post.metrics.likes);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(post.isBookmarked || false);
  const [likeAnimating, setLikeAnimating] = useState<boolean>(false);

  const handleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 300);

    try {
      await feedService.toggleLike(post.id, post.platform);
    } catch (err) {
      // Revert if error
      setIsLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleBookmark = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    if (onBookmarkToggled) {
      onBookmarkToggled(post.id, nextState);
    }

    try {
      await feedService.toggleBookmark(post);
    } catch (err) {
      setIsBookmarked(!nextState);
      if (onBookmarkToggled) {
        onBookmarkToggled(post.id, !nextState);
      }
    }
  };

  // Format relative timestamp
  const formatTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  // Platform styling badge and icon
  const renderPlatformBadge = (platform: SocialPlatform) => {
    switch (platform) {
      case 'twitter':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-900 border border-neutral-700 text-white">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X (Twitter)</span>
          </span>
        );
      case 'instagram':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold instagram-gradient text-white shadow-sm">
            <Camera className="w-3 h-3" />
            <span>Instagram</span>
          </span>
        );
      case 'facebook':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1877F2] text-white shadow-sm">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </span>
        );
    }
  };

  return (
    <article className="glass-card rounded-2xl p-5 border border-slate-800 transition-all hover:border-slate-700/80 hover:shadow-xl hover:shadow-black/20 flex flex-col gap-4">
      {/* Header: Platform Badge, Author, Time */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-11 h-11 rounded-full object-cover border-2 border-slate-800 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-slate-100 hover:text-brand-400 transition cursor-pointer">
                {post.author.name}
              </span>
              {post.author.verified && (
                <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>@{post.author.username}</span>
              <span>•</span>
              <span>{formatTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {renderPlatformBadge(post.platform)}
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on official platform"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Post Text Content */}
      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
        {post.content}
      </p>

      {/* Hashtag chips */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-brand-400 hover:bg-brand-500/10 cursor-pointer transition"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Media Attachments */}
      {post.media && post.media.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900/60 max-h-[460px] flex items-center justify-center">
          {post.media[0].type === 'video' ? (
            <video
              src={post.media[0].url}
              controls
              poster={post.media[0].thumbnail}
              className="w-full max-h-[450px] object-cover"
            />
          ) : (
            <img
              src={post.media[0].url}
              alt={post.media[0].alt || 'Post media attachment'}
              loading="lazy"
              className="w-full max-h-[450px] object-cover hover:scale-[1.01] transition-transform duration-300"
            />
          )}
        </div>
      )}

      {/* Interactions Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-slate-400 text-xs">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
            isLiked
              ? 'text-rose-400 bg-rose-500/10 font-medium'
              : 'hover:text-rose-400 hover:bg-rose-500/10'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isLiked ? 'fill-rose-500 text-rose-500' : ''
            } ${likeAnimating ? 'scale-125' : 'scale-100'}`}
          />
          <span>{likesCount.toLocaleString()}</span>
        </button>

        {/* Comments */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:text-blue-400 hover:bg-blue-500/10 transition cursor-pointer">
          <MessageCircle className="w-4 h-4" />
          <span>{post.metrics.comments.toLocaleString()}</span>
        </div>

        {/* Reposts / Shares */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:text-emerald-400 hover:bg-emerald-500/10 transition cursor-pointer">
          <Repeat2 className="w-4 h-4" />
          <span>{post.metrics.shares.toLocaleString()}</span>
        </div>

        {/* Views (Twitter) */}
        {post.metrics.views !== undefined && (
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
            <Eye className="w-3.5 h-3.5" />
            <span>{post.metrics.views.toLocaleString()}</span>
          </div>
        )}

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
            isBookmarked
              ? 'text-amber-400 bg-amber-500/10 font-semibold'
              : 'hover:text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          <Bookmark
            className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`}
          />
          <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </article>
  );
};
