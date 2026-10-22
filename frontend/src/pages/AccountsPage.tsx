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
  Settings,
  Plus,
  Users,
  Lock,
} from 'lucide-react';
import { PlatformConnectionStatus, SocialPlatform } from '../types';
import {
  accountService,
  FollowedItem,
  PlatformCredentialsInfo,
} from '../services/accountService';
import { useAuth } from '../context/AuthContext';

export const AccountsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<PlatformConnectionStatus[]>([]);
  const [credentials, setCredentials] = useState<Record<string, PlatformCredentialsInfo>>({});
  const [followedAccounts, setFollowedAccounts] = useState<FollowedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [savingKeys, setSavingKeys] = useState<boolean>(false);
  const [keysForm, setKeysForm] = useState({
    twitterClientId: '',
    twitterClientSecret: '',
    instagramClientId: '',
    instagramClientSecret: '',
    facebookAppId: '',
    facebookAppSecret: '',
  });

  // Follow handle form
  const [followPlatform, setFollowFollowPlatform] = useState<SocialPlatform>('twitter');
  const [followHandle, setFollowHandle] = useState<string>('');
  const [addingFollow, setAddingFollow] = useState<boolean>(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    const platformParam = searchParams.get('platform');

    if (errorParam) {
      setErrorMsg(`OAuth failed for ${platformParam || 'platform'}: ${errorParam}`);
    } else if (successParam === 'connected') {
      setSuccessMsg(`Successfully connected ${platformParam?.toUpperCase()} via official OAuth!`);
    }

    loadAll();
  }, [searchParams]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [accs, creds, followed] = await Promise.all([
        accountService.getAccounts(),
        accountService.getCredentials().catch(() => ({})),
        accountService.getFollowedAccounts().catch(() => []),
      ]);
      setAccounts(accs);
      setCredentials(creds);
      setFollowedAccounts(followed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectOAuth = async (platform: SocialPlatform) => {
    try {
      setActionLoading(`oauth-${platform}`);
      setErrorMsg(null);
      const authUrl = await accountService.getOAuthUrl(platform, false);
      window.location.href = authUrl;
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error ||
          `Cannot start official OAuth for ${platform}. Please click 'Configure API Keys' above and set your credentials.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleConnectMock = async (platform: SocialPlatform) => {
    try {
      setActionLoading(`mock-${platform}`);
      setErrorMsg(null);
      await accountService.connectMock(platform);
      setSuccessMsg(`Connected demo ${platform} account.`);
      await loadAll();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message);
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
      await loadAll();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingKeys(true);
      await accountService.updateCredentials(keysForm);
      setSuccessMsg('API Credentials successfully saved! You can now log into your accounts via OAuth.');
      setShowSettingsModal(false);
      await loadAll();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to save credentials.');
    } finally {
      setSavingKeys(false);
    }
  };

  const handleAddFollowed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followHandle.trim()) return;

    try {
      setAddingFollow(true);
      await accountService.addFollowedAccount(followPlatform, followHandle);
      setFollowHandle('');
      setSuccessMsg(`Now following @${followHandle} on ${followPlatform}`);
      const list = await accountService.getFollowedAccounts();
      setFollowedAccounts(list);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setAddingFollow(false);
    }
  };

  const handleRemoveFollowed = async (id: string) => {
    try {
      await accountService.removeFollowedAccount(id);
      setFollowedAccounts((prev) => prev.filter((item) => item._id !== id));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove followed account');
    }
  };

  const platformsMeta = [
    {
      id: 'twitter' as SocialPlatform,
      name: 'X (Twitter)',
      description: 'Stream reverse-chronological timeline of tweets from accounts you follow via official Twitter API v2 (PKCE).',
      badgeColor: 'bg-black text-white border-neutral-700',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      configKey: 'twitter',
    },
    {
      id: 'instagram' as SocialPlatform,
      name: 'Instagram',
      description: 'Fetch photos, carousels, and reels from your profile and followed creator accounts via Meta Graph API.',
      badgeColor: 'instagram-gradient text-white',
      icon: <Camera className="w-5 h-5" />,
      configKey: 'instagram',
    },
    {
      id: 'facebook' as SocialPlatform,
      name: 'Facebook',
      description: 'Sync status updates, media, and engagement from followed pages and your feed via Meta Facebook Login.',
      badgeColor: 'bg-[#1877F2] text-white',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      configKey: 'facebook',
    },
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Top Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Connect Social Accounts</h1>
          <p className="text-sm text-slate-400">
            Log into X, Instagram, and Facebook separately via official OAuth to view posts from people you follow.
          </p>
        </div>

        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-brand-500/40 text-brand-300 hover:bg-brand-500/10 text-xs font-semibold shadow-md transition self-start sm:self-auto"
        >
          <Settings className="w-4 h-4 text-brand-400" />
          <span>API Keys & Credentials</span>
        </button>
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

      {/* 3 Platform Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platformsMeta.map((p) => {
          const acc = accounts.find((a) => a.platform === p.id);
          const isConnected = acc?.connected || false;
          const isConfigured = credentials[p.configKey]?.configured || false;

          return (
            <div
              key={p.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${p.badgeColor} shadow-md`}>{p.icon}</div>
                  <div className="flex items-center gap-1.5">
                    {isConnected ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {acc?.isMock ? 'Mock Demo' : 'OAuth Active'}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        Disconnected
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-100">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.description}</p>
                </div>

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
                    <span>Disconnect {p.name}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleConnectOAuth(p.id)}
                      disabled={actionLoading === `oauth-${p.id}`}
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 transition"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Log In & Connect</span>
                    </button>

                    <button
                      onClick={() => handleConnectMock(p.id)}
                      disabled={actionLoading === `mock-${p.id}`}
                      className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Use Mock Demo Instead</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Followed Profiles / Creators Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" />
              <h3 className="font-bold text-base text-slate-100">Specific Followed Accounts & Creators</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify public creators or friend handles to continuously fetch their posts into your unified feed.
            </p>
          </div>
        </div>

        {/* Add handle form */}
        <form onSubmit={handleAddFollowed} className="flex flex-wrap items-center gap-2 pt-2">
          <select
            value={followPlatform}
            onChange={(e) => setFollowFollowPlatform(e.target.value as SocialPlatform)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="twitter">X (Twitter)</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>

          <input
            type="text"
            required
            value={followHandle}
            onChange={(e) => setFollowHandle(e.target.value)}
            placeholder="@handle (e.g. natgeo, elonmusk, reactjs)"
            className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />

          <button
            type="submit"
            disabled={addingFollow}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{addingFollow ? 'Adding...' : 'Add Account'}</span>
          </button>
        </form>

        {/* Followed list */}
        {followedAccounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-3 border-t border-slate-800">
            {followedAccounts.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img src={item.avatarUrl} alt={item.handle} className="w-7 h-7 rounded-full bg-slate-800" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-200 truncate">@{item.handle}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{item.platform}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFollowed(item._id)}
                  title="Remove account"
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic pt-2">
            No custom followed handles added yet. Your feed will automatically use your official OAuth following timeline once connected.
          </p>
        )}
      </div>

      {/* Developer API Keys Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-400" />
                <h3 className="font-black text-lg text-slate-100">Configure Developer API Credentials</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              To connect real social accounts, enter your official app keys below. These are stored securely in your local environment.
            </p>

            <form onSubmit={handleSaveKeys} className="flex flex-col gap-4 text-xs">
              {/* X / Twitter */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <span>1. X (Twitter) Developer Portal</span>
                </span>
                <input
                  type="text"
                  placeholder="TWITTER_CLIENT_ID"
                  value={keysForm.twitterClientId}
                  onChange={(e) => setKeysForm({ ...keysForm, twitterClientId: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <input
                  type="password"
                  placeholder="TWITTER_CLIENT_SECRET"
                  value={keysForm.twitterClientSecret}
                  onChange={(e) => setKeysForm({ ...keysForm, twitterClientSecret: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-500">Redirect URI: <code className="text-cyan-400">http://localhost:5000/api/oauth/twitter/callback</code></span>
              </div>

              {/* Instagram */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <span>2. Instagram Basic Display / Graph API</span>
                </span>
                <input
                  type="text"
                  placeholder="INSTAGRAM_CLIENT_ID"
                  value={keysForm.instagramClientId}
                  onChange={(e) => setKeysForm({ ...keysForm, instagramClientId: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <input
                  type="password"
                  placeholder="INSTAGRAM_CLIENT_SECRET"
                  value={keysForm.instagramClientSecret}
                  onChange={(e) => setKeysForm({ ...keysForm, instagramClientSecret: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-500">Redirect URI: <code className="text-cyan-400">http://localhost:5000/api/oauth/instagram/callback</code></span>
              </div>

              {/* Facebook */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <span>3. Facebook Login App</span>
                </span>
                <input
                  type="text"
                  placeholder="FACEBOOK_APP_ID"
                  value={keysForm.facebookAppId}
                  onChange={(e) => setKeysForm({ ...keysForm, facebookAppId: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <input
                  type="password"
                  placeholder="FACEBOOK_APP_SECRET"
                  value={keysForm.facebookAppSecret}
                  onChange={(e) => setKeysForm({ ...keysForm, facebookAppSecret: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-500">Redirect URI: <code className="text-cyan-400">http://localhost:5000/api/oauth/facebook/callback</code></span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingKeys}
                  className="px-5 py-2 rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25"
                >
                  {savingKeys ? 'Saving...' : 'Save & Apply Keys'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
