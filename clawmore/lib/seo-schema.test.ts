import { describe, it, expect } from 'vitest';
import {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateWebSiteSchema,
  aiMetaTags,
  CLAWMORE_BASE_URL,
} from './seo-schema';

describe('clawmore seo-schema', () => {
  it('should generate valid organization schema', () => {
    const schema: any = generateOrganizationSchema();
    expect(schema['@type']).toBe('Organization');
    expect(schema.url).toBe(CLAWMORE_BASE_URL);
    expect(schema.logo.url).toContain('logo-raw-512.png');
  });

  it('should generate valid software application schema', () => {
    const schema: any = generateSoftwareApplicationSchema();
    expect(schema['@type']).toBe('SoftwareApplication');
    expect(schema.name).toBe('ClawMore');
    expect(schema['@id']).toBe(`${CLAWMORE_BASE_URL}/#software`);
  });

  it('should generate valid website schema', () => {
    const schema: any = generateWebSiteSchema();
    expect(schema['@type']).toBe('WebSite');
    expect(schema.url).toBe(CLAWMORE_BASE_URL);
  });

  it('should have comprehensive AI meta tags', () => {
    expect(aiMetaTags.chatgpt).toBeDefined();
    expect(aiMetaTags.perplexity).toBeDefined();
    expect(aiMetaTags.general).toBeDefined();
    expect(aiMetaTags.general['ai:summary']).toBeDefined();
  });
});
