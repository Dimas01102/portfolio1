import { useEffect, useState } from 'react';
import './games-shared.css';

export function XPBar({ xp }: { xp: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = display;
    const duration = 700;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(from + (xp - from) * t));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xp]);

  return (
    <div className="game-xp">
      <i className="bi bi-lightning-charge-fill" />
      <span className="game-xp__value">+{display} XP</span>
    </div>
  );
}

export function AchievementPopup({
  title,
  icon,
  visible,
  onClose,
}: {
  title: string;
  icon: string;
  visible: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="achievement-popup" role="status">
      <div className="achievement-popup__icon">
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <div className="achievement-popup__eyebrow">Achievement Unlocked</div>
        <div className="achievement-popup__title">{title}</div>
      </div>
    </div>
  );
}