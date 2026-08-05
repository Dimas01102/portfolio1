import { useState } from 'react';
import type { Certificate } from '../types';
import Reveal from './Reveal';
import Lightbox from './Lightbox';
import Pagination from './Pagination';
import usePagination from '../hooks/usePagination';
import './Certificates.css';

const CERTIFICATES_PER_PAGE = 8;

export default function Certificates({ certificates }: { certificates: Certificate[] }) {
  const [preview, setPreview] = useState<Certificate | null>(null);

  const { page, totalPages, pageItems, setPage } = usePagination({
    items: certificates,
    perPage: CERTIFICATES_PER_PAGE,
  });

  return (
    <section id="certificates" className="section certificates">
      <div className="container">
        <Reveal>
          <p className="eyebrow">04 — Credentials</p>
          <h2 className="section-title" style={{ marginBottom: 48 }}>Certificates</h2>
        </Reveal>

        <div className="certificates__grid">
          {pageItems.map((c, i) => (
            <Reveal key={c.id} delay={i * 60}>
              <div className="certificates__card card card-glow">
                {c.image_url && (
                  <button
                    className="certificates__img-btn"
                    onClick={() => setPreview(c)}
                    aria-label={`View ${c.title}`}
                  >
                    <img src={c.image_url} alt={c.title} className="certificates__img" />
                    <span className="certificates__img-hint"><i className="bi bi-zoom-in" /></span>
                  </button>
                )}
                <div className="certificates__body">
                  <h3>{c.title}</h3>
                  <p>{c.issuer}</p>
                  <div className="certificates__foot">
                    {c.issue_date && (
                      <span className="tag">
                        {new Date(c.issue_date).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {c.credential_url && (
                      <a href={c.credential_url} target="_blank" rel="noreferrer" className="certificates__link">
                        <i className="bi bi-box-arrow-up-right" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
          {certificates.length === 0 && (
            <p className="section-desc">Certificates will appear here once added from the admin panel.</p>
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          scrollTargetId="certificates"
        />
      </div>

      {preview?.image_url && (
        <Lightbox src={preview.image_url} alt={preview.title} onClose={() => setPreview(null)} />
      )}
    </section>
  );
}