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

/**
 * Contribution calendar data (no GitHub token required).
 * Uses the free github-contributions-api mirror, which reads the same
 * data GitHub shows on a profile's contribution graph.
 */
export async function fetchGithubContributions(username: string): Promise<GithubContributions> {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
  if (!res.ok) throw new Error('Failed to load GitHub contributions');
  const json = await res.json();
  const days: ContributionDay[] = (json.contributions || []).map((d: any) => ({
    date: d.date,
    count: d.count,
    level: d.level,
  }));
  const total = days.reduce((sum, d) => sum + d.count, 0);
  return { total, days };
}

/** Basic public profile stats (repo count etc.) via the public GitHub REST API. */
export async function fetchGithubProfile(username: string): Promise<GithubProfileStats> {
  const res = await fetch(`https://api.github.com/users/${username}`);
  if (!res.ok) throw new Error('Failed to load GitHub profile');
  return res.json();
}
