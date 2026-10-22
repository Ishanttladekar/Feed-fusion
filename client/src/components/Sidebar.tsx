import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Rss,
  Share2,
  Bookmark,
  BarChart3,
  Zap,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { feedService } from '../services/feedService';

interface SidebarProps {
  onPostSimulated?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onPostSimulated }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState(false);

  const handleSimulate = async () => {
    try {
      setIsSimulating(true);
      await feedService.simulatePost();
      setSimulationSuccess(true);
      if (onPostSimulated) onPostSimulated();
      setTimeout(() => setSimulationSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to trigger simulation:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const navItems = [
    { name: 'Unified Feeds', path: '/', icon: Rss },
    { name: 'Connected Accounts', path: '/accounts', icon: Share2 },
    { name: 'Saved Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Analytics & Insights', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col gap-6 shrink-0">
      {/* Navigation Links */}
      <nav className="glass-panel rounded-2xl p-3 flex flex-col gap-1 border border-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Real-time Simulator Action Card */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-brand-400">
          <Zap className="w-4 h-4 fill-brand-400" />
          <span className="text-xs font-bold tracking-wider uppercase">Live Stream Engine</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Simulate incoming real-time social events broadcasted through Socket.io directly to your feed.
        </p>
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className={`flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all shadow-md ${
            simulationSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 hover:border-slate-600 border border-slate-700'
          }`}
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />
              <span>Broadcasting...</span>
            </>
          ) : simulationSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Post Broadcasted!</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate New Post</span>
            </>
          )}
        </button>
      </div>

      {/* Security & Architecture Badge */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Enterprise Security</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal">
          Zero user passwords stored. Social accounts are authorized strictly via official OAuth 2.0 PKCE and Meta Graph tokens encrypted at rest with AES-256.
        </p>
      </div>
    </aside>
  );
};
