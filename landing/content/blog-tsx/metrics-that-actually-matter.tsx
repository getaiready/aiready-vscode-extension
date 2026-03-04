import meta from './metrics-that-actually-matter.meta';
import React from 'react';
import CodeBlock from '../../components/CodeBlock';

const Post = () => (
  <>
    <p>
      For decades, software teams have relied on metrics like cyclomatic
      complexity, code coverage, and lint warnings to measure code quality.
      These tools were designed for human reviewers. But as AI-assisted
      development becomes the norm, these old metrics are no longer enough. AI
      models don’t “see” code the way humans do. They don’t care about your
      coverage percentage or how many branches your function has. What matters
      is how much context they can fit, how consistent your patterns are, and
      how much semantic duplication lurks beneath the surface.
    </p>
    <p>
      That’s why we built <strong>AIReady</strong>: to measure the 9 core
      dimensions of AI-readiness.
    </p>

    <h2>Why Traditional Metrics Fall Short</h2>
    <p>
      Traditional tools answer &quot;Is this code maintainable for a
      human?&quot; AIReady answers &quot;Is this code understandable for an
      AI?&quot;
    </p>
    <p>
      An AI&apos;s &quot;understanding&quot; is limited by its{' '}
      <strong>context window</strong> and its ability to{' '}
      <strong>predict patterns</strong>. When your codebase is fragmented,
      inconsistent, or full of boilerplate, you are essentially
      &quot;blinding&quot; the AI, leading to hallucinations, broken
      suggestions, and subtle bugs.
    </p>

    <div className="my-12 max-w-2xl mx-auto">
      <img
        src="/series-3-metrics-that-matters.png"
        alt="The Nine Dimensions of AI-Readiness"
        className="rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 w-full"
      />
      <p className="text-center text-sm text-slate-500 mt-4 italic">
        We&apos;ve identified 9 critical metrics that determine how well an AI
        agent can navigate, understand, and modify your codebase.
      </p>
    </div>

    <h2>The 9 Dimensions of AI-Readiness: Technical Deep Dive</h2>

    <div className="space-y-12 my-12">
      {/* 1. Semantic Duplicates */}
      <section>
        <h3 className="text-2xl font-bold mb-4">1. Semantic Duplicates</h3>
        <p className="mb-4">
          <strong>The Problem:</strong> Logic that is repeated but written in
          different ways. AI models get confused when the same logic exists in
          multiple places, often updating only one and leaving the others as
          &quot;logic debt.&quot;
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Technical Methodology
            </h4>
            <p className="text-sm">
              Uses Jaccard similarity on AST (Abstract Syntax Tree) tokens to
              identify structurally identical logic, ignoring variable name or
              formatting changes.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Scoring Thresholds
            </h4>
            <ul className="text-sm space-y-1">
              <li>
                <strong>90+:</strong> &lt; 1% duplication across domain logic.
              </li>
              <li>
                <strong>&lt; 50:</strong> Core business logic repeated in
                multiple places.
              </li>
            </ul>
          </div>
        </div>
        <h4 className="text-sm font-bold mb-2 uppercase tracking-widest text-slate-500">
          Good vs. Bad Example
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CodeBlock lang="typescript">{`
// BAD: Logic drift
function validate(u) {
  return u.id && u.email.includes('@');
}
const isValid = (user) => {
  return user.id && user.email.indexOf('@') !== -1;
}
          `}</CodeBlock>
          <CodeBlock lang="typescript">{`
// GOOD: Unified validator
export const isUserValid = (user: User) => {
  return !!(user.id && user.email.includes('@'));
};
          `}</CodeBlock>
        </div>
      </section>

      {/* 2. Context Fragmentation */}
      <section>
        <h3 className="text-2xl font-bold mb-4">2. Context Fragmentation</h3>
        <p className="mb-4">
          <strong>The Problem:</strong> Analyzes how scattered related logic is
          across the codebase. AI has a limited context window. If a single
          feature is spread across 15 folders, the AI cannot &quot;see&quot; the
          whole picture at once.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Technical Methodology
            </h4>
            <p className="text-sm">
              Calculates the &quot;Token Distance&quot; between a file and its
              dependencies by recursively traversing the import graph.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Scoring Thresholds
            </h4>
            <ul className="text-sm space-y-1">
              <li>
                <strong>90+:</strong> Related logic is contained within 1-3
                files.
              </li>
              <li>
                <strong>&lt; 40:</strong> Requires 15+ files to understand a
                single feature.
              </li>
            </ul>
          </div>
        </div>
        <h4 className="text-sm font-bold mb-2 uppercase tracking-widest text-slate-500">
          Good vs. Bad Example
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CodeBlock lang="typescript">{`
// BAD: Fragmented imports
import { UserType } from '../../types/user';
import { saveUser } from '../../api/user';
import { validateUser } from '../../utils/validation';
          `}</CodeBlock>
          <CodeBlock lang="typescript">{`
// GOOD: Cohesive feature module
import { UserType, saveUser, validateUser } from '../features/user';
          `}</CodeBlock>
        </div>
      </section>

      {/* 3. Naming Consistency */}
      <section>
        <h3 className="text-2xl font-bold mb-4">3. Naming Consistency</h3>
        <p className="mb-4">
          <strong>The Problem:</strong> Measures naming drift. AI predicts code
          based on patterns. Inconsistent naming (e.g., mixing{' '}
          <code>getUser</code> and <code>fetchAccount</code>) breaks these
          patterns and reduces accuracy.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Technical Methodology
            </h4>
            <p className="text-sm">
              Uses token entropy and lexical pattern matching to detect naming
              drift across similar domain entities.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Scoring Thresholds
            </h4>
            <ul className="text-sm space-y-1">
              <li>
                <strong>95+:</strong> Unified naming convention across the
                entire project.
              </li>
              <li>
                <strong>&lt; 60:</strong> Multiple competing conventions (e.g.
                CamelCase vs snake_case).
              </li>
            </ul>
          </div>
        </div>
        <h4 className="text-sm font-bold mb-2 uppercase tracking-widest text-slate-500">
          Good vs. Bad Example
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CodeBlock lang="typescript">{`
// BAD: Inconsistent verbs
function getUser() { ... }
function fetchAccount() { ... }
function retrieveProfile() { ... }
          `}</CodeBlock>
          <CodeBlock lang="typescript">{`
// GOOD: Consistent patterns
function getUser() { ... }
function getAccount() { ... }
function getProfile() { ... }
          `}</CodeBlock>
        </div>
      </section>

      {/* 4. Dependency Health */}
      <section>
        <h3 className="text-2xl font-bold mb-4">4. Dependency Health</h3>
        <p className="mb-4">
          <strong>The Problem:</strong> AI models often suggest outdated or
          insecure packages if your project is stuck on old versions. A clean
          dependency graph keeps AI suggestions modern and safe.
        </p>
        <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Technical Methodology
          </h4>
          <p className="text-sm">
            Cross-references your dependency graph with CVE databases and
            ecosystem staleness metrics to identify risk and maintenance debt.
          </p>
        </div>
        <h4 className="text-sm font-bold mb-2 uppercase tracking-widest text-slate-500">
          Good vs. Bad Example
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CodeBlock lang="json">{`
// BAD: Deprecated dependencies
"dependencies": {
  "moment": "^2.24.0",
  "lodash": "^3.0.0"
}
          `}</CodeBlock>
          <CodeBlock lang="json">{`
// GOOD: Modern alternatives
"dependencies": {
  "date-fns": "^4.0.0",
  "zod": "^3.23.0"
}
          `}</CodeBlock>
        </div>
      </section>

      {/* 5. Change Amplification */}
      <section>
        <h3 className="text-2xl font-bold mb-4">5. Change Amplification</h3>
        <p className="mb-4">
          <strong>The Problem:</strong> Tracks ripple effects. AI struggles with
          high coupling. If one change requires 10 files to be updated, the AI
          is significantly more likely to miss a spot.
        </p>
        <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Technical Methodology
          </h4>
          <p className="text-sm">
            Measures &quot;Coupling Density&quot; by analyzing co-change
            frequency and shared constant usage across module boundaries.
          </p>
        </div>
        <h4 className="text-sm font-bold mb-2 uppercase tracking-widest text-slate-500">
          Good vs. Bad Example
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CodeBlock lang="typescript">{`
// BAD: Hardcoded coupling
// In 10 separate files
const API = 'https://api.v1.old.com';
          `}</CodeBlock>
          <CodeBlock lang="typescript">{`
// GOOD: Centralized config
import { config } from '@/config';
const API = config.api.baseUrl;
          `}</CodeBlock>
        </div>
      </section>

      {/* 6. AI Signal Clarity */}
      <section>
        <h3 className="text-2xl font-bold mb-4">6. AI Signal Clarity</h3>
        <p className="mb-4">
          <strong>The Problem:</strong> Excess boilerplate wastes the AI&apos;s
          context window. More &quot;signal&quot; means the AI can spend its
          tokens on the logic that actually matters.
        </p>
        <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Technical Methodology
          </h4>
          <p className="text-sm">
            Uses a signal-to-noise algorithm that weights domain-specific logic
            against framework boilerplate and unused code segments.
          </p>
        </div>
        <h4 className="text-sm font-bold mb-2 uppercase tracking-widest text-slate-500">
          Good vs. Bad Example
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CodeBlock lang="typescript">{`
// BAD: High boilerplate
class UserComponent extends React.Component {
  constructor(props) { ... }
  render() { ... }
}
          `}</CodeBlock>
          <CodeBlock lang="typescript">{`
// GOOD: High signal
const UserComponent = ({ user }) => (
  <div>{user.name}</div>
);
          `}</CodeBlock>
        </div>
      </section>

      {/* 7. Documentation Health */}
      <section>
        <h3 className="text-2xl font-bold mb-4">7. Documentation Health</h3>
        <p className="mb-4">
          <strong>The Problem:</strong> AI relies on docstrings to understand
          intent. Outdated docs lead to &quot;hallucinations&quot; where the AI
          assumes behavior that no longer exists.
        </p>
        <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Technical Methodology
          </h4>
          <p className="text-sm">
            Analyzes the semantic alignment between docstrings and
            implementation using a &quot;Drift Detection&quot; algorithm.
          </p>
        </div>
        <h4 className="text-sm font-bold mb-2 uppercase tracking-widest text-slate-500">
          Good vs. Bad Example
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CodeBlock lang="typescript">{`
// BAD: Misleading docs
/** Returns user age */
function getUserEmail(id) { ... }
          `}</CodeBlock>
          <CodeBlock lang="typescript">{`
// GOOD: Precise context
/** Fetches user email by ID */
function getUserEmail(id: string) { ... }
          `}</CodeBlock>
        </div>
      </section>

      {/* 8. Agent Grounding */}
      <section>
        <h3 className="text-2xl font-bold mb-4">8. Agent Grounding</h3>
        <p className="mb-4">
          <strong>The Problem:</strong> Standard structures allow AI agents to
          navigate autonomously. Confusing layouts make agents &quot;get
          lost&quot; during multi-file operations.
        </p>
        <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Technical Methodology
          </h4>
          <p className="text-sm">
            Evaluates project topology against &quot;Discovery Benchmarks&quot;
            for common frameworks (React, Next.js, FastAPI, etc.).
          </p>
        </div>
        <h4 className="text-sm font-bold mb-2 uppercase tracking-widest text-slate-500">
          Good vs. Bad Example
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CodeBlock lang="text">{`
// BAD: Deeply nested noise
src/stuff/logic/user/
  implementation_v2/
    actual_code.ts
          `}</CodeBlock>
          <CodeBlock lang="text">{`
// GOOD: Standardized paths
src/features/user/
  user.service.ts
          `}</CodeBlock>
        </div>
      </section>

      {/* 9. Testability Index */}
      <section>
        <h3 className="text-2xl font-bold mb-4">9. Testability Index</h3>
        <p className="mb-4">
          <strong>The Problem:</strong> AI-generated tests verify AI-generated
          code. Code that is hard to test is inherently harder for an AI to
          maintain safely.
        </p>
        <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Technical Methodology
          </h4>
          <p className="text-sm">
            Analyzes cyclomatic complexity, side-effect density, and external
            dependency mocking requirements.
          </p>
        </div>
        <h4 className="text-sm font-bold mb-2 uppercase tracking-widest text-slate-500">
          Good vs. Bad Example
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CodeBlock lang="typescript">{`
// BAD: Tightly coupled IO
function saveUser(user) {
  return db.query('INSERT...', user);
}
          `}</CodeBlock>
          <CodeBlock lang="typescript">{`
// GOOD: Injected dependency
function saveUser(user, repo = db) {
  return repo.save(user);
}
          `}</CodeBlock>
        </div>
      </section>
    </div>

    <h2>How to Start Measuring</h2>
    <p>
      AIReady provides a unified CLI to scan your codebase against all 9
      dimensions:
    </p>

    <CodeBlock lang="bash">{`
npx @aiready/cli scan --score
`}</CodeBlock>

    <p>
      This command gives you an overall{' '}
      <strong>AI Readiness Score (0-100)</strong> and a detailed breakdown of
      where your biggest &quot;AI Debt&quot; lies.
    </p>

    <h2>Conclusion</h2>
    <p>
      If you&apos;re still measuring code quality with tools built for humans,
      you&apos;re missing the real blockers to AI productivity. AIReady gives
      you the metrics that actually matter—so you can build codebases that are
      ready for the future.
    </p>

    <p>
      <strong>Try it yourself:</strong>
    </p>
    <CodeBlock lang="bash">{`
npx @aiready/cli scan . --score
`}</CodeBlock>

    <p>
      <strong>
        Have questions or want to share your AI code quality story?
      </strong>{' '}
      Drop them in the comments. I read every one.
    </p>

    <p>
      <strong>Resources:</strong>
    </p>
    <ul className="list-disc pl-6 mb-4 space-y-2">
      <li>
        GitHub:{' '}
        <a href="https://github.com/caopengau/aiready-cli">
          github.com/caopengau/aiready-cli
        </a>
      </li>
      <li>
        Docs: <a href="https://aiready.dev">aiready.dev</a>
      </li>
      <li>
        Report issues:{' '}
        <a href="https://github.com/caopengau/aiready-cli/issues">
          github.com/caopengau/aiready-cli/issues
        </a>
      </li>
    </ul>

    <hr className="my-12 border-slate-200 dark:border-zinc-800" />

    <p>
      <strong>Read the full series:</strong>
    </p>
    <ul className="list-disc pl-6 mb-4 space-y-2">
      <li>
        <a href="/blog/ai-code-debt-tsunami">
          Part 1: The AI Code Debt Tsunami is Here (And We&apos;re Not Ready)
        </a>
      </li>
      <li>
        <a href="/blog/invisible-codebase">
          Part 2: Why Your Codebase is Invisible to AI (And What to Do About It)
        </a>
      </li>
      <li>
        <strong>
          Part 3: AI Code Quality Metrics That Actually Matter ← You are here
        </strong>
      </li>
      <li>
        <a href="/blog/semantic-duplicate-detection">
          Part 4: Deep Dive: Semantic Duplicate Detection with AST Analysis
        </a>
      </li>
      <li>
        <a href="/blog/hidden-cost-import-chains">
          Part 5: The Hidden Cost of Import Chains
        </a>
      </li>
      <li>
        <a href="/blog/visualizing-invisible">
          Part 6: Visualizing the Invisible: Seeing the Shape of AI Code Debt
        </a>
      </li>
    </ul>

    <hr className="my-12 border-slate-200 dark:border-zinc-800" />

    <p className="text-sm italic text-slate-500">
      *Peng Cao is the founder of{' '}
      <a href="https://receiptclaimer.com">receiptclaimer</a> and creator of{' '}
      <a href="https://github.com/caopengau/aiready-cli">aiready</a>, an
      open-source suite for measuring and optimizing codebases for AI adoption.*
    </p>
  </>
);

export default Post;
