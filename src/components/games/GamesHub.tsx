import { Link } from 'react-router-dom';
import { GAME_META } from '../../lib/games/constants';
import './GamesHub.css';

const ORDER: (keyof typeof GAME_META)[] = ['bug-hunter', 'memory-card', 'code-output', 'fix-the-code'];

export default function GamesHub() {
  return (
    <div className="container games-hub">
      <span className="eyebrow">Mini Games</span>
      <h2 className="section-title">Uji kemampuanmu sambil santai</h2>
      <p className="games-hub__lead">
        Empat tantangan singkat seputar programming, dirancang untuk menunjukkan cara berpikir problem solving,
        bukan sekadar hiburan.
      </p>

      <div className="games-hub__grid">
        {ORDER.map((key) => {
          const meta = GAME_META[key];
          return (
            <Link key={key} to={`/games/${key}`} className="game-tile card card-glow" style={{ ['--tile-accent' as string]: meta.accent }}>
              <div className="game-tile__icon">
                <i className={`bi ${meta.icon}`} />
              </div>
              <h3>{meta.title}</h3>
              <p>{meta.tagline}</p>
              <span className="game-tile__cta">
                Mainkan <i className="bi bi-arrow-right" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}