import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './games-shared.css';

export function GameHeader({
  title,
  icon,
  progressLabel,
  onExit,
}: {
  title: string;
  icon: string;
  progressLabel?: string;
  onExit: () => void;
}) {
  return (
    <div className="game-header">
      <button className="game-header__exit" onClick={onExit} aria-label="Keluar dari game">
        <i className="bi bi-x-lg" />
      </button>
      <div className="game-header__title">
        <i className={`bi ${icon}`} /> {title}
      </div>
      {progressLabel && <div className="game-header__progress">{progressLabel}</div>}
    </div>
  );
}

export function GameResultScreen({
  score,
  accuracy,
  durationSeconds,
  xp,
  extraStat,
  onPlayAgain,
}: {
  score: number;
  accuracy: number;
  durationSeconds: number;
  xp: number;
  extraStat?: { label: string; value: string | number };
  onPlayAgain: () => void;
}) {
  return (
    <div className="game-result">
      <div className="game-result__badge">
        <i className="bi bi-flag-fill" />
      </div>
      <h3>Sesi selesai!</h3>
      <div className="game-result__stats">
        <div className="game-result__stat">
          <span className="game-result__num">{score}</span>
          <span>Score</span>
        </div>
        <div className="game-result__stat">
          <span className="game-result__num">{accuracy.toFixed(0)}%</span>
          <span>Accuracy</span>
        </div>
        <div className="game-result__stat">
          <span className="game-result__num">{durationSeconds}s</span>
          <span>Time</span>
        </div>
        <div className="game-result__stat">
          <span className="game-result__num">+{xp}</span>
          <span>XP</span>
        </div>
        {extraStat && (
          <div className="game-result__stat">
            <span className="game-result__num">{extraStat.value}</span>
            <span>{extraStat.label}</span>
          </div>
        )}
      </div>
      <div className="game-result__actions">
        <button className="btn btn--primary" onClick={onPlayAgain}>
          <i className="bi bi-arrow-repeat" /> Main lagi
        </button>
        <Link to="/games" className="btn btn--ghost">
          <i className="bi bi-grid" /> Semua game
        </Link>
      </div>
    </div>
  );
}

export function GameCard({ children }: { children: ReactNode }) {
  return <div className="game-card card card-glow">{children}</div>;
}