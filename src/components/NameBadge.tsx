import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './NameBadge.css';

interface NameBadgeProps {
  photoUrl?: string | null;
  name: string;
  role: string;
}

function idFromName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return String(1000 + (h % 8999)).padStart(4, '0');
}

export default function NameBadge({ photoUrl, name, role }: NameBadgeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const stringRef = useRef<SVGPathElement>(null);
  const stringHighlightRef = useRef<SVGPathElement>(null);

  // Physics state kept in refs so dragging never triggers React re-renders.
  const pos = useRef({ x: 0, y: 0 }); // current offset of the card from rest
  const vel = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 }); // where it's being dragged to
  const dragging = useRef(false);
  const pointerId = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);
  const lastMove = useRef({ x: 0, y: 0, t: 0 });
  const [entered, setEntered] = useState(false);
  const [visible, setVisible] = useState(false);

  const ANCHOR_Y = -6; // px, top attachment point relative to wrap
  const REST_DROP = 84; // px, string length at rest (matches card's CSS top)
  // No distance/velocity limit here on purpose — the badge is free to fly as far
  // as a drag/flick sends it, just like the original. Page-wide horizontal scroll
  // is instead hard-blocked globally via overflow-x: hidden on html/body/#root
  // (see index.css), so letting the badge itself travel unrestricted is safe.

  const clampRadial = (x: number, y: number) => ({ x, y });

  const applyTransform = useCallback((rawX: number, rawY: number) => {
    const card = cardRef.current;
    const string = stringRef.current;
    const highlight = stringHighlightRef.current;
    if (!card) return;

    const { x, y } = clampRadial(rawX, rawY);

    const swing = Math.max(-48, Math.min(48, x * 0.22));
    const dist = Math.hypot(x, y);
    const dirSign = Math.abs(x) > 0.5 ? Math.sign(x) : (Math.abs(y) > 0.5 ? Math.sign(y) : 1);
    const tiltY = Math.max(-190, Math.min(190, dirSign * dist * 0.78));
    const tiltX = Math.max(-30, Math.min(30, -y * 0.22));
    const stretch = 1 + Math.min(0.2, dist / 440);

    card.style.transform = `translate3d(${x}px, ${y}px, 0) rotateZ(${swing}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${stretch})`;

    if (string && highlight) {
      const cardEndX = x;
      const cardEndY = REST_DROP + y - 10;
      const midX = cardEndX * 0.55;
      const midY = (ANCHOR_Y + cardEndY) * 0.4;
      const d = `M0,${ANCHOR_Y} Q${midX},${midY} ${cardEndX},${cardEndY}`;
      string.setAttribute('d', d);
      highlight.setAttribute('d', d);
    }
  }, []);

  const stopLoop = () => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  const springLoop = useCallback(() => {
    const stiffness = 0.1;
    const damping = 0.83;

    const step = () => {
      const tx = dragging.current ? target.current.x : 0;
      const ty = dragging.current ? target.current.y : 0;

      const ax = (tx - pos.current.x) * stiffness;
      const ay = (ty - pos.current.y) * stiffness;
      vel.current.x = (vel.current.x + ax) * damping;
      vel.current.y = (vel.current.y + ay) * damping;
      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;

      applyTransform(pos.current.x, pos.current.y);

      const settled =
        !dragging.current &&
        Math.abs(vel.current.x) < 0.03 &&
        Math.abs(vel.current.y) < 0.03 &&
        Math.abs(pos.current.x) < 0.05 &&
        Math.abs(pos.current.y) < 0.05;

      if (settled) {
        pos.current.x = 0;
        pos.current.y = 0;
        applyTransform(0, 0);
        cardRef.current?.classList.add('badge-card--idle');
        stopLoop();
        return;
      }
      rafId.current = requestAnimationFrame(step);
    };

    stopLoop();
    rafId.current = requestAnimationFrame(step);
  }, [applyTransform]);

  const onPointerDown = (e: React.PointerEvent) => {
    const card = cardRef.current;
    if (!card) return;
    card.classList.remove('badge-card--idle');
    card.setPointerCapture(e.pointerId);
    pointerId.current = e.pointerId;
    dragging.current = true;
    target.current.x = pos.current.x;
    target.current.y = pos.current.y;
    vel.current.x = 0;
    vel.current.y = 0;
    lastMove.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    stopLoop();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || pointerId.current !== e.pointerId) return;
    const dx = e.clientX - lastMove.current.x;
    const dy = e.clientY - lastMove.current.y;
    const now = performance.now();
    const dt = Math.max(1, now - lastMove.current.t);

    const nextX = target.current.x + dx;
    const nextY = target.current.y + dy;
    const clamped = clampRadial(nextX, nextY);
    target.current.x = clamped.x;
    target.current.y = clamped.y;

    // instant velocity so release feels like a real flick
    vel.current.x = (dx / dt) * 14;
    vel.current.y = (dy / dt) * 14;

    pos.current.x = target.current.x;
    pos.current.y = target.current.y;
    applyTransform(pos.current.x, pos.current.y);

    lastMove.current = { x: e.clientX, y: e.clientY, t: now };
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    pointerId.current = null;
    springLoop();
  };

  useEffect(() => {
    applyTransform(0, 0);
    const el = wrapRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setEntered(true);
      },
      { threshold: 0.15 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      stopLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const idCode = useMemo(() => idFromName(name || 'ME'), [name]);

  return (
    <div
      className={`badge-wrap ${entered ? 'badge-wrap--entered' : ''} ${visible ? '' : 'badge-wrap--offscreen'}`}
      ref={wrapRef}
      aria-hidden="true"
    >
      <div className="badge-mount" />

      <svg className="badge-string-svg" viewBox="-140 -20 280 220" preserveAspectRatio="none">
        {/* soft drop shadow of the strap for depth */}
        <path d="M0,-6 Q0,38 0,78" className="badge-strap-shadow" fill="none" />
        {/* flat fabric strap, like a real lanyard around the neck */}
        <path ref={stringRef} d="M0,-6 Q0,38 0,78" className="badge-strap-base" fill="none" />
        {/* thin light streak down one edge for a rounded, cylindrical look */}
        <path ref={stringHighlightRef} d="M0,-6 Q0,38 0,78" className="badge-strap-highlight" fill="none" />
      </svg>

      <div
        ref={cardRef}
        className="badge-card badge-card--idle"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(e) => {
          if (e.buttons === 0) endDrag();
        }}
      >
        <span className="badge-clip" />
        <span className="badge-clip-ring" />

        {/* ---------- FRONT FACE ---------- */}
        <div className="badge-face badge-face--front">
          <span className="badge-shine" />

          <div className="badge-card-header">
            <span className="badge-header-mark">
              <i className="bi bi-braces-asterisk" />
            </span>
            <span className="badge-header-text">DEVELOPER ID</span>
            <span className="badge-status-dot" />
          </div>

          <div className="badge-photo-frame">
            {photoUrl ? (
              <img src={photoUrl} alt={name} draggable={false} />
            ) : (
              <span className="badge-initials">{initials || 'ME'}</span>
            )}
          </div>

          <p className="badge-name">{name}</p>
          <span className="badge-role-pill">{role}</span>

          <div className="badge-id-row">
            <span>ID • {idCode}</span>
            <span className="badge-id-status"><i className="bi bi-patch-check-fill" /> Active</span>
          </div>

          <div className="badge-barcode" aria-hidden="true">
            <span className="badge-barcode-bars" />
            <span className="badge-barcode-num">{idCode}-BTM-2026</span>
          </div>

          <span className="badge-spark badge-spark--1"><i className="bi bi-lightning-charge-fill" /></span>
          <span className="badge-spark badge-spark--2"><i className="bi bi-lightning-charge-fill" /></span>
          <span className="badge-spark badge-spark--3"><i className="bi bi-lightning-charge-fill" /></span>
        </div>

        {/* ---------- BACK FACE ---------- */}
        <div className="badge-face badge-face--back">
          <div className="badge-card-header badge-card-header--back">
            <span className="badge-header-mark"><i className="bi bi-shield-lock-fill" /></span>
            <span className="badge-header-text">AUTHORIZED ACCESS</span>
          </div>

          <div className="badge-magstripe" />

          <div className="badge-seal">
            <i className="bi bi-patch-check" />
            <span>VERIFIED</span>
          </div>

          <div className="badge-signature">
            <span className="badge-signature-label">Authorized Signature</span>
            <span className="badge-signature-line">{name}</span>
          </div>

          <p className="badge-back-note">
            Kartu ini adalah milik pemegang sah dan hanya berlaku sebagai identitas digital.
            Jika ditemukan, mohon dikembalikan.
          </p>

          <div className="badge-back-socials">
            <span><i className="bi bi-github" /></span>
            <span><i className="bi bi-linkedin" /></span>
            <span><i className="bi bi-envelope-fill" /></span>
          </div>

          <div className="badge-barcode badge-barcode--back" aria-hidden="true">
            <span className="badge-barcode-bars" />
            <span className="badge-barcode-num">{idCode}-BTM-2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}