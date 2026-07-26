import { useEffect, useMemo, useState } from 'react';
import { fetchGithubContributions, fetchGithubProfile, type ContributionDay } from '../lib/github';
import Reveal from './Reveal';
import Skeleton from './Skeleton';
import './GithubStats.css';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const LEVEL_COLORS = ['var(--gh-l0)', 'var(--gh-l1)', 'var(--gh-l2)', 'var(--gh-l3)', 'var(--gh-l4)'];
const CELL_PITCH = 14; // 11px cell + 3px gap, keep in sync with GithubStats.css
const SNAKE_LEN = 7;
const TICK_MS = 130;

export default function GithubStats({ username }: { username: string }) {
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [total, setTotal] = useState(0);
  const [repos, setRepos] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [headIdx, setHeadIdx] = useState(0);

  useEffect(() => {
    if (!username) {
      setStatus('error');
      return;
    }
    let cancelled = false;
    Promise.all([fetchGithubContributions(username), fetchGithubProfile(username)])
      .then(([contrib, profile]) => {
        if (cancelled) return;
        setDays(contrib.days);
        setTotal(contrib.total);
        setRepos(profile.public_repos);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [username]);

  // group days into weeks (columns), Sunday-first, like GitHub's own graph
  const weeks = useMemo(() => {
    if (!days.length) return [];
    const cols: ContributionDay[][] = [];
    let col: ContributionDay[] = [];
    days.forEach((d, i) => {
      const dow = new Date(d.date + 'T00:00:00').getDay();
      if (i === 0) {
        for (let p = 0; p < dow; p++) col.push({ date: '', count: -1, level: 0 });
      }
      col.push(d);
      if (dow === 6) {
        cols.push(col);
        col = [];
      }
    });
    if (col.length) cols.push(col);
    return cols;
  }, [days]);

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, colIdx) => {
      const firstReal = week.find((d) => d.count >= 0);
      if (!firstReal) return;
      const m = new Date(firstReal.date + 'T00:00:00').getMonth();
      if (m !== lastMonth) {
        labels.push({ label: new Date(firstReal.date + 'T00:00:00').toLocaleString('en', { month: 'short' }), col: colIdx });
        lastMonth = m;
      }
    });
    return labels;
  }, [weeks]);

  // boustrophedon path through real cells, for the little snake to travel
  const snakePath = useMemo(() => {
    const path: { col: number; row: number }[] = [];
    weeks.forEach((week, col) => {
      const rows = week.map((_, r) => r).filter((r) => week[r].count >= 0);
      const ordered = col % 2 === 0 ? rows : [...rows].reverse();
      ordered.forEach((row) => path.push({ col, row }));
    });
    return path;
  }, [weeks]);

  useEffect(() => {
    if (!snakePath.length) return;
    const id = setInterval(() => {
      setHeadIdx((i) => (i + 1) % snakePath.length);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [snakePath.length]);

  const trail = useMemo(() => {
    const t: { col: number; row: number; fade: number }[] = [];
    for (let k = 0; k < SNAKE_LEN; k++) {
      const idx = (headIdx - k + snakePath.length) % (snakePath.length || 1);
      if (snakePath[idx]) t.push({ ...snakePath[idx], fade: k / SNAKE_LEN });
    }
    return t;
  }, [headIdx, snakePath]);

  if (status === 'error') return null;

  return (
    <section id="github" className="section github">
      <div className="container">
        <Reveal>
          <p className="eyebrow">02 — Activity</p>
          <h2 className="section-title">GitHub contributions</h2>
          <p className="section-desc">A live look at how often I ship code, pulled directly from GitHub.</p>
        </Reveal>

        <Reveal delay={80}>
          <div className="github__stat-row">
            <div className="github__stat card card-glow">
              <span className="github__stat-num">{status === 'ready' ? total : <Skeleton width="60px" height="30px" />}</span>
              <span className="github__stat-label">contributions / year</span>
            </div>
            <div className="github__stat card card-glow">
              <span className="github__stat-num">{repos ?? <Skeleton width="40px" height="30px" />}</span>
              <span className="github__stat-label">public repositories</span>
            </div>
            <a
              className="github__stat card card-glow github__stat--link"
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="github__stat-num"><i className="bi bi-github" /></span>
              <span className="github__stat-label">@{username}</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="github__graph card">
            <div className="github__graph-head">
              <span>{status === 'ready' ? `${total} contributions in the last year` : 'Loading contributions…'}</span>
            </div>

            {status === 'loading' && <Skeleton width="100%" height="140px" radius="10px" />}

            {status === 'ready' && (
              <div className="github__graph-scroll">
                <div className="github__graph-body">
                  <div className="github__day-labels">
                    {DAY_LABELS.map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>
                  <div className="github__weeks-wrap">
                    <div className="github__month-labels" style={{ gridTemplateColumns: `repeat(${weeks.length}, 13px)` }}>
                      {weeks.map((_, i) => {
                        const found = monthLabels.find((m) => m.col === i);
                        return <span key={i}>{found?.label}</span>;
                      })}
                    </div>
                    <div className="github__weeks-rel">
                      <div className="github__weeks">
                        {weeks.map((week, wi) => (
                          <div className="github__week" key={wi}>
                            {week.map((d, di) => (
                              <span
                                key={di}
                                className="github__day"
                                style={{ background: d.count < 0 ? 'transparent' : LEVEL_COLORS[d.level] }}
                                title={d.count >= 0 ? `${d.count} contributions on ${d.date}` : undefined}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                      {trail.map((seg, i) => (
                        <span
                          key={i}
                          className="github__snake-seg"
                          style={{
                            left: seg.col * CELL_PITCH,
                            top: seg.row * CELL_PITCH,
                            opacity: 1 - seg.fade * 0.85,
                            transform: `scale(${1 - seg.fade * 0.4})`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="github__legend">
              <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer">
                View full profile ↗
              </a>
              <div className="github__legend-scale">
                Less
                {LEVEL_COLORS.map((c, i) => (
                  <span key={i} className="github__day" style={{ background: c }} />
                ))}
                More
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
