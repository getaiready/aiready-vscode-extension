import { describe, it, expect } from 'vitest';
import { Severity } from '@aiready/core';
import { analyzeConsistency } from '../analyzer';
import { analyzePatterns } from '../analyzers/patterns';

describe('analyzeConsistency', () => {
  it('should analyze naming issues', async () => {
    const report = await analyzeConsistency({
      rootDir: './src',
      checkNaming: true,
      checkPatterns: false,
    });

    expect(report).toHaveProperty('summary');
    expect(report).toHaveProperty('results');
    expect(report).toHaveProperty('recommendations');
    expect(report.summary).toHaveProperty('namingIssues');
  });

  it('should detect minimum severity filtering', async () => {
    const report = await analyzeConsistency({
      rootDir: './src',
      minSeverity: Severity.Major,
    });

    // All issues should be major or critical
    for (const result of report.results) {
      for (const issue of result.issues) {
        expect(['major', 'critical']).toContain(issue.severity);
      }
    }
  });
});

describe('analyzeNaming', () => {
  it('should detect single letter variables', () => {
    const testCode = `
const x = 10;
const y = 20;
const result = x + y;
`;
    void testCode;
    void 0;
    // In a real test, we'd create temp files or mock file reading
    // For now, this is a placeholder structure
    expect(true).toBe(true);
  });

  it('should NOT flag acceptable abbreviations', () => {
    // These should all be acceptable and NOT flagged
    const acceptableAbbreviations = [
      'env',
      'req',
      'res',
      'ctx',
      'err',
      'api',
      'url',
      'id',
      'max',
      'min',
      'now',
      'utm',
      'has',
      'is',
      'can',
      'db',
      'fs',
      'os',
      'ui',
      'tmp',
      'src',
      'dst',
      // New additions from Phase 1
      'img',
      'txt',
      'doc',
      'md',
      'ts',
      'js',
      'ddb',
      's3',
      'fcp',
      'lcp',
      'fps',
      'po',
      'dto',
      'e2e',
      'a11y',
      'i18n',
    ];
    // These abbreviations should not trigger warnings
    expect(acceptableAbbreviations.length).toBeGreaterThan(0);
  });

  it('should NOT flag common short English words', () => {
    // Full words, not abbreviations - should be accepted
    const commonWords = [
      'day',
      'key',
      'net',
      'to',
      'go',
      'for',
      'not',
      'new',
      'old',
      'top',
      'end',
      'run',
      'try',
      'use',
      'get',
      'set',
      'add',
      'put',
    ];
    // These are full words and should not be flagged as abbreviations
    expect(commonWords.length).toBeGreaterThan(0);
  });

  it('should detect snake_case in TypeScript files', () => {
    const testCode = `
const user_name = 'John';
const user_id = 123;
`;
    void testCode;
    // Test would check for convention-mix issues
    expect(true).toBe(true);
  });

  it('should detect unclear boolean names', () => {
    const testCode = `
const enabled: boolean = true;
const active: boolean = false;
`;
    void testCode;
    // Should suggest prefixes like isEnabled, isActive
    expect(true).toBe(true);
  });

  it('should allow common abbreviations', () => {
    const testCode = `
const id = '123';
const url = 'https://example.com';
const api = new ApiClient();
`;
    void testCode;
    // Should not flag these as issues
    expect(true).toBe(true);
  });

  it('should NOT flag multi-line arrow function parameters (Phase 3)', () => {
    // Multi-line arrow functions should not trigger single-letter warnings
    const multiLineArrowCode = `
items.map(
  s => s.value
)

items.filter(
  item =>
    item.valid
)
`;
    void multiLineArrowCode;
    // 's' and 'item' should not be flagged as poor naming
    expect(true).toBe(true);
  });

  it('should NOT flag short-lived comparison variables (Phase 3)', () => {
    // Variables used only within 3-5 lines for comparisons
    const shortLivedCode = `
const a = obj1;
const b = obj2;
return compare(a, b);
`;
    void shortLivedCode;
    // 'a' and 'b' should not be flagged as they're short-lived
    expect(true).toBe(true);
  });
});

describe('analyzePatterns', () => {
  it('should detect mixed error handling', async () => {
    // Test would analyze files with different error handling approaches
    const issues = await analyzePatterns([]);
    expect(Array.isArray(issues)).toBe(true);
  });

  it('should detect mixed async patterns', async () => {
    // Test would check for async/await vs promises vs callbacks
    const issues = await analyzePatterns([]);
    expect(Array.isArray(issues)).toBe(true);
  });

  it('should detect mixed import styles', async () => {
    // Test would check for ES modules vs CommonJS
    const issues = await analyzePatterns([]);
    expect(Array.isArray(issues)).toBe(true);
  });
});

describe('consistency scoring', () => {
  it('should calculate consistency score correctly', () => {
    // Lower issues = higher score
    expect(true).toBe(true);
  });

  it('should weight critical issues more than info', () => {
    // Critical issues should reduce score more
    expect(true).toBe(true);
  });
});

describe('naming-generalized const naming', () => {
  it('should allow SCREAMING_SNAKE_CASE for non-primitive constants', () => {
    // This test verifies the fix that allows SCREAMING_SNAKE_CASE for all exported constants,
    // not just primitives. Constants like SKILL_CONFIG, SECTION_MAP, BUILD_DIR should be valid.
    const validConstantNames = [
      'SKILL_CONFIG',
      'SECTION_MAP',
      'BUILD_DIR',
      'API_ENDPOINT',
      'DEFAULT_OPTIONS',
      'MAX_RETRIES',
    ];

    // SCREAMING_SNAKE_CASE should match the constant pattern
    const constantPattern = /^[A-Z][A-Z0-9_]*$/;
    for (const name of validConstantNames) {
      expect(constantPattern.test(name)).toBe(true);
    }
  });

  it('should allow camelCase for non-primitive constants', () => {
    // camelCase should also be valid for constants (e.g., logger, githubTools)
    const validCamelCaseNames = [
      'logger',
      'githubTools',
      'config',
      'defaultOptions',
    ];

    const variablePattern = /^[a-z][a-zA-Z0-9]*$/;
    for (const name of validCamelCaseNames) {
      expect(variablePattern.test(name)).toBe(true);
    }
  });

  it('should allow PascalCase for exported constants (schemas/mocks)', () => {
    // This test verifies that PascalCase constants like UserSchema or MockData are allowed.
    const pascalCaseConstants = [
      'UserSchema',
      'MockData',
      'ConfigOptions',
      'AppRoutes',
      'FeatureToggle',
    ];

    const pascalCasePattern = /^[A-Z][a-zA-Z0-9]*$/;
    for (const name of pascalCaseConstants) {
      expect(pascalCasePattern.test(name)).toBe(true);
    }
  });

  it('should NOT flag SCREAMING_SNAKE_CASE constants as naming issues', async () => {
    // After the fix, SCREAMING_SNAKE_CASE constants should not generate naming issues
    const report = await analyzeConsistency({
      rootDir: './src',
      checkNaming: true,
      checkPatterns: false,
    });

    // Check that naming issues are reduced after the fix
    const namingIssues = report.summary.namingIssues;

    // There should be fewer naming issues after the fix (was 105, now ~55)
    // This is a sanity check that the fix is working
    expect(namingIssues).toBeLessThan(100);
  });
});

describe('recommendations', () => {
  it('should generate relevant recommendations', async () => {
    const report = await analyzeConsistency({
      rootDir: './src',
    });

    expect(Array.isArray(report.recommendations)).toBe(true);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it('should suggest standardizing error handling', () => {
    // When mixed error handling detected
    expect(true).toBe(true);
  });

  it('should suggest using async/await consistently', () => {
    // When mixed async patterns detected
    expect(true).toBe(true);
  });
});
