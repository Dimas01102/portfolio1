import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { GAME_META } from '../../lib/games/constants';
import type { GameAnalytics } from '../../types/games';

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="card card-glow admin-count-card">
      <span className="admin-count-num">
        <i className={`bi ${icon}`} style={{ fontSize: '0.7em', marginRight: 8, opacity: 0.6 }} />
        {value}
      </span>
      <span>{label}</span>
    </div>
  );
}

export default function AdminGames() {
  const [data, setData] = useState<GameAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_game_analytics');
      if (rpcError) {
        setError(rpcError.message);
      } else {
        setData(rpcData as GameAnalytics);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="admin-h1">Mini Games Analytics</h1>
      <p className="admin-sub">Read-only overview. Soal dibuat otomatis oleh AI, tidak ada CRUD di sini.</p>

      {loading && <p className="admin-sub">Memuat data...</p>}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      {data && (
        <>
          <div className="admin-grid-cards">
            <StatCard label="Total Player" value={data.total_players} icon="bi-people" />
            <StatCard label="Total Session" value={data.total_sessions} icon="bi-controller" />
            <StatCard label="Average Score" value={data.average_score} icon="bi-graph-up" />
            <StatCard label="Average Accuracy" value={`${data.average_accuracy}%`} icon="bi-bullseye" />
            <StatCard label="Average Time" value={`${data.average_time}s`} icon="bi-stopwatch" />
            <StatCard label="Completion Rate" value={`${data.completion_rate}%`} icon="bi-check2-circle" />
            <StatCard label="Total XP Earned" value={data.total_xp} icon="bi-lightning-charge" />
            <StatCard
              label="Most Played Game"
              value={data.most_played_game ? GAME_META[data.most_played_game]?.title ?? data.most_played_game : '—'}
              icon="bi-star"
            />
            <StatCard label="Most Common Language" value={data.most_common_language ?? '—'} icon="bi-code-slash" />
            <StatCard label="Top Achievement" value={data.top_achievement ?? '—'} icon="bi-trophy" />
            <StatCard label="Daily Active Players" value={data.daily_active_players} icon="bi-sun" />
            <StatCard label="Weekly Active Players" value={data.weekly_active_players} icon="bi-calendar-week" />
            <StatCard label="Monthly Active Players" value={data.monthly_active_players} icon="bi-calendar-month" />
          </div>

          <h2 className="admin-h1" style={{ fontSize: '1.15rem', marginTop: 36 }}>Sessions per Game</h2>
          <div className="admin-grid-cards">
            {Object.entries(GAME_META).map(([key, meta]) => (
              <StatCard key={key} label={meta.title} value={data.sessions_by_game?.[key] ?? 0} icon={meta.icon} />
            ))}
          </div>

          <h2 className="admin-h1" style={{ fontSize: '1.15rem', marginTop: 36 }}>Difficulty Distribution</h2>
          <div className="admin-grid-cards">
            <StatCard label="Easy" value={data.difficulty_distribution?.easy ?? 0} icon="bi-emoji-smile" />
            <StatCard label="Medium" value={data.difficulty_distribution?.medium ?? 0} icon="bi-emoji-neutral" />
            <StatCard label="Hard" value={data.difficulty_distribution?.hard ?? 0} icon="bi-emoji-dizzy" />
          </div>
        </>
      )}
    </div>
  );
}