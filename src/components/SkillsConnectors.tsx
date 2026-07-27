import { useEffect, useRef, useState } from 'react';

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const MAX_LINES = 40; // hard safety cap so a huge skills list can never flood the DOM/paint cost

export default function SkillsConnectors({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    function compute() {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-skill-node]'));
      const points = cards.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - rect.left, y: r.top + r.height / 2 - rect.top };
      });

      const seen = new Set<string>();
      const next: Line[] = [];
      points.forEach((p, i) => {
        if (next.length >= MAX_LINES) return;
        const nearest = points
          .map((q, j) => ({ j, d: i === j ? Infinity : Math.hypot(p.x - q.x, p.y - q.y) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, 2);
        nearest.forEach(({ j }) => {
          if (next.length >= MAX_LINES) return;
          const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
          if (seen.has(key)) return;
          seen.add(key);
          next.push({ x1: p.x, y1: p.y, x2: points[j].x, y2: points[j].y });
        });
      });

      setLines(next);
      setBox({ w: rect.width, h: rect.height });
    }

    // wait for entrance/reveal animations to settle before measuring
    const initial = setTimeout(compute, 750);
    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(compute);
    };
    const ro = new ResizeObserver(onResize);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(initial);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!lines.length || !box.w) return null;

  return (
    <svg className="skills__mesh" viewBox={`0 0 ${box.w} ${box.h}`} preserveAspectRatio="none" aria-hidden="true">
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          className="skills__mesh-line"
          style={{ animationDelay: `${(i % 8) * 0.12}s` }}
        />
      ))}
    </svg>
  );
}