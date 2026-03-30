/**
 * Visual utilities for VS Code extension
 */

/**
 * Get color code for a score
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return '#4caf50'; // green
  if (score >= 50) return '#ff9800'; // orange
  return '#f44336'; // red
}

/**
 * Create an ASCII bar chart for a score
 */
export function createBarChart(score: number, width: number = 20): string {
  // Defense against NaN or non-numeric scores
  const safeScore = isNaN(score) ? 0 : Math.max(0, Math.min(100, score));
  const filled = Math.round((safeScore / 100) * width);
  const empty = Math.max(0, width - filled);
  return `█`.repeat(filled) + `░`.repeat(empty);
}
