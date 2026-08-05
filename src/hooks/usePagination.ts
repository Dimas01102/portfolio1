import { useEffect, useMemo, useState } from 'react';

interface UsePaginationOptions<T> {
  items: T[];
  perPage?: number;
  /** Reset to page 1 whenever this value changes (e.g. a filter/search term). */
  resetKey?: unknown;
}

interface UsePaginationResult<T> {
  page: number;
  totalPages: number;
  pageItems: T[];
  setPage: (page: number) => void;
  goNext: () => void;
  goPrev: () => void;
}

/** Generic client-side pagination over an items array. Reusable across any list (projects, certificates, blog posts, etc). */
export default function usePagination<T>({
  items,
  perPage = 6,
  resetKey,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [page, setPageState] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  // Keep current page valid if the item count shrinks (e.g. after admin delete).
  useEffect(() => {
    if (page > totalPages) setPageState(totalPages);
  }, [totalPages, page]);

  // Reset to first page when the reset key changes (e.g. search/filter/tab).
  useEffect(() => {
    setPageState(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, page, perPage]);

  const setPage = (next: number) => {
    setPageState(Math.min(Math.max(1, next), totalPages));
  };

  return {
    page,
    totalPages,
    pageItems,
    setPage,
    goNext: () => setPage(page + 1),
    goPrev: () => setPage(page - 1),
  };
}