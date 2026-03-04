'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  AlertCircleIcon,
  InfoIcon,
  BrainIcon,
  PlayIcon,
  TrendingUpIcon,
  ShieldIcon,
  FileIcon,
} from '@/components/Icons';
import {
  scoreColor,
  scoreBg,
  scoreGlow,
  scoreLabel,
} from '@aiready/components';
import type { Repository, Analysis } from '@/lib/db';
import type { AnalysisData } from '@/lib/storage';

interface Props {
  repo: Repository;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function RepoDetailClient({ repo, user }: Props) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'metrics'>('issues');
  const [filter, setFilter] = useState<{
    severity?: string;
  }>({});

  const toggleIssue = (index: number) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedIssues(newExpanded);
  };

  const expandAll = () => {
    setExpandedIssues(new Set(allIssues.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedIssues(new Set());
  };

  useEffect(() => {
    fetchLatestAnalysis();
  }, [repo.id]);

  async function fetchLatestAnalysis() {
    try {
      setLoading(true);
      const res = await fetch(`/api/repos/${repo.id}/analysis/latest`);
      const data = await res.json();
      if (res.ok) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Failed to fetch analysis results');
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  // Flatten issues from breakdown for easy filtering/display
  const allIssues: any[] = [];
  if (analysis?.breakdown) {
    Object.entries(analysis.breakdown).forEach(
      ([toolName, toolData]: [string, any]) => {
        if (Array.isArray(toolData.details)) {
          toolData.details.forEach((issue: any) => {
            allIssues.push({
              ...issue,
              tool: toolName,
              severity: issue.severity || 'major',
            });
          });
        }
      }
    );
  }

  const filteredIssues = allIssues.filter((issue) => {
    if (filter.severity && issue.severity !== filter.severity) return false;
    if (selectedTool && issue.tool !== selectedTool) return false;
    return true;
  });

  const severityColors: any = {
    critical: 'text-red-400 border-red-500/30 bg-red-500/10',
    major: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    minor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    info: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden text-white">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-blue w-96 h-96 -top-48 -right-48 opacity-20" />
        <div className="orb orb-purple w-80 h-80 bottom-0 -left-40 opacity-20" />
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      {/* Header */}
      <header className="glass sticky top-0 z-20 border-b border-indigo-500/20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/logo-text-transparent-dark-theme.png"
                alt="AIReady"
                width={140}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Settings
              </Link>
            </nav>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-3">
              {user.image && (
                <img
                  src={user.image}
                  className="w-8 h-8 rounded-full border border-cyan-500/50"
                />
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-slate-400 hover:text-red-400 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Repo Title & Score */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="text-cyan-400 text-xs font-black uppercase tracking-widest hover:text-cyan-300 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-3 h-3 rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M13 5l7 7-7 7"
                />
              </svg>
              Back to Dashboard
            </Link>
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-white leading-tight">
                {repo.name}
              </h1>
              <p className="text-slate-400 max-w-2xl">
                {repo.description ||
                  'Comprehensive AI-readiness analysis for this repository.'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <a
                href={repo.url}
                target="_blank"
                className="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
              >
                <FileIcon className="w-3.5 h-3.5" />
                {repo.url}
              </a>
              {analysis && (
                <div className="text-slate-500 flex items-center gap-1.5">
                  <PlayIcon className="w-3.5 h-3.5 rotate-90" />
                  Last analyzed{' '}
                  {new Date(analysis.metadata.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {analysis && (
            <div
              className={`p-6 rounded-3xl border ${scoreBg(analysis.summary.aiReadinessScore)} ${scoreGlow(analysis.summary.aiReadinessScore)} shadow-2xl flex items-center gap-6`}
            >
              <div className="text-center">
                <div
                  className={`text-5xl font-black ${scoreColor(analysis.summary.aiReadinessScore)}`}
                >
                  {analysis.summary.aiReadinessScore}
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Score / 100
                </div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-lg font-bold text-white capitalize">
                  {scoreLabel(analysis.summary.aiReadinessScore)}
                </div>
                <div className="text-xs text-slate-400">
                  AI Readiness Maturity
                </div>
              </div>
            </div>
          )}
        </section>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">
              Analyzing Results...
            </p>
          </div>
        ) : error ? (
          <div className="glass-card rounded-3xl p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircleIcon className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold">Analysis Unavailable</h2>
            <p className="text-slate-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors border border-slate-700 font-bold text-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Metrics */}
              <aside className="lg:col-span-1 space-y-6">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">
                  Dimensions
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setSelectedTool(null)}
                    className={`w-full text-left glass-card p-3 rounded-xl border transition-all ${!selectedTool ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                        All Dimensions
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {allIssues.length} issues
                      </span>
                    </div>
                  </button>
                  {Object.entries(analysis.breakdown).map(
                    ([key, val]: [string, any]) => (
                      <button
                        key={key}
                        onClick={() =>
                          setSelectedTool(selectedTool === key ? null : key)
                        }
                        className={`w-full text-left glass-card p-4 rounded-2xl border transition-all space-y-2 ${selectedTool === key ? 'border-cyan-500/50 bg-cyan-500/5 ring-1 ring-cyan-500/20' : 'border-white/5 hover:border-white/10'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span
                            className={`text-sm font-black ${scoreColor(val.score)}`}
                          >
                            {val.score}
                          </span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${val.score}%` }}
                            className={`h-full ${val.score > 80 ? 'bg-emerald-500' : val.score > 60 ? 'bg-cyan-500' : val.score > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                          />
                        </div>
                      </button>
                    )
                  )}
                </div>
              </aside>

              {/* Issue Feed */}
              <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">
                    Identified Issues
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={
                        expandedIssues.size === filteredIssues.length
                          ? collapseAll
                          : expandAll
                      }
                      className="text-[10px] font-bold text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors"
                    >
                      {expandedIssues.size === filteredIssues.length
                        ? 'Collapse All'
                        : 'Expand All'}
                    </button>
                    <select
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 appearance-none cursor-pointer pr-8"
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          severity: e.target.value || undefined,
                        }))
                      }
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E\")",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1rem',
                      }}
                    >
                      <option value="">All Severities</option>
                      <option value="critical">Critical</option>
                      <option value="major">Major</option>
                      <option value="minor">Minor</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredIssues.length === 0 ? (
                    <div className="glass-card p-12 text-center rounded-3xl border border-emerald-500/10">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 mb-4">
                        <ShieldIcon className="w-8 h-8 text-emerald-500" />
                      </div>
                      <h4 className="text-lg font-bold text-white">
                        All Clear!
                      </h4>
                      <p className="text-slate-500 text-sm">
                        No issues found for the current selection.
                      </p>
                    </div>
                  ) : (
                    filteredIssues.map((issue, i) => {
                      const idx = allIssues.indexOf(issue);
                      const isExpanded = expandedIssues.has(idx);
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`glass-card rounded-2xl border transition-all overflow-hidden cursor-pointer ${isExpanded ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/5 hover:border-white/10 group'}`}
                          onClick={() => toggleIssue(idx)}
                        >
                          <div className="p-5 flex items-start gap-4">
                            <div
                              className={`mt-0.5 p-2 rounded-xl border transition-colors ${isExpanded ? severityColors[issue.severity] : 'text-slate-500 border-slate-800'}`}
                            >
                              <AlertCircleIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    {issue.tool} / {issue.type || 'logic'}
                                  </span>
                                  {!isExpanded && (
                                    <div className="flex gap-2">
                                      {issue.file && (
                                        <span className="text-[10px] text-slate-600 font-mono truncate max-w-[150px]">
                                          {issue.file.split('/').pop()}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${severityColors[issue.severity]}`}
                                >
                                  {issue.severity}
                                </span>
                              </div>
                              <h4 className="font-bold text-white text-md leading-snug">
                                {issue.message}
                              </h4>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pt-4 space-y-4">
                                      {/* Location & Context */}
                                      <div className="flex flex-wrap gap-4 pt-1">
                                        {issue.file1 && (
                                          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-400/5 px-2 py-1 rounded border border-cyan-400/10">
                                            <FileIcon className="w-3.5 h-3.5" />
                                            {issue.file1}
                                            {issue.location?.line && (
                                              <span className="text-slate-600">
                                                :L{issue.location.line}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                        {issue.file2 && (
                                          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-400/5 px-2 py-1 rounded border border-cyan-400/10">
                                            <FileIcon className="w-3.5 h-3.5" />
                                            {issue.file2}
                                          </div>
                                        )}
                                        {issue.file && !issue.file1 && (
                                          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-400/5 px-2 py-1 rounded border border-cyan-400/10">
                                            <FileIcon className="w-3.5 h-3.5" />
                                            {issue.file}
                                            {issue.line && (
                                              <span className="text-slate-600">
                                                :L{issue.line}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Suggestion */}
                                      {issue.suggestion && (
                                        <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 space-y-2">
                                          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                                            <BrainIcon className="w-4 h-4" />
                                            Recommendation
                                          </div>
                                          <p className="text-sm text-slate-300 leading-relaxed italic">
                                            "{issue.suggestion}"
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            <div className="mt-1">
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                className="text-slate-600 group-hover:text-slate-400"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
