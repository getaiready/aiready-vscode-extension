'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RocketIcon,
  PlayIcon,
  UploadIcon,
  FileIcon,
  ShieldIcon,
  TrendingUpIcon,
  TrashIcon,
  ChartIcon,
} from '@/components/Icons';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  scoreColor,
  scoreBg,
  scoreGlow,
  scoreLabel,
} from '@aiready/components';
import type { Repository, Analysis, ApiKey, Team, TeamMember } from '@/lib/db';
import { TrendsView } from './TrendsView';

type RepoWithAnalysis = Repository & { latestAnalysis: Analysis | null };

interface Props {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  repos: RepoWithAnalysis[];
  teams: (TeamMember & { team: Team })[];
  overallScore: number | null;
}

export default function DashboardClient({
  user,
  repos: initialRepos,
  teams,
  overallScore,
}: Props) {
  const [currentTeamId, setCurrentTeamId] = useState<string | 'personal'>(
    'personal'
  );
  const [repos, setRepos] = useState<RepoWithAnalysis[]>(initialRepos);

  useEffect(() => {
    if (currentTeamId === 'personal') {
      setRepos(initialRepos);
    } else {
      fetchTeamRepos(currentTeamId);
    }
  }, [currentTeamId, initialRepos]);

  async function fetchTeamRepos(teamId: string) {
    try {
      const res = await fetch(`/api/repos?teamId=${teamId}`);
      if (res.ok) {
        const data = await res.json();
        setRepos(
          data.repos.map((r: any) => ({
            ...r,
            latestAnalysis: r.latestAnalysis || null,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch team repos:', err);
    }
  }
  const [showAddRepo, setShowAddRepo] = useState(false);
  const [addRepoForm, setAddRepoForm] = useState({
    name: '',
    url: '',
    description: '',
    defaultBranch: 'main',
  });
  const [addRepoError, setAddRepoError] = useState<string | null>(null);
  const [addRepoLoading, setAddRepoLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingRepoId, setUploadingRepoId] = useState<string | null>(null);
  const [scanningRepoId, setScanningRepoId] = useState<string | null>(null);
  const [pendingScanRepoIds, setPendingScanRepoIds] = useState<string[]>([]);

  // Automatic Refresh Polling
  useEffect(() => {
    if (pendingScanRepoIds.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const url =
          currentTeamId === 'personal'
            ? '/api/repos'
            : `/api/repos?teamId=${currentTeamId}`;
        const res = await fetch(url);
        if (!res.ok) return;

        const data = await res.json();
        const updatedRepos: RepoWithAnalysis[] = data.repos.map((r: any) => ({
          ...r,
          latestAnalysis: r.latestAnalysis || null,
        }));

        // Determine who finished
        const finishedIds: string[] = [];
        pendingScanRepoIds.forEach((id) => {
          const oldRepo = repos.find((r) => r.id === id);
          const newRepo = updatedRepos.find((r) => r.id === id);

          // If it now has a newer analysis timestamp
          if (
            newRepo?.latestAnalysis &&
            (!oldRepo?.latestAnalysis ||
              newRepo.latestAnalysis.timestamp !==
                oldRepo.latestAnalysis.timestamp)
          ) {
            finishedIds.push(id);
            toast.success(`Scan complete for ${newRepo.name}!`, {
              description: `New AI Score: ${newRepo.aiScore || 'N/A'}`,
            });
          }
        });

        // Update overall list
        setRepos(updatedRepos);

        // Remove from pending
        if (finishedIds.length > 0) {
          setPendingScanRepoIds((prev) =>
            prev.filter((id) => !finishedIds.includes(id))
          );
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000); // check every 5 seconds

    return () => clearInterval(interval);
  }, [pendingScanRepoIds, currentTeamId, repos]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [keysLoading, setKeysLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [repoForTrends, setRepoForTrends] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [repoForBadge, setRepoForBadge] = useState<{
    id: string;
    name: string;
  } | null>(null);

  async function handleCheckout(plan: 'pro' | 'team') {
    try {
      setBillingLoading(true);
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          teamId: currentTeamId,
          plan,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setUploadError(data.error || 'Failed to start checkout');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setUploadError('Checkout failed. Please try again.');
    } finally {
      setBillingLoading(false);
    }
  }

  async function handlePortal(customerId: string) {
    try {
      setBillingLoading(true);
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'portal',
          customerId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setUploadError(data.error || 'Failed to open portal');
      }
    } catch (err) {
      console.error('Portal error:', err);
      setUploadError('Failed to open billing portal.');
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleAddRepo(e: React.FormEvent) {
    e.preventDefault();
    setAddRepoError(null);
    setAddRepoLoading(true);

    try {
      const res = await fetch('/api/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addRepoForm,
          teamId: currentTeamId === 'personal' ? undefined : currentTeamId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddRepoError(data.error || 'Failed to add repository');
        return;
      }

      const newRepo: RepoWithAnalysis = { ...data.repo, latestAnalysis: null };
      setRepos((prev) => [newRepo, ...prev]);
      setShowAddRepo(false);
      setAddRepoForm({
        name: '',
        url: '',
        description: '',
        defaultBranch: 'main',
      });
    } catch {
      setAddRepoError('Network error. Please try again.');
    } finally {
      setAddRepoLoading(false);
    }
  }

  async function handleDeleteRepo(repoId: string) {
    if (!confirm('Delete this repository and all its analyses?')) return;

    const res = await fetch(`/api/repos?id=${repoId}`, { method: 'DELETE' });
    if (res.ok) {
      setRepos((prev) => prev.filter((r) => r.id !== repoId));
      toast.success('Repository deleted');
    } else {
      toast.error('Failed to delete repository');
    }
  }

  async function handleUploadAnalysis(repoId: string) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      setUploadingRepoId(repoId);
      setUploadError(null);

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        const res = await fetch('/api/analysis/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoId, data }),
        });

        const result = await res.json();
        if (!res.ok) {
          setUploadError(result.error || 'Upload failed');
          return;
        }

        setRepos((prev) =>
          prev.map((r) =>
            r.id === repoId
              ? {
                  ...r,
                  latestAnalysis: result.analysis,
                  aiScore: result.analysis.aiScore,
                }
              : r
          )
        );
      } catch {
        setUploadError('Invalid JSON file or network error');
      } finally {
        setUploadingRepoId(null);
      }
    };

    input.click();
  }

  async function handleScanRepo(repoId: string) {
    setScanningRepoId(repoId);
    setUploadError(null);

    try {
      const res = await fetch('/api/analysis/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId }),
      });

      const result = await res.json();
      if (!res.ok) {
        setUploadError(result.error || 'Failed to trigger scan');
        toast.error(result.error || 'Failed to trigger scan');
        return;
      }

      // Show a success message and track the background progress
      toast.success('Scan triggered! Results will appear here automatically.');
      setPendingScanRepoIds((prev) => [...prev, repoId]);
    } catch {
      setUploadError('Network error while triggering scan');
      toast.error('Network error while triggering scan');
    } finally {
      setScanningRepoId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="orb orb-blue w-96 h-96 -top-48 -right-48"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="orb orb-purple w-80 h-80 bottom-0 -left-40"
          style={{ animationDelay: '3s' }}
        />
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* Header */}
      <header className="glass sticky top-0 z-20 border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center"
              >
                <Image
                  src="/logo-text-transparent-dark-theme.png"
                  alt="AIReady"
                  width={140}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </motion.div>
              <nav className="hidden md:flex items-center gap-6 ml-6">
                <a
                  href="/dashboard"
                  className="text-sm font-medium text-cyan-400 border-b-2 border-cyan-400 pb-0.5"
                >
                  Dashboard
                </a>
                <a
                  href="/settings"
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Settings
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {user.image && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full border-2 border-cyan-500/50"
                />
              )}
              <span className="text-sm text-slate-300 hidden sm:block">
                {user.name || user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Team Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-700/50 w-fit">
          <button
            onClick={() => setCurrentTeamId('personal')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentTeamId === 'personal'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Personal
          </button>
          {teams.map((t) => (
            <button
              key={t.teamId}
              onClick={() => setCurrentTeamId(t.teamId)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentTeamId === t.teamId
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.team.name}
            </button>
          ))}
        </div>
        {/* Welcome + overall score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user.name?.split(' ')[0] || 'Developer'}!
            </h1>
            <p className="text-slate-400 mt-1">
              {repos.length === 0
                ? 'Add your first repository to start tracking AI readiness.'
                : `Tracking ${repos.length} repositor${repos.length === 1 ? 'y' : 'ies'}`}
            </p>
          </div>
          {overallScore != null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl border ${scoreBg(overallScore)} shadow-lg ${scoreGlow(overallScore)}`}
            >
              <div className="text-right">
                <div
                  className={`text-4xl font-black ${scoreColor(overallScore)}`}
                >
                  {overallScore}
                </div>
                <div className="text-xs text-slate-500 -mt-1">/ 100</div>
              </div>
              <div className="pl-4 border-l border-slate-700">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Overall AI Score
                </div>
                <div
                  className={`text-sm font-semibold ${scoreColor(overallScore)}`}
                >
                  {scoreLabel(overallScore)}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Limits banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wide">
                Repos
              </span>
              <span className="text-lg font-bold text-white">
                {repos.length}
              </span>
              <span className="text-xs text-slate-500">
                / {currentTeamId === 'personal' ? '3' : '∞'}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wide">
                This Month
              </span>
              <span className="text-lg font-bold text-white">
                {currentTeamId === 'personal'
                  ? Math.max(
                      0,
                      10 - repos.filter((r) => r.latestAnalysis).length
                    )
                  : '∞'}
              </span>
              <span className="text-xs text-slate-500">runs left</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500">
              <span className="capitalize font-semibold text-slate-300">
                {currentTeamId === 'personal'
                  ? 'Personal Plan'
                  : `${teams.find((t) => t.teamId === currentTeamId)?.team.plan || 'Free'} Plan`}
              </span>
            </div>
            {currentTeamId !== 'personal' && (
              <div className="flex items-center gap-2">
                {teams.find((t) => t.teamId === currentTeamId)?.team
                  .stripeCustomerId ? (
                  <button
                    onClick={() => {
                      const team = teams.find(
                        (t) => t.teamId === currentTeamId
                      )?.team;
                      if (team?.stripeCustomerId)
                        handlePortal(team.stripeCustomerId);
                    }}
                    disabled={billingLoading}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold px-3 py-1 rounded-lg border border-cyan-400/30 hover:bg-cyan-400/10 transition-all"
                  >
                    {billingLoading ? 'Loading...' : 'Manage Billing'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout('team')}
                    disabled={billingLoading}
                    className="text-xs bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-3 py-1 rounded-lg shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                  >
                    {billingLoading ? 'Loading...' : 'Upgrade'}
                  </button>
                )}
              </div>
            )}
            {currentTeamId === 'personal' && (
              <Link
                href="/pricing"
                className="text-xs text-cyan-400 hover:underline font-bold"
              >
                Pricing
              </Link>
            )}
          </div>
        </motion.div>

        {/* Upload error banner */}
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl flex justify-between items-center"
            >
              <span>{uploadError}</span>
              <button
                onClick={() => setUploadError(null)}
                className="ml-4 font-bold text-xl leading-none hover:text-red-100"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Repositories section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Repositories</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddRepo(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <span className="text-lg leading-none">+</span> Add Repository
            </motion.button>
          </div>

          {repos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-12 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6"
              >
                <div className="inline-block text-6xl text-slate-50">
                  <RocketIcon className="w-14 h-14" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Get Started with AIReady
              </h3>
              <p className="text-slate-400 max-w-md mx-auto mb-8">
                Add a repository, run the CLI, then upload the results to get
                your AI readiness score.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddRepo(true)}
                className="mt-8 btn-primary"
              >
                Add Your First Repository
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence>
                {repos.map((repo, index) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    index={index}
                    uploading={uploadingRepoId === repo.id}
                    scanning={
                      scanningRepoId === repo.id ||
                      pendingScanRepoIds.includes(repo.id)
                    }
                    onUpload={() => handleUploadAnalysis(repo.id)}
                    onScan={() => handleScanRepo(repo.id)}
                    onDelete={() => handleDeleteRepo(repo.id)}
                    onViewTrends={() =>
                      setRepoForTrends({ id: repo.id, name: repo.name })
                    }
                    onBadge={() =>
                      setRepoForBadge({ id: repo.id, name: repo.name })
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Trends Modal */}
        <AnimatePresence>
          {repoForTrends && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <TrendsView
                repoId={repoForTrends.id}
                repoName={repoForTrends.name}
                onClose={() => setRepoForTrends(null)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Badge Modal */}
        <AnimatePresence>
          {repoForBadge && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xl shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    🛡️ AI-Readiness Badge
                  </h2>
                  <button
                    onClick={() => setRepoForBadge(null)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center p-8 bg-slate-950/50 rounded-2xl border border-slate-700/50">
                    <img
                      src={`/api/repos/${repoForBadge.id}/badge`}
                      alt="AI Readiness Badge"
                      className="h-8"
                    />
                    <p className="text-xs text-slate-500 mt-4">Preview Badge</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Markdown (README.md)
                      </label>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={`[![AI-Readiness](https://getaiready.dev/api/repos/${repoForBadge.id}/badge)](https://getaiready.dev/dashboard)`}
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono"
                        />
                        <button
                          onClick={() => {
                            if (repoForBadge) {
                              navigator.clipboard.writeText(
                                `[![AI-Readiness](https://getaiready.dev/api/repos/${repoForBadge.id}/badge)](https://getaiready.dev/dashboard)`
                              );
                              toast.success('Copied to clipboard!');
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Direct URL
                      </label>
                      <input
                        readOnly
                        value={`https://getaiready.dev/api/repos/${repoForBadge.id}/badge`}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CLI quickstart */}
        {repos.length > 0 && repos.every((r) => !r.latestAnalysis) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-semibold text-lg text-white mb-2">
              Run your first analysis
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Generate a report JSON and upload it to see your AI readiness
              scores.
            </p>
            <div className="font-mono text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">$</span>
                <span className="text-cyan-400">
                  npx @aiready/cli scan . --output json{' > '}report.json
                </span>
              </div>
              <div className="text-slate-500 text-xs">
                # then upload report.json via the button on your repo card
              </div>
            </div>
          </motion.section>
        )}

        {/* Team Management Section */}
        {currentTeamId !== 'personal' && (
          <TeamManagement
            teamId={currentTeamId}
            teamName={
              teams.find((t) => t.teamId === currentTeamId)?.team.name || 'Team'
            }
          />
        )}
      </main>

      {/* Add Repository Modal */}
      <AnimatePresence>
        {showAddRepo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddRepo(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-700/50">
                <h3 className="text-lg font-semibold text-white">
                  Add Repository
                </h3>
                <button
                  onClick={() => setShowAddRepo(false)}
                  className="text-slate-400 hover:text-white text-xl leading-none"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleAddRepo} className="px-6 py-5 space-y-4">
                {addRepoError && (
                  <div className="text-sm text-red-400 bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-2">
                    {addRepoError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="my-awesome-project"
                    value={addRepoForm.name}
                    onChange={(e) =>
                      setAddRepoForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Repository URL
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://github.com/user/repo"
                    value={addRepoForm.url}
                    onChange={(e) =>
                      setAddRepoForm((f) => ({ ...f, url: e.target.value }))
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Description{' '}
                    <span className="text-slate-500 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="What does this repo do?"
                    value={addRepoForm.description}
                    onChange={(e) =>
                      setAddRepoForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Default Branch
                  </label>
                  <input
                    type="text"
                    placeholder="main"
                    value={addRepoForm.defaultBranch}
                    onChange={(e) =>
                      setAddRepoForm((f) => ({
                        ...f,
                        defaultBranch: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRepo(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-600 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={addRepoLoading}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addRepoLoading ? 'Adding...' : 'Add Repository'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RepoCard({
  repo,
  index,
  uploading,
  scanning,
  onUpload,
  onScan,
  onDelete,
  onViewTrends,
  onBadge,
}: {
  repo: RepoWithAnalysis;
  index: number;
  uploading: boolean;
  scanning: boolean;
  onUpload: () => void;
  onScan: () => void;
  onDelete: () => void;
  onViewTrends: () => void;
  onBadge: () => void;
}) {
  const score = repo.aiScore;
  const analysis = repo.latestAnalysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl p-5 flex flex-col gap-4 card-hover"
    >
      {/* Repo header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate text-lg hover:text-cyan-400 transition-colors">
            <Link href={`/dashboard/repo/${repo.id}`}>{repo.name}</Link>
          </h3>
          {repo.description && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {repo.description}
            </p>
          )}
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 truncate block transition-colors"
          >
            {repo.url}
          </a>
        </div>
        {score != null && (
          <div
            className={`flex-shrink-0 text-center px-4 py-2 rounded-xl border ${scoreBg(score)} shadow-lg`}
          >
            <div
              className={`text-2xl font-black leading-none ${scoreColor(score)}`}
            >
              {score}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">/ 100</div>
          </div>
        )}
      </div>

      {/* Breakdown grid */}
      {analysis?.breakdown && (
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(analysis.breakdown).map(([key, val]) => (
            <BreakdownItem
              key={key}
              label={formatBreakdownKey(key)}
              value={val as number}
            />
          ))}
        </div>
      )}

      {/* Summary line */}
      {analysis?.summary && (
        <div className="flex gap-4 text-xs text-slate-400">
          <span>{analysis.summary.totalFiles} files</span>
          {analysis.summary.criticalIssues > 0 && (
            <span className="text-red-400 font-medium">
              {analysis.summary.criticalIssues} critical
            </span>
          )}
          {analysis.summary.warnings > 0 && (
            <span className="text-amber-400">
              {analysis.summary.warnings} warnings
            </span>
          )}
        </div>
      )}

      {!analysis && (
        <p className="text-xs text-slate-500 italic">
          No analysis yet — upload a report to get scored.
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-3 border-t border-slate-700/50">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onScan}
            disabled={scanning}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/30"
          >
            <PlayIcon className="w-3.5 h-3.5" />
            {scanning ? 'Scanning...' : 'Scan Now'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUpload}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-lg hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-500/30"
          >
            <UploadIcon className="w-3.5 h-3.5" />
            {uploading ? 'Uploading...' : 'Upload JSON'}
          </motion.button>
        </div>

        {analysis && (
          <Link href={`/dashboard/repo/${repo.id}`}>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 border border-indigo-400/30"
            >
              <ChartIcon className="w-3.5 h-3.5" />
              View Report Details
            </motion.button>
          </Link>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-3">
            <IconButton
              onClick={() =>
                window.open(`/api/agent/metadata?repoId=${repo.id}`)
              }
              icon={<FileIcon className="w-4 h-4" />}
              tooltip="Download Metadata"
            />
            <IconButton
              onClick={onBadge}
              icon={<ShieldIcon className="w-4 h-4" />}
              tooltip="AI-Readiness Badge"
            />
            <IconButton
              onClick={onViewTrends}
              icon={<TrendingUpIcon className="w-4 h-4" />}
              tooltip="View Trends"
            />
          </div>

          <IconButton
            onClick={onDelete}
            icon={<TrashIcon className="w-4 h-4" />}
            tooltip="Delete Repository"
            variant="danger"
          />
        </div>
      </div>

      {repo.lastAnalysisAt && (
        <p className="text-xs text-slate-500 -mt-1">
          Last analyzed {new Date(repo.lastAnalysisAt).toLocaleDateString()}
        </p>
      )}
    </motion.div>
  );
}

function IconButton({
  onClick,
  icon,
  tooltip,
  variant = 'default',
}: {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  variant?: 'default' | 'danger';
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-all border ${
          variant === 'danger'
            ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10 border-transparent hover:border-red-500/30'
            : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border-slate-700/50'
        }`}
      >
        {icon}
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 border border-slate-700 shadow-xl">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </div>
    </div>
  );
}

function BreakdownItem({ label, value }: { label: string; value: number }) {
  const metricId = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <Link
      href={`/metrics#${metricId}`}
      className="bg-slate-800/50 rounded-lg px-2 py-1.5 border border-slate-700/50 hover:bg-slate-700/50 transition-colors block"
    >
      <div className={`text-xs font-bold ${scoreColor(value)}`}>{value}</div>
      <div
        className="text-[10px] text-slate-400 leading-tight truncate"
        title={label}
      >
        {label}
      </div>
    </Link>
  );
}

function formatBreakdownKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function TeamManagement({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [teamId]);

  async function fetchMembers() {
    try {
      const res = await fetch(`/api/teams?teamId=${teamId}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, email: inviteEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteEmail('');
        fetchMembers();
      } else {
        setError(data.error || 'Failed to invite member');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-card rounded-2xl p-6 space-y-6 border border-purple-500/10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Team Management: {teamName}
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
            Invite Member
          </h3>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-purple-600/20"
            >
              {loading ? 'Sending...' : 'Invite'}
            </button>
          </form>
          {error && (
            <p className="text-red-400 text-xs mt-3 font-medium">{error}</p>
          )}
          <p className="text-[10px] text-slate-500 mt-2">
            Note: Users must have logged into AIReady at least once to be
            discovered.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
            Team Members
          </h3>
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between bg-slate-800/30 p-3 rounded-xl border border-slate-700/30"
              >
                <div className="flex items-center gap-3">
                  {m.user?.image ? (
                    <img
                      src={m.user.image}
                      className="w-8 h-8 rounded-full border border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
                      {m.user?.name?.[0] || m.user?.email?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {m.user?.name || m.user?.email}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-black">
                      {m.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
