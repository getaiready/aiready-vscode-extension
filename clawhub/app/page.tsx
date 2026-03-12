'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  RefreshCcw,
  ShieldCheck,
  Cpu,
  GitBranch,
  Globe,
  MessageSquare,
  ArrowRight,
  Code,
} from 'lucide-react';

export default function ClawHubPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 selection:text-blue-200 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-black/70 border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold">
              CH
            </div>
            <span className="text-xl font-bold tracking-tight">ClawHub</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link
              href="#features"
              className="hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#evolution"
              className="hover:text-white transition-colors"
            >
              Evolution
            </Link>
            <Link
              href="#pricing"
              className="hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="https://github.com/caopengau/serverlessclaw"
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-600/20 to-transparent blur-[120px] -z-10 opacity-50" />

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Introducing ClawHub v1.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            The Never-Dying, <br />
            <span className="text-blue-500">Self-Evolving</span> Stack
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            ClawHub is the world&apos;s first autonomous agentic system built on
            AWS. It writes code, deploys infra, and evolves its own capabilities
            while you sleep.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://github.com/caopengau/serverlessclaw"
              className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-semibold flex items-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#waitlist"
              className="px-8 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors font-semibold"
            >
              Join Managed Beta
            </Link>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section
        className="py-24 border-t border-white/5 bg-[#0d0d0d]"
        id="features"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Autonomous Evolution
              </h3>
              <p className="text-zinc-500 leading-relaxed">
                Git-driven loops that close the gap between reasoning and code.
                The system detects its own gaps and implements solutions
                autonomously.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Event-Driven Spine</h3>
              <p className="text-zinc-500 leading-relaxed">
                Built on AWS EventBridge for decoupled, resilient agent
                coordination. Stateless execution with infinite observability
                via ClawCenter.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">BYOC Safety</h3>
              <p className="text-zinc-500 leading-relaxed">
                Keep your data in your cloud. Deploy ClawHub into your own VPC
                with advanced guardrails, recursion limits, and
                human-in-the-loop approvals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-500">
              Choose the model that fits your team&apos;s scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col">
              <div className="mb-6">
                <h4 className="text-zinc-400 font-medium mb-2">Community</h4>
                <div className="text-3xl font-bold">$0</div>
                <p className="text-xs text-zinc-600 mt-1">
                  Free forever for personal use
                </p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-sm text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-zinc-500" />
                  Self-Hosted (OSS)
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-400">
                  <GitBranch className="w-4 h-4 text-zinc-500" />
                  Basic Agent Archetypes
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-400">
                  <Globe className="w-4 h-4 text-zinc-500" />
                  Bring Your Own Keys (BYOK)
                </li>
              </ul>
              <Link
                href="https://github.com/caopengau/serverlessclaw"
                className="w-full py-2 rounded-lg border border-white/10 text-center hover:bg-white/5 transition-colors text-sm font-semibold"
              >
                Fork on GitHub
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-2xl border border-blue-500/20 bg-blue-500/[0.02] relative flex flex-col scale-105 shadow-2xl shadow-blue-500/10">
              <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-blue-600 text-[10px] font-bold uppercase tracking-wider">
                Popular
              </div>
              <div className="mb-6">
                <h4 className="text-blue-400 font-medium mb-2">
                  Pro (Managed)
                </h4>
                <div className="text-3xl font-bold">
                  $29
                  <span className="text-sm font-normal text-zinc-500">/mo</span>
                </div>
                <p className="text-xs text-zinc-600 mt-1">
                  + Token Markup or BYOK
                </p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-sm text-zinc-200">
                  <Zap className="w-4 h-4 text-blue-500" />
                  Managed Dashboard
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-200">
                  <RefreshCcw className="w-4 h-4 text-blue-500" />
                  Remote Evolution
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-200">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  Email & Discord Support
                </li>
              </ul>
              <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-semibold">
                Join Waitlist
              </button>
            </div>

            {/* Team Tier */}
            <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col">
              <div className="mb-6">
                <h4 className="text-zinc-400 font-medium mb-2">Team (BYOC)</h4>
                <div className="text-3xl font-bold">
                  $299
                  <span className="text-sm font-normal text-zinc-500">/mo</span>
                </div>
                <p className="text-xs text-zinc-600 mt-1">
                  Deploy to your Cloud
                </p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-sm text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-zinc-500" />
                  Managed BYOC Deployment
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-400">
                  <Zap className="w-4 h-4 text-zinc-500" />
                  Single Sign-On (SSO)
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-400">
                  <MessageSquare className="w-4 h-4 text-zinc-500" />
                  Priority Slack Channel
                </li>
              </ul>
              <button className="w-full py-2 rounded-lg border border-white/10 text-center hover:bg-white/5 transition-colors text-sm font-semibold">
                Contact Sales
              </button>
            </div>
          </div>

          <div className="mt-16 p-6 rounded-xl border border-white/5 bg-white/[0.01] max-w-2xl mx-auto text-center">
            <h5 className="font-semibold mb-2">The Evolution Tax</h5>
            <p className="text-sm text-zinc-500">
              Directly align revenue with value. We charge{' '}
              <span className="text-white font-medium">
                $1 per successful evolution
              </span>{' '}
              (autonomous commit that improves the system). No cost if the
              system doesn&apos;t improve itself.
            </p>
          </div>
        </div>
      </section>

      {/* Evolution Loop Visual (Text/CSS) */}
      <section
        className="py-24 bg-[#0d0d0d] border-y border-white/5 overflow-hidden"
        id="evolution"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-6">The Persistence Loop</h2>
              <p className="text-zinc-400 mb-8 leading-relaxed text-lg">
                Most agents are ephemeral. ClawHub treats its source code as
                mutable runtime state. By committing its own upgrades back to
                Git, it closes the cognitive gap between reasoning and
                production infrastructure.
              </p>
              <div className="space-y-4">
                {[
                  {
                    label: 'Gap Detection',
                    desc: 'Reflector agent identifies capability gaps',
                  },
                  {
                    label: 'Strategic Planning',
                    desc: 'Planner designs a verified solution',
                  },
                  {
                    label: 'Autonomous Ops',
                    desc: 'Coder implements & CodeBuild deploys',
                  },
                  {
                    label: 'Source Persistence',
                    desc: 'Successfully verified code is committed to Git',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-lg border border-white/5 bg-white/[0.01]"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-sm text-zinc-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 relative w-full aspect-square max-w-[500px]">
              {/* Simplified Neural Visualizer (CSS Animation) */}
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="relative h-full w-full rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 font-mono text-xs overflow-hidden">
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                  <Code className="w-4 h-4 text-blue-500" />
                  <span className="text-zinc-400">evolution-loop.log</span>
                </div>
                <div className="space-y-2 text-zinc-500">
                  <div>
                    [00:14:16] <span className="text-blue-400">SYSTEM:</span>{' '}
                    Scanning topology...
                  </div>
                  <div>
                    [00:14:17]{' '}
                    <span className="text-purple-400">REFLECTOR:</span> Gap
                    detected in &apos;MemoryPruning&apos;
                  </div>
                  <div>
                    [00:14:19] <span className="text-yellow-400">PLANNER:</span>{' '}
                    Designing JIT Context strategy
                  </div>
                  <div>
                    [00:14:25] <span className="text-white">CODER:</span>{' '}
                    Modifying src/core/memory.ts
                  </div>
                  <div>
                    [00:14:40]{' '}
                    <span className="text-emerald-400">DEPLOYER:</span> SST
                    deploy starting...
                  </div>
                  <div className="animate-pulse">
                    [00:15:10]{' '}
                    <span className="text-emerald-500">SUCCESS:</span> Evolution
                    committed to main
                  </div>
                  <div className="mt-4 p-2 bg-blue-500/10 rounded border border-blue-500/20 text-blue-400">
                    + feat(memory): optimized recall with ranking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold">
              CH
            </div>
            <span className="font-bold">ClawHub</span>
          </div>
          <p className="text-zinc-600 text-sm">
            Part of the{' '}
            <Link
              href="https://getaiready.dev"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              AIReady
            </Link>{' '}
            ecosystem.
            <br />© 2026 ClawHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
