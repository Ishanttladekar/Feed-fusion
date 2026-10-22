import React from 'react';
import { Zap, ArrowUp, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { FeedPost } from '../types';

interface LivePostNotificationProps {
  onLoadPosts: (posts: FeedPost[]) => void;
}

export const LivePostNotification: React.FC<LivePostNotificationProps> = ({ onLoadPosts }) => {
  const { incomingPosts, clearIncomingPosts, dismissIncomingPosts } = useSocket();

  if (incomingPosts.length === 0) return null;

  const count = incomingPosts.length;

  const handleClick = () => {
    const newPosts = clearIncomingPosts();
    onLoadPosts(newPosts);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="sticky top-20 z-30 flex justify-center mb-4 animate-slide-down">
      <div className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-4 py-2 rounded-full shadow-lg shadow-brand-500/30 border border-brand-400/30 text-xs font-semibold backdrop-blur-md">
        <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse fill-amber-300" />
        <button onClick={handleClick} className="flex items-center gap-1.5 hover:underline">
          <span>{count} new {count === 1 ? 'post' : 'posts'} arrived via live stream</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={dismissIncomingPosts}
          className="ml-2 p-0.5 rounded-full hover:bg-white/20 transition text-white/80"
          title="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
