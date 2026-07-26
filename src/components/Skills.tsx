import type { Skill } from '../types';
import Reveal from './Reveal';
import SkillIcon from './SkillIcon';
import './Skills.css';

export default function Skills({ skills }: { skills: Skill[] }) {
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

        {featured.length > 0 && (
          <Reveal delay={80}>
            <div className="skills__icon-grid skills__icon-grid--featured">
              {featured.map((s, i) => (
                <div
                  className="skills__icon-card skills__icon-card--lg card card-glow"
                  key={s.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <SkillIcon icon={s.icon} />
                  <span>{s.name}</span>
                </div>
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
                    <div
                      className="skills__icon-card card card-glow"
                      key={s.id}
                      style={{ animationDelay: `${i * 45}ms` }}
                    >
                      <SkillIcon icon={s.icon} />
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}