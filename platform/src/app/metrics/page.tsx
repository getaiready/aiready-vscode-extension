'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  ShieldIcon,
  ChartIcon,
  RobotIcon,
  TargetIcon,
  TrendingUpIcon,
  FileIcon,
} from '@/components/Icons';
import CodeBlock from '@/components/CodeBlock';

const metrics = [
  {
    id: 'semantic-duplicates',
    name: 'Semantic Duplicates',
    description:
      'Detects logic that is repeated but written in different ways.',
    why: 'Traditional linters miss logic duplication. AI models get confused when the same logic exists in multiple places, often updating only one.',
    how: 'Uses Jaccard similarity on AST (Abstract Syntax Tree) tokens to identify structurally identical logic, ignoring variable name or formatting changes.',
    thresholds: [
      {
        score: '90+',
        label: 'Excellent',
        detail: '< 1% duplication across domain logic.',
      },
      {
        score: '70-89',
        label: 'Good',
        detail: 'Minor duplication in boilerplate or utilities.',
      },
      {
        score: '< 50',
        label: 'Critical',
        detail: 'Core business logic repeated in multiple places.',
      },
    ],
    playbook: [
      'Identify "Hidden Singletons" - logic that should be a shared service.',
      'Use Higher-Order Functions to parameterize slight variations in logic.',
      'Consolidate duplicated API handlers into a unified resource controller.',
    ],
    examples: {
      bad: `// File A
function validate(u) {
  return u.id && u.email.includes('@');
}

// File B
const isValid = (user) => {
  return user.id && user.email.indexOf('@') !== -1;
}`,
      good: `// shared/validators.ts
export const isUserValid = (user: User) => {
  return !!(user.id && user.email.includes('@'));
};`,
    },
    icon: <ChartIcon className="w-6 h-6 text-indigo-400" />,
  },
  {
    id: 'context-fragmentation',
    name: 'Context Fragmentation',
    description: 'Analyzes how scattered related logic is across the codebase.',
    why: 'AI has a limited context window. If related logic is scattered across too many files, the AI cannot see the whole picture at once.',
    how: 'Calculates the "Token Distance" between a file and its dependencies by recursively traversing the import graph and measuring domain boundary crossings.',
    thresholds: [
      {
        score: '90+',
        label: 'Cohesive',
        detail: 'Related logic is contained within 1-3 files.',
      },
      {
        score: '60-80',
        label: 'Moderate',
        detail: 'Logic is spread across multiple folders.',
      },
      {
        score: '< 40',
        label: 'Fragmented',
        detail: 'Requires 15+ files to understand a single feature.',
      },
    ],
    playbook: [
      'Adopt a "Feature-First" folder structure instead of "Layer-First".',
      'Consolidate fragmented utility functions into a single domain service.',
      'Reduce deep import chains by flattening the module hierarchy.',
    ],
    examples: {
      bad: `// Fragmented across 3 folders
import { UserType } from '../../types/user';
import { saveUser } from '../../api/user';
import { validateUser } from '../../utils/validation';`,
      good: `// Cohesive feature module
import { UserType, saveUser, validateUser } from '../features/user';`,
    },
    icon: <TargetIcon className="w-6 h-6 text-purple-400" />,
  },
  {
    id: 'naming-consistency',
    name: 'Naming Consistency',
    description:
      'Measures how consistently variables, functions, and classes are named.',
    why: 'AI predicts code based on patterns. Inconsistent naming (e.g., mixing getUser and fetchAccount) breaks these patterns.',
    how: 'Uses token entropy and lexical pattern matching to detect naming drift across similar domain entities and architectural layers.',
    thresholds: [
      {
        score: '95+',
        label: 'Perfect',
        detail: 'Unified naming convention across the entire project.',
      },
      {
        score: '75-90',
        label: 'Good',
        detail: 'Occasional drift in non-critical modules.',
      },
      {
        score: '< 60',
        label: 'Inconsistent',
        detail:
          'Multiple competing conventions (e.g. CamelCase vs snake_case).',
      },
    ],
    playbook: [
      'Define a "Ubiquitous Language" for your domain entities.',
      'Enforce strict suffixing for specific layers (e.g., *Controller, *Service).',
      'Use automated linting to catch casing and prefix inconsistencies early.',
    ],
    examples: {
      bad: `function getUser() { ... }
function fetchAccount() { ... }
function retrieveProfile() { ... }`,
      good: `function getUser() { ... }
function getAccount() { ... }
function getProfile() { ... }`,
    },
    icon: <RobotIcon className="w-6 h-6 text-cyan-400" />,
  },
  {
    id: 'dependency-health',
    name: 'Dependency Health',
    description:
      'Measures the stability, security, and freshness of your project dependencies.',
    why: 'AI often suggests outdated or insecure packages if your project is stuck on old versions.',
    how: 'Cross-references your dependency graph with CVE databases and ecosystem staleness metrics to identify risk and maintenance debt.',
    thresholds: [
      {
        score: '90+',
        label: 'Healthy',
        detail: 'All major deps are within 1 minor version of latest.',
      },
      {
        score: '60-80',
        label: 'Stable',
        detail: 'Some staleness but no critical vulnerabilities.',
      },
      {
        score: '< 40',
        label: 'Degraded',
        detail: 'Multiple deprecated packages or security risks.',
      },
    ],
    playbook: [
      'Automate dependency updates using tools like Renovate or Dependabot.',
      'Prune "Micro-Dependencies" that can be replaced with native logic.',
      'Resolve circular dependencies that break AI-generated refactoring plans.',
    ],
    examples: {
      bad: `"dependencies": {
  "moment": "^2.24.0", // Deprecated
  "lodash": "^3.0.0"   // 10 years old
}`,
      good: `"dependencies": {
  "date-fns": "^4.0.0",
  "zod": "^3.23.0"
}`,
    },
    icon: <ShieldIcon className="w-6 h-6 text-emerald-400" />,
  },
  {
    id: 'change-amplification',
    name: 'Change Amplification',
    description:
      'Tracks how many places need to change when a single requirement evolves.',
    why: 'AI struggles with high coupling. If one change requires 10 files to be updated, the AI is more likely to miss one.',
    how: 'Measures "Coupling Density" by analyzing co-change frequency and shared constant usage across module boundaries.',
    thresholds: [
      {
        score: '90+',
        label: 'Decoupled',
        detail: 'Changes are localized to a single module.',
      },
      {
        score: '60-80',
        label: 'Coupled',
        detail: 'Single change ripples across 3-5 files.',
      },
      {
        score: '< 40',
        label: 'Rigid',
        detail: 'Requirement changes force widespread rewrites.',
      },
    ],
    playbook: [
      'Extract hardcoded constants into a centralized configuration.',
      'Use the "Observer" or "Pub/Sub" pattern to decouple unrelated modules.',
      'Implement clear interfaces between layers to prevent ripple effects.',
    ],
    examples: {
      bad: `// Hardcoded API URL in 10 files
const API = 'https://api.v1.old.com';`,
      good: `// Centralized configuration
import { config } from '@/config';
const API = config.api.baseUrl;`,
    },
    icon: <TrendingUpIcon className="w-6 h-6 text-blue-400" />,
  },
  {
    id: 'ai-signal-clarity',
    name: 'AI Signal Clarity',
    description:
      'Measures the ratio of "signal" (actual logic) to "noise" (boilerplate, dead code).',
    why: 'Excess boilerplate wastes AI context window and leads to lower-quality suggestions.',
    how: 'Uses a signal-to-noise algorithm that weights domain-specific logic against framework boilerplate and unused code segments.',
    thresholds: [
      {
        score: '90+',
        label: 'Clear',
        detail: 'Focus is entirely on business logic.',
      },
      {
        score: '60-80',
        label: 'Noisy',
        detail: 'Boilerplate accounts for 40%+ of the file.',
      },
      {
        score: '< 40',
        label: 'Muffled',
        detail: 'Actual logic is buried in generated or dead code.',
      },
    ],
    playbook: [
      'Eliminate dead code and unused modules aggressively.',
      'Simplify verbose framework boilerplate into reusable hooks or HOCs.',
      'Use concise syntax patterns (e.g., arrow functions, destructuring).',
    ],
    examples: {
      bad: `// 50 lines of boilerplate for 2 lines of logic
class UserComponent extends React.Component {
  constructor(props) { ... }
  render() { ... }
}`,
      good: `// Concise signal-focused logic
const UserComponent = ({ user }) => (
  <div>{user.name}</div>
);`,
    },
    icon: <TrendingUpIcon className="w-6 h-6 text-teal-400" />,
  },
  {
    id: 'documentation-health',
    name: 'Documentation Health',
    description: 'Checks for missing, outdated, or misleading documentation.',
    why: 'AI relies heavily on docstrings to understand intent. Outdated docs lead to "hallucinations".',
    how: 'Analyzes the semantic alignment between docstrings and implementation using a "Drift Detection" algorithm.',
    thresholds: [
      {
        score: '90+',
        label: 'Synchronized',
        detail: 'Docs accurately reflect implementation 99% of the time.',
      },
      {
        score: '60-80',
        label: 'Outdated',
        detail: 'Occasional "comment rot" where docs lag behind code.',
      },
      {
        score: '< 40',
        label: 'Misleading',
        detail: 'Documentation describes non-existent behavior.',
      },
    ],
    playbook: [
      'Enforce "Self-Documenting Code" through clear naming first.',
      'Use JSDoc/TSDoc to provide structured context for AI models.',
      'Link READMEs directly to feature entry points.',
    ],
    examples: {
      bad: `/** Returns user age */
function getUserEmail(id) { ... }`,
      good: `/** Fetches user email by unique identifier */
function getUserEmail(id: string) { ... }`,
    },
    icon: <FileIcon className="w-6 h-6 text-amber-400" />,
  },
  {
    id: 'agent-grounding',
    name: 'Agent Grounding',
    description:
      'Assesses how easily an AI agent can navigate your project structure.',
    why: 'Standard structures allow AI agents to navigate autonomously without getting lost.',
    how: 'Evaluates project topology against "Discovery Benchmarks" for common frameworks (React, Next.js, FastAPI, etc.).',
    thresholds: [
      {
        score: '90+',
        label: 'Grounded',
        detail: 'Follows 100% of ecosystem conventions.',
      },
      {
        score: '70-89',
        label: 'Discoverable',
        detail: 'Standard structure with minor custom layouts.',
      },
      {
        score: '< 50',
        label: 'Lost',
        detail: 'Non-standard layout that confuses autonomous agents.',
      },
    ],
    playbook: [
      'Use standard framework entry points (e.g., index.ts, main.py).',
      'Keep your directory structure shallow and intuitively named.',
      'Avoid deeply nested folders that exceed typical agent search depths.',
    ],
    examples: {
      bad: `src/
  stuff/
    logic/
      user/
        implementation_v2/
          actual_code.ts`,
      good: `src/
  features/
    user/
      user.service.ts`,
    },
    icon: <TargetIcon className="w-6 h-6 text-rose-400" />,
  },
  {
    id: 'testability-index',
    name: 'Testability Index',
    description:
      'Quantifies how easy it is for an AI to write and run tests for your code.',
    why: 'AI-generated tests verify AI-generated code. Code that is hard to test is harder for AI to maintain.',
    how: 'Analyzes cyclomatic complexity, side-effect density, and external dependency mocking requirements.',
    thresholds: [
      {
        score: '90+',
        label: 'Testable',
        detail: 'Pure functions with isolated side effects.',
      },
      {
        score: '60-80',
        label: 'Complex',
        detail: 'Requires significant mocking to test simple logic.',
      },
      {
        score: '< 40',
        label: 'Untestable',
        detail: 'Tightly coupled to global state or IO.',
      },
    ],
    playbook: [
      'Prefer Pure Functions that take inputs and return outputs.',
      'Use Dependency Injection to make mocking easier for AI agents.',
      'Break down large "God Functions" into smaller, testable units.',
    ],
    examples: {
      bad: `function saveUser(user) {
  // Direct DB call, impossible to test in isolation
  return db.query('INSERT...', user);
}`,
      good: `function saveUser(user, repository = defaultRepo) {
  // Dependency injection allows easy mocking
  return repository.save(user);
}`,
    },
    icon: <TargetIcon className="w-6 h-6 text-orange-400" />,
  },
];

export default function MetricsPage() {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0a0a0f] py-20 px-4">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-blue w-96 h-96 -top-48 -left-48 opacity-20" />
        <div className="orb orb-purple w-96 h-96 bottom-0 right-0 opacity-20" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-cyan-900/30 text-cyan-300 text-sm font-medium rounded-full border border-cyan-500/30"
          >
            <ChartIcon className="w-4 h-4" />
            <span>AI Readiness Methodology</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-6"
          >
            Deep Dive: The{' '}
            <span className="gradient-text-animated">9 Metrics</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Technical methodology, scoring thresholds, and refactoring playbooks
            for AI-first engineering.
          </motion.p>
        </div>

        <div className="space-y-6">
          {metrics.map((metric, index) => (
            <motion.section
              key={metric.id}
              id={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass-card rounded-3xl overflow-hidden scroll-mt-24 border-l-4 border-l-cyan-500/30"
            >
              <div
                className="p-8 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() =>
                  setExpandedMetric(
                    expandedMetric === metric.id ? null : metric.id
                  )
                }
              >
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-shrink-0">
                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-inner">
                      {metric.icon}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">
                        {metric.name}
                      </h2>
                      <span className="text-cyan-500 text-sm font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                        {expandedMetric === metric.id
                          ? 'Hide Details'
                          : 'Deep Dive'}
                      </span>
                    </div>
                    <p className="text-lg text-slate-400 mt-2">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedMetric === metric.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-800/50 overflow-hidden"
                  >
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 bg-slate-900/30">
                      {/* Left Column: Methodology & Thresholds */}
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                            Technical Methodology (The &quot;How&quot;)
                          </h3>
                          <p className="text-slate-300 leading-relaxed">
                            {metric.how}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                            Scoring Thresholds
                          </h3>
                          <div className="space-y-3">
                            {metric.thresholds.map((t) => (
                              <div
                                key={t.score}
                                className="flex items-center gap-4 bg-slate-800/30 p-3 rounded-xl border border-slate-700/30"
                              >
                                <div className="text-lg font-black text-cyan-400 w-16">
                                  {t.score}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-white">
                                    {t.label}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {t.detail}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                            Refactoring Playbook
                          </h3>
                          <ul className="space-y-2">
                            {metric.playbook.map((step, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-sm text-slate-300"
                              >
                                <span className="text-cyan-500 mt-1 font-bold">
                                  {i + 1}.
                                </span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right Column: Comparison */}
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">
                            Before (The Debt)
                          </h3>
                          <div className="rounded-xl overflow-hidden border border-red-500/20 bg-red-950/10">
                            <CodeBlock lang="typescript">
                              {metric.examples.bad}
                            </CodeBlock>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
                            After (AI-Ready)
                          </h3>
                          <div className="rounded-xl overflow-hidden border border-emerald-500/20 bg-emerald-950/10">
                            <CodeBlock lang="typescript">
                              {metric.examples.good}
                            </CodeBlock>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 text-center"
        >
          <Link
            href="/dashboard"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
