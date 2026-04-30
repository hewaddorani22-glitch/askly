/**
 * Generate a random 6-character alphanumeric session code.
 */
export function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get or create an anonymous voter ID stored in localStorage.
 */
export function getVoterId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('askly_voter_id');
  if (!id) {
    id = 'anon_' + crypto.randomUUID();
    localStorage.setItem('askly_voter_id', id);
  }
  return id;
}

/**
 * Format relative time (e.g., "2m ago", "1h ago").
 */
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Simple text similarity using Jaccard index on word sets.
 * Returns a value between 0 (no overlap) and 1 (identical).
 */
export function textSimilarity(a: string, b: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9äöüß\s]/g, '').split(/\s+/).filter(Boolean);
  const setA = new Set(normalize(a));
  const setB = new Set(normalize(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  setA.forEach((word) => { if (setB.has(word)) intersection++; });
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}
