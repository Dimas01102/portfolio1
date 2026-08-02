export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubContributions {
  total: number;
  days: ContributionDay[];
}

export interface GithubProfileStats {
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
  html_url: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/**
 * Contribution calendar data, including private contributions (if enabled
 * on the GitHub account), via our Supabase Edge Function which queries
 * GitHub's authenticated GraphQL API.
 */
export async function fetchGithubContributions(username: string): Promise<GithubContributions> {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/github-contributions?username=${encodeURIComponent(username)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error('Failed to load GitHub contributions');
  return res.json();
}

/** Basic public profile stats (repo count etc.) via the public GitHub REST API. */
export async function fetchGithubProfile(username: string): Promise<GithubProfileStats> {
  const res = await fetch(`https://api.github.com/users/${username}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load GitHub profile');
  return res.json();
}