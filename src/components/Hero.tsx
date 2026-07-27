import { useEffect, useState } from 'react';
import type { Profile } from '../types';
import { truncateAtWord } from '../lib/text';
import './Hero.css';

const LINES = [
  { top: '14%', rotate: -8, duration: 9, delay: 0, color: 'var(--accent)' },
  { top: '32%', rotate: 4, duration: 12, delay: 1.4, color: 'var(--brass)' },
  { top: '52%', rotate: -3, duration: 10, delay: 0.6, color: 'var(--accent)' },
  { top: '70%', rotate: 7, duration: 13, delay: 2.2, color: 'var(--brass)' },
  { top: '86%', rotate: -6, duration: 11, delay: 3, color: 'var(--accent)' },
];

const BADGES = [
  { icon: 'bi-git', angle: 0 },
  { icon: 'bi-cloud-fill', angle: 60 },
  { icon: 'bi-code-slash', angle: 120 },
  { icon: 'bi-github', angle: 180 },
  { icon: 'bi-terminal-fill', angle: 240 },
  { icon: 'bi-bug-fill', angle: 300 },
];

export default function Hero({ profile }: { profile: Profile | null }) {
  const roles = profile?.role_titles?.length ? profile.role_titles : ['Fullstack Developer'];
  const [roleIdx, setRoleIdx] = useState(0);
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const full = roles[roleIdx % roles.length];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplay(full.slice(0, i));
      if (i === full.length) {
        clearInterval(interval);
        setTimeout(() => setRoleIdx((r) => r + 1), 1600);
      }
    }, 65);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleIdx, roles.join('|')]);

  return (
    <section id="home" className="hero">
      <div className="hero__lines" aria-hidden="true">
        {LINES.map((l, i) => (
          <span
            key={i}
            className="hero__line"
            style={
              {
                top: l.top,
                transform: `rotate(${l.rotate}deg)`,
                animationDuration: `${l.duration}s`,
                animationDelay: `${l.delay}s`,
                '--line-color': l.color,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="container hero__inner">
        <div className="hero__text">
          <span className="hero__status-badge">
            <span className="hero__status-dot" /> Available for work
          </span>
          <h1 className="hero__title">
            Hi, I'm <span className="hero__title-accent">{profile?.full_name || 'Your Name'}</span>
          </h1>
          <p className="hero__role">
            <span className="hero__role-text">{display}</span>
            <span className="hero__role-cursor" />
          </p>
          <p className="hero__desc">
            {profile?.tagline
              ? profile.tagline
              : profile?.about
              ? truncateAtWord(profile.about, 200)
              : 'Software engineer crafting polished, production-ready web applications.'}
          </p>
          <div className="hero__cta">
            <a href="#contact" className="btn btn-primary">
              <i className="bi bi-send" /> Get in touch
            </a>
            {profile?.resume_url && (
              <a href={profile.resume_url} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <i className="bi bi-download" /> Resume
              </a>
            )}
          </div>
        </div>

        <div className="hero__photo-wrap">
          <div className="hero__photo-glow" />
          <span className="hero__ring hero__ring--a" />
          <span className="hero__ring hero__ring--b" />

          {/* photo itself never rotates */}
          <div className="hero__photo-static">
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt={profile.full_name} className="hero__photo" />
            ) : (
              <div className="hero__photo hero__photo--placeholder">
                <i className="bi bi-person" />
              </div>
            )}
          </div>

          {/* this group orbits around the static photo */}
          <div className="hero__orbit">
            {BADGES.map((b) => (
              <span
                key={b.icon}
                className="hero__badge"
                style={{ '--angle': `${b.angle}deg` } as React.CSSProperties}
              >
                <span className="hero__badge-icon">
                  <i className={`bi ${b.icon}`} />
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}