import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Project } from '../types';
import Reveal from '../components/Reveal';
import ProjectModal from '../components/ProjectModal';
import Skeleton from '../components/Skeleton';
import Pagination from '../components/Pagination';
import usePagination from '../hooks/usePagination';
import './Projects.css';

const PROJECTS_PER_PAGE = 8;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);

  const { page, totalPages, pageItems, setPage } = usePagination({
    items: projects,
    perPage: PROJECTS_PER_PAGE,
  });

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
    <section id="projects-page" className="section projects-page">
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
          {pageItems.map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <article
                className="card card-glow projects-card"
                role="button"
                tabIndex={0}
                onClick={() => setSelected(p)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(p)}
                aria-label={`Lihat detail ${p.title}`}
              >
                {p.image_url && (
                  <div className="projects-card__img-wrap">
                    <img src={p.image_url} alt={p.title} className="projects-card__img" loading="lazy" decoding="async" />
                    <span className="projects-card__img-hint"><i className="bi bi-zoom-in" /></span>
                    {p.is_featured && <span className="projects-card__featured">Featured</span>}
                  </div>
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
                  <div className="projects-card__links" onClick={(e) => e.stopPropagation()}>
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

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          scrollTargetId="projects-page"
        />
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}