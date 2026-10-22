import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  KeyRound,
  Trash2,
  Sparkles,
  Camera,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PlatformConnectionStatus, SocialPlatform } from '../types';
import { accountService } from '../services/accountService';
import { useAuth } from '../context/AuthContext';

export const AccountsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<PlatformConnectionStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showCredentialsGuide, setShowCredentialsGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check URL parameters for OAuth callbacks
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    const platformParam = searchParams.get('platform');

    if (errorParam) {
      setErrorMsg(`OAuth failed for ${platformParam || 'platform'}: ${errorParam}`);
    } else if (successParam === 'connected') {
      setSuccessMsg(`Successfully connected ${platformParam?.toUpperCase()} via official OAuth!`);
    }

    loadAccounts();
  }, [searchParams]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectMock = async (platform: SocialPlatform) => {
    try {
      setActionLoading(`mock-${platform}`);
      setErrorMsg(null);
      await accountService.connectMock(platform);
      setSuccessMsg(`Connected ${platform} in Mock Demo Mode.`);
      await loadAccounts();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConnectOAuth = async (platform: SocialPlatform) => {
    try {
      setActionLoading(`oauth-${platform}`);
      setErrorMsg(null);
      const authUrl = await accountService.getOAuthUrl(platform, false);
      // Redirect to platform's official OAuth authorization screen
      window.location.href = authUrl;
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error ||
          `Unable to initiate official OAuth for ${platform}. Check if API credentials are set in .env.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (platform: SocialPlatform) => {
    try {
      setActionLoading(`disconnect-${platform}`);
      setErrorMsg(null);
      await accountService.disconnect(platform);
      setSuccessMsg(`Disconnected ${platform}.`);
      await loadAccounts();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const platformsMeta = [
    {
      id: 'twitter' as SocialPlatform,
      name: 'X (formerly Twitter)',
      description: 'Stream tweets, replies, retweets, and impressions using official Twitter API v2 with OAuth 2.0 PKCE.',
      badgeColor: 'bg-black text-white border-neutral-700',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      authScopes: 'tweet.read users.read offline.access like.read',
      envKeys: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'],
    },
    {
      id: 'instagram' as SocialPlatform,
      name: 'Instagram',
      description: 'Aggregate photos, carousels, reels, and engagement metrics via Meta Instagram Graph API.',
      badgeColor: 'instagram-gradient text-white',
      icon: <Camera className="w-5 h-5" />,
      authScopes: 'user_profile, user_media',
      envKeys: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET'],
    },
    {
      id: 'facebook' as SocialPlatform,
      name: 'Facebook',
      description: 'Fetch status updates, media, and reactions using Meta Facebook Graph API v19.0.',
      badgeColor: 'bg-[#1877F2] text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      authScopes: 'email, public_profile, pages_show_list, pages_read_engagement',
      envKeys: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
    },
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Connected Accounts</h1>
        <p className="text-sm text-slate-400">
          Manage your official OAuth platform connections. We never ask for or store passwords.
        </p>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Platform Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platformsMeta.map((p) => {
          const acc = accounts.find((a) => a.platform === p.id);
          const isConnected = acc?.connected || false;

          return (
            <div
              key={p.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col gap-3">
                {/* Platform Badge & Status */}
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${p.badgeColor} shadow-md`}>{p.icon}</div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      isConnected
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isConnected ? (acc?.isMock ? 'Mock Connected' : 'OAuth Active') : 'Disconnected'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-100">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.description}</p>
                </div>

                {/* Connected Profile Details */}
                {isConnected && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 mt-1">
                    <img
                      src={acc?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80'}
                      alt={acc?.displayName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-200 truncate">{acc?.displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">@{acc?.username}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(p.id)}
                    disabled={actionLoading === `disconnect-${p.id}`}
                    className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleConnectOAuth(p.id)}
                      disabled={actionLoading === `oauth-${p.id}`}
                      className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 transition"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Connect via OAuth</span>
                    </button>
                    <button
                      onClick={() => handleConnectMock(p.id)}
                      disabled={actionLoading === `mock-${p.id}`}
                      className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Quick Connect (Mock)</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Developer OAuth Setup Accordion */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col gap-3">
        <button
          onClick={() => setShowCredentialsGuide(!showCredentialsGuide)}
          className="flex items-center justify-between text-left text-sm font-bold text-slate-200 hover:text-white transition"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-400" />
            <span>Developer Guide: How to configure real Meta & X OAuth Credentials</span>
          </div>
          {showCredentialsGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showCredentialsGuide && (
          <div className="text-xs text-slate-300 flex flex-col gap-4 pt-3 border-t border-slate-800 leading-relaxed">
            <p>
              To swap from Mock Mode to Live Real API Mode, obtain credentials from developer portals and paste them into <code className="bg-slate-900 px-1 py-0.5 rounded text-brand-300 font-mono">server/.env</code>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5">
                <span className="font-bold text-slate-200">1. X (Twitter) Developer Portal</span>
                <p className="text-slate-400 text-[11px]">
                  Register App at developer.x.com. Enable OAuth 2.0 PKCE. Set Redirect URI to:
                </p>
                <code className="text-[10px] bg-slate-950 p-1 rounded text-cyan-400 font-mono break-all">
                  http://localhost:5000/api/oauth/twitter/callback
                </code>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5">
                <span className="font-bold text-slate-200">2. Instagram Basic Display</span>
                <p className="text-slate-400 text-[11px]">
                  Create App at developers.facebook.com. Add Instagram Basic Display product. Set OAuth Redirect URI:
                </p>
                <code className="text-[10px] bg-slate-950 p-1 rounded text-cyan-400 font-mono break-all">
                  http://localhost:5000/api/oauth/instagram/callback
                </code>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5">
                <span className="font-bold text-slate-200">3. Facebook Login for Business</span>
                <p className="text-slate-400 text-[11px]">
                  Add Facebook Login in your Meta App Dashboard. Set Valid OAuth Redirect URIs:
                </p>
                <code className="text-[10px] bg-slate-950 p-1 rounded text-cyan-400 font-mono break-all">
                  http://localhost:5000/api/oauth/facebook/callback
                </code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
