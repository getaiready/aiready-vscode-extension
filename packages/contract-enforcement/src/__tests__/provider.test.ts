import { describe, it, expect } from 'vitest';
import { CONTRACT_ENFORCEMENT_PROVIDER } from '../provider';

describe('Contract Enforcement Provider', () => {
  it('should have correct ID', () => {
    expect(CONTRACT_ENFORCEMENT_PROVIDER.id).toBe('contract-enforcement');
  });

  it('should have alias', () => {
    expect(CONTRACT_ENFORCEMENT_PROVIDER.alias).toContain('contract');
  });
});
