import { describe, it, expect } from 'vitest';
import { createBarChart, getScoreColor } from '../visual';

describe('visual utilities', () => {
  describe('createBarChart', () => {
    it('should create a bar chart for valid scores', () => {
      expect(createBarChart(100, 10)).toBe('██████████');
      expect(createBarChart(0, 10)).toBe('░░░░░░░░░░');
      expect(createBarChart(50, 10)).toBe('█████░░░░░');
    });

    it('should handle NaN gracefully', () => {
      expect(createBarChart(NaN, 10)).toBe('░░░░░░░░░░');
    });

    it('should handle scores > 100 gracefully', () => {
      expect(createBarChart(150, 10)).toBe('██████████');
    });

    it('should handle scores < 0 gracefully', () => {
      expect(createBarChart(-50, 10)).toBe('░░░░░░░░░░');
    });

    it('should default width to 20', () => {
      const bar = createBarChart(50);
      expect(bar.length).toBe(20);
      expect(bar).toBe('██████████░░░░░░░░░░');
    });
  });

  describe('getScoreColor', () => {
    it('should return green for high scores', () => {
      expect(getScoreColor(70)).toBe('#4caf50');
      expect(getScoreColor(100)).toBe('#4caf50');
    });

    it('should return orange for medium scores', () => {
      expect(getScoreColor(50)).toBe('#ff9800');
      expect(getScoreColor(69)).toBe('#ff9800');
    });

    it('should return red for low scores', () => {
      expect(getScoreColor(0)).toBe('#f44336');
      expect(getScoreColor(49)).toBe('#f44336');
    });
  });
});
