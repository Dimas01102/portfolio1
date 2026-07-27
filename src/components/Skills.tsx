import { useRef } from 'react';
import type { Skill } from '../types';
import Reveal from './Reveal';
import SkillIcon from './SkillIcon';
import SkillsConnectors from './SkillsConnectors';
import './Skills.css';

function SkillCard({ s, large, delay }: { s: Skill; large?: boolean; delay: number }) {
  return (
    <div
      className={`skills__icon-card card card-glow ${large ? 'skills__icon-card--lg' : ''}`}
      data-skill-node
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="skills__ring" aria-hidden="true" />
      <span className="skills__icon-card-content">
        <SkillIcon icon={s.icon} />
        <span>{s.name}</span>
      </span>
    </div>
  );
}

export default function Skills({ skills }: { skills: Skill[] }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const featured = skills.filter((s) => s.is_featured);
  const rest = skills.filter((s) => !s.is_featured);
  const grouped = rest.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  return (
    <section id="skills" className="section skills">
      <div className="container">
        <Reveal>
          <p className="eyebrow">03 — Toolkit</p>
          <h2 className="section-title">Skills &amp; expertise</h2>
          <p className="section-desc" style={{ marginBottom: 48 }}>
            The languages, frameworks and tools I reach for most.
          </p>
        </Reveal>

        <div className="skills__field" ref={fieldRef}>
          <SkillsConnectors containerRef={fieldRef} />

          {featured.length > 0 && (
            <Reveal delay={80}>
              <div className="skills__icon-grid skills__icon-grid--featured">
                {featured.map((s, i) => (
                  <SkillCard key={s.id} s={s} large delay={i * 60} />
                ))}
              </div>
            </Reveal>
          )}

          <div className="skills__groups">
            {Object.entries(grouped).map(([category, list], gi) => (
              <Reveal key={category} delay={120 + gi * 80}>
                <div className="skills__group">
                  <h3 className="skills__group-title">{category}</h3>
                  <div className="skills__icon-grid">
                    {list.map((s, i) => (
                      <SkillCard key={s.id} s={s} delay={i * 45} />
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}