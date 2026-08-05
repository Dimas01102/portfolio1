import './Pagination.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** id of the section to scroll to (top) whenever the page changes. Optional. */
  scrollTargetId?: string;
  className?: string;
}

function getPageList(page: number, totalPages: number): (number | '...')[] {
  const siblingCount = 1;
  const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2 siblings, 2 dots

  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  const pages: (number | '...')[] = [1];

  if (showLeftDots) pages.push('...');
  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) pages.push(i);
  }
  if (showRightDots) pages.push('...');

  pages.push(totalPages);

  return pages;
}

/**
 * Generic pagination control. Drop it under any list (projects, certificates, blog posts, ...)
 * and drive the list slicing with the `usePagination` hook.
 */
export default function Pagination({ page, totalPages, onPageChange, scrollTargetId, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const handleChange = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return;
    onPageChange(next);
    if (scrollTargetId) {
      const el = document.getElementById(scrollTargetId);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  const pages = getPageList(page, totalPages);

  return (
    <nav className={`pagination ${className}`} aria-label="Pagination">
      <button
        type="button"
        className="pagination__btn pagination__nav"
        onClick={() => handleChange(page - 1)}
        disabled={page === 1}
        aria-label="Halaman sebelumnya"
      >
        <i className="bi bi-chevron-left" />
      </button>

      <ul className="pagination__list">
        {pages.map((p, i) =>
          p === '...' ? (
            <li key={`dots-${i}`} className="pagination__dots" aria-hidden="true">
              &#8230;
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                className={`pagination__btn pagination__page ${p === page ? 'is-active' : ''}`}
                onClick={() => handleChange(p)}
                aria-label={`Halaman ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            </li>
          )
        )}
      </ul>

      <button
        type="button"
        className="pagination__btn pagination__nav"
        onClick={() => handleChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Halaman berikutnya"
      >
        <i className="bi bi-chevron-right" />
      </button>
    </nav>
  );
}