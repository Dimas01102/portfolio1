import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '../types';
import './ProjectModal.css';

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div className="project-modal" onClick={onClose}>
      <div
        className="project-modal__panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        <button className="project-modal__close" aria-label="Close" onClick={onClose}>
          <i className="bi bi-x-lg" />
        </button>

        <div className="project-modal__scroll">
          {project.image_url && (
            <div className="project-modal__img-wrap">
              <img
                src={project.image_url}
                alt={project.title}
                className="project-modal__img"
                loading="lazy"
                decoding="async"
              />
              {project.is_featured && <span className="project-modal__featured">Featured</span>}
            </div>
          )}

          <div className="project-modal__body">
            <h3>{project.title}</h3>

            {project.tech_stack?.length > 0 && (
              <div className="project-modal__stack">
                {project.tech_stack.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            )}

            <p className="project-modal__desc">{project.description}</p>

            {(project.live_url || project.repo_url) && (
              <div className="project-modal__links">
                {project.live_url && (
                  <a href={project.live_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    <i className="bi bi-box-arrow-up-right" /> Live
                  </a>
                )}
                {project.repo_url && (
                  <a href={project.repo_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                    <i className="bi bi-github" /> Code
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}