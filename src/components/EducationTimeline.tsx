import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import './EducationTimeline.css';

interface EducationItem {
  level: string;
  institution: string;
  major?: string; 
  period: string;
  description: string;
  icon: string;
  current?: boolean;
}

const EDUCATION: EducationItem[] = [
  {
    level: 'SD',
    institution: 'SDS AL-AZHAR BATAM',
    period: '2013 - 2019',
    description: 'The beginning of the learning journey fosters curiosity and lays the academic foundations.',
    icon: 'bi-pencil-fill',
  },
  {
    level: 'SMP',
    institution: 'SMPN 41 BATAM',
    period: '2019 - 2022',
    description: 'First encountering computers and basic logic planted the seeds of an interest in technology.',
    icon: 'bi-journal-bookmark-fill',
  },
  {
    level: 'SMA / SMK',
    institution: 'SMKN 4 BATAM',
    major: 'Software Engineering (RPL)',
    period: '2022 - 2025',
    description: 'Developing interest in computer science and learning programming independently started.',
    icon: 'bi-laptop-fill',
  },
  {
    level: 'Kuliah',
    institution: 'POLITEKNIK NEGERI BATAM',
    major: 'Software Engineering (TRPL)', 
    period: '2025 - Sekarang',
    description: 'Technology in software engineering - focus on web fullstack.',
    icon: 'bi-mortarboard-fill',
    current: true,
  },
];

export default function EducationTimeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="edu-timeline">
      <p className="eyebrow">Education</p>
      <h3 className="edu-timeline__title">Educational Journey</h3>

      <div
        className={`edu-timeline__track ${active ? 'edu-timeline__track--active' : ''}`}
        ref={trackRef}
      >
        <span className="edu-timeline__line" aria-hidden="true" />
        <span className="edu-timeline__line-fill" aria-hidden="true" />

        {EDUCATION.map((item, i) => (
          <div
            className={`edu-timeline__item ${item.current ? 'is-current' : ''}`}
            key={item.level}
            style={{ '--i': i } as CSSProperties}
          >
            <span className="edu-timeline__dot">
              <i className={`bi ${item.icon}`} />
              {item.current && <span className="edu-timeline__pulse" aria-hidden="true" />}
            </span>
            <div className="edu-timeline__card card card-glow">
              <div className="edu-timeline__head">
                <span className="edu-timeline__level">{item.level}</span>
                <span className="edu-timeline__period">{item.period}</span>
              </div>
              <h4>{item.institution}</h4>
              
              {/* Tampilkan Major jika ada nilainya */}
              {item.major && (
                <div className="edu-timeline__major">
                    <i className="bi bi-award" aria-hidden="true" />
                    <span>{item.major}</span>
                </div>
                )}
              
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}