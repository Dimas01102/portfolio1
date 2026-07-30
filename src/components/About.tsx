import type { Profile } from '../types';
import Reveal from './Reveal';
import NameBadge from './NameBadge';
import './About.css';

const HIGHLIGHTS = [
  { icon: 'bi-mortarboard', label: 'Software Engineering Student', desc: 'Politeknik Negeri Batam' },
  { icon: 'bi-layers', label: 'Fullstack', desc: 'Laravel + React/TS' },
  { icon: 'bi-lightning-charge', label: 'Ships Fast', desc: 'Polished, production-ready' },
  { icon: 'bi-people', label: 'Team Player', desc: 'Collaborates in squads of 6' },
];

export default function About({ profile }: { profile: Profile | null }) {
  return (
    <section id="about" className="section about">
      <div className="about__blob about__blob--a" aria-hidden="true" />
      <div className="about__blob about__blob--b" aria-hidden="true" />
      <div className="container">
        <Reveal>
          <p className="eyebrow">01 — About</p>
          <h2 className="section-title" style={{ marginBottom: 48 }}>A little about me</h2>
        </Reveal>

        <div className="about__grid">
          <div className="about__top">
            <Reveal className="about__body" delay={80}>
              {(profile?.about || 'About content goes here.')
                .split('\n')
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i}>{p}</p>
                ))}

              {profile?.location || profile?.email || profile?.github_username ? (
                <div className="about__meta">
                  {profile?.location && (
                    <span className="about__meta-item"><i className="bi bi-geo-alt" /> {profile.location}</span>
                  )}
                  {profile?.email && (
                    <span className="about__meta-item"><i className="bi bi-envelope" /> {profile.email}</span>
                  )}
                  {profile?.github_username && (
                    <span className="about__meta-item"><i className="bi bi-github" /> @{profile.github_username}</span>
                  )}
                </div>
              ) : null}
            </Reveal>

            <Reveal delay={160} className="about__badge-col">
              <NameBadge
                photoUrl={profile?.photo_url}
                name={profile?.full_name || 'Your Name'}
                role={profile?.role_titles?.[0] || 'Fullstack Developer'}
              />
            </Reveal>
          </div>

          <div className="about__flow">
            {HIGHLIGHTS.flatMap((h, i) => {
              const node = (
                <Reveal key={`node-${h.label}`} delay={140 + i * 100} className="about__flow-node-wrap">
                  <div className="about__flow-node card card-glow">
                    <div className="about__flow-icon"><i className={`bi ${h.icon}`} /></div>
                    <p className="about__flow-label">{h.label}</p>
                    <p className="about__flow-desc">{h.desc}</p>
                  </div>
                </Reveal>
              );
              if (i === HIGHLIGHTS.length - 1) return [node];
              const connector = (
                <div className="about__connector" key={`conn-${i}`} aria-hidden="true">
                  <span className="about__connector-pulse" />
                </div>
              );
              return [node, connector];
            })}
          </div>
        </div>
      </div>
    </section>
  );
}