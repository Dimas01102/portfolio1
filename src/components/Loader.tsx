import { useEffect, useRef, useState } from 'react';
import './Loader.css';

const COMMANDS = [
  { cmd: 'npm run build', out: '✓ compiled successfully' },
  { cmd: 'connecting to supabase...', out: '✓ session established' },
  { cmd: 'fetching profile data...', out: '✓ 4 collections loaded' },
];

export default function Loader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [hidden, setHidden] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const start = performance.now();
    const duration = 2200;
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      setStatusIdx(Math.min(COMMANDS.length - 1, Math.floor((pct / 100) * COMMANDS.length)));
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        setTimeout(() => setHidden(true), 350);
        setTimeout(onDone, 750);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`loader ${hidden ? 'loader--hidden' : ''}`} aria-hidden={hidden}>
      <div className="loader__grid" />
      <div className="loader__content">
        <div className="loader__terminal">
          <div className="loader__terminal-bar">
            <span className="dot dot--r" /><span className="dot dot--y" /><span className="dot dot--g" />
            <span className="loader__terminal-title">portfolio@build ~ main</span>
          </div>
          <div className="loader__terminal-body">
            {COMMANDS.slice(0, statusIdx + 1).map((c, i) => (
              <div key={i} className="loader__line">
                <span className="loader__prompt">$</span> {c.cmd}
                {i < statusIdx || progress === 100 ? (
                  <div className="loader__out">{c.out}</div>
                ) : (
                  <span className="loader__cursor" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="loader__brand">
          <span className="loader__brand-mark">{'</>'}</span>
          <span className="loader__brand-text">building the experience</span>
        </div>

        <div className="loader__bar-wrap">
          <div className="loader__bar-bg">
            <div className="loader__bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="loader__pct">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
