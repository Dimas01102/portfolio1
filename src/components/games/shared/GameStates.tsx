import Skeleton from '../../Skeleton';
import './games-shared.css';

export function GameLoadingState({ label = 'Menyiapkan soal...' }: { label?: string }) {
  return (
    <div className="game-state game-state--loading" role="status" aria-live="polite">
      <Skeleton width="60%" height="22px" />
      <Skeleton width="100%" height="140px" radius="12px" />
      <div className="game-state__row">
        <Skeleton width="48%" height="46px" radius="8px" />
        <Skeleton width="48%" height="46px" radius="8px" />
      </div>
      <div className="game-state__row">
        <Skeleton width="48%" height="46px" radius="8px" />
        <Skeleton width="48%" height="46px" radius="8px" />
      </div>
      <p className="game-state__label">{label}</p>
    </div>
  );
}

export function GameErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="game-state game-state--error" role="alert">
      <i className="bi bi-exclamation-triangle" />
      <p>{message}</p>
      <button className="btn btn--primary" onClick={onRetry}>
        <i className="bi bi-arrow-clockwise" /> Coba lagi
      </button>
    </div>
  );
}

export function CountdownBadge({ seconds, danger }: { seconds: number; danger?: boolean }) {
  return (
    <div className={`game-countdown ${danger ? 'is-danger' : ''}`}>
      <i className="bi bi-stopwatch" />
      <span>{seconds}s</span>
    </div>
  );
}