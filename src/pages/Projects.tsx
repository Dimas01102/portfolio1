import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Project } from '../types';
import Reveal from '../components/Reveal';
import Lightbox from '../components/Lightbox';
import Skeleton from '../components/Skeleton';
import './Projects.css';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Project | null>(null);

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        setProjects((data as Project[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <section className="section projects-page">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Portfolio</p>
          <h2 className="section-title">Projects</h2>
          <p className="section-desc" style={{ marginBottom: 48 }}>
            A selection of things I've designed, built, and shipped.
          </p>
        </Reveal>

        {loading && (
          <div className="projects-grid">
            {[0, 1, 2].map((i) => (
              <div className="card projects-card" key={i}>
                <Skeleton height="180px" radius="0" />
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Skeleton width="70%" height="18px" />
                  <Skeleton width="100%" height="14px" />
                  <Skeleton width="90%" height="14px" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <p className="section-desc">Projects will appear here once added from the admin panel.</p>
        )}

        <div className="projects-grid">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <article className="card card-glow projects-card">
                {p.image_url && (
                  <button className="projects-card__img-btn" onClick={() => setPreview(p)} aria-label={`Preview ${p.title}`}>
                    <img src={p.image_url} alt={p.title} className="projects-card__img" />
                    <span className="projects-card__img-hint"><i className="bi bi-zoom-in" /></span>
                    {p.is_featured && <span className="projects-card__featured">Featured</span>}
                  </button>
                )}
                <div className="projects-card__body">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  {p.tech_stack?.length > 0 && (
                    <div className="projects-card__stack">
                      {p.tech_stack.map((t) => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="projects-card__links">
                    {p.live_url && (
                      <a href={p.live_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                        <i className="bi bi-box-arrow-up-right" /> Live
                      </a>
                    )}
                    {p.repo_url && (
                      <a href={p.repo_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                        <i className="bi bi-github" /> Code
                      </a>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {preview?.image_url && (
        <Lightbox src={preview.image_url} alt={preview.title} onClose={() => setPreview(null)} />
      )}
    </section>
  );
}
