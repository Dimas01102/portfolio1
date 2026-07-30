import { memo, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { readingTime } from '../lib/text';
import type { BlogPost } from '../types';
import Reveal from '../components/Reveal';
import Skeleton from '../components/Skeleton';
import './Blog.css';

const BlogCard = memo(function BlogCard({ post, delay }: { post: BlogPost; delay: number }) {
  return (
    <Reveal delay={delay}>
      <Link to={`/blog/${post.slug}`} className="blog-card card card-glow">
        <div className="blog-card__img-wrap">
          {post.cover_image ? (
            <img src={post.cover_image} alt={post.title} className="blog-card__img" loading="lazy" decoding="async" />
          ) : (
            <div className="blog-card__img blog-card__img--placeholder">
              <i className="bi bi-journal-text" />
            </div>
          )}
          {post.tags?.[0] && <span className="blog-card__category">{post.tags[0]}</span>}
        </div>
        <div className="blog-card__body">
          <div className="blog-card__meta">
            <span>{new Date(post.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
            <span className="blog-card__meta-dot" />
            <span>{readingTime(post.content)} min read</span>
          </div>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <span className="blog-card__cta">
            Read article <i className="bi bi-arrow-right" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
});

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    let active = true;
    supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setPosts((data as BlogPost[]) || []);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  // All categories are derived from post tags (first tag = featured category
  // shown on the card badge). Computed once per posts change, not per render.
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesCategory = !activeCategory || p.tags?.includes(activeCategory);
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = `${p.title} ${p.excerpt || ''} ${p.tags?.join(' ') || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query, activeCategory]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

  function toggleCategory(cat: string) {
    updateParam('category', activeCategory === cat ? '' : cat);
  }

  const hasFilters = !!query || !!activeCategory;

  return (
    <section className="section blog-page">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Writing</p>
          <h2 className="section-title">Blog</h2>
          <p className="section-desc" style={{ marginBottom: 32 }}>
            Notes on things I build, break, and learn along the way.
          </p>
        </Reveal>

        <Reveal delay={40}>
          <div className="blog-controls">
            <div className="blog-search">
              <i className="bi bi-search" />
              <input
                type="text"
                value={query}
                placeholder="Search articles…"
                onChange={(e) => updateParam('q', e.target.value)}
                aria-label="Search articles"
              />
              {query && (
                <button type="button" className="blog-search__clear" onClick={() => updateParam('q', '')} aria-label="Clear search">
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </div>

            {categories.length > 0 && (
              <div className="blog-categories" role="tablist" aria-label="Filter by category">
                <button
                  type="button"
                  className={`blog-chip ${!activeCategory ? 'is-active' : ''}`}
                  onClick={() => toggleCategory('')}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`blog-chip ${activeCategory === cat ? 'is-active' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {loading && (
          <div className="blog-grid">
            {[0, 1, 2, 3].map((i) => (
              <div className="card blog-card" key={i}>
                <Skeleton height="130px" radius="0" />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton width="50%" height="12px" />
                  <Skeleton width="80%" height="16px" />
                  <Skeleton width="100%" height="12px" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && <p className="section-desc">No posts published yet.</p>}

        {!loading && posts.length > 0 && filteredPosts.length === 0 && (
          <div className="blog-empty">
            <i className="bi bi-emoji-frown" />
            <p>No articles match{query ? ` "${query}"` : ''}{activeCategory ? ` in "${activeCategory}"` : ''}.</p>
            {hasFilters && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSearchParams({}, { replace: true })}>
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="blog-grid">
          {filteredPosts.map((post, i) => (
            <BlogCard key={post.id} post={post} delay={i * 60} />
          ))}
        </div>
      </div>
    </section>
  );
}