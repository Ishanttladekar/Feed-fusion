import React from 'react';
import { Layers, Camera } from 'lucide-react';
import { SocialPlatform } from '../types';

interface PlatformFilterProps {
  currentFilter: string;
  onSelect: (filter: string) => void;
  postCounts?: Record<string, number>;
}

export const PlatformFilter: React.FC<PlatformFilterProps> = ({
  currentFilter,
  onSelect,
  postCounts = {},
}) => {
  const filters: Array<{ id: string; label: string; icon?: React.ReactNode }> = [
    {
      id: 'all',
      label: 'All Feeds',
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'twitter',
      label: 'X (Twitter)',
      icon: (
        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: <Camera className="w-3.5 h-3.5" />,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {filters.map((f) => {
        const isActive = currentFilter === f.id;
        const count = postCounts[f.id];

        return (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              isActive
                ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-slate-800'
            }`}
          >
            {f.icon}
            <span>{f.label}</span>
            {count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
