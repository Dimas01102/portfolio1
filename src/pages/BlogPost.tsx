import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { supabase } from '../lib/supabaseClient';
import { readingTime } from '../lib/text';
import type { BlogPost } from '../types';
import ShareButtons from '../components/ShareButtons';
import Skeleton from '../components/Skeleton';
import './Blog.css';

const SANITIZE_CONFIG = {
  ADD_TAGS: ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col', 'caption'],
  ADD_ATTR: ['target', 'rel', 'style', 'class', 'colspan', 'rowspan'],
};

function sanitize(html: string) {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setPost(undefined);
    setRelated([]);
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setPost((data as BlogPost) || null);
      });
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    if (!post || !post.tags?.length) return;
    let active = true;
    supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .neq('id', post.id)
      .overlaps('tags', post.tags)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (active) setRelated((data as BlogPost[]) || []);
      });
    return () => { active = false; };
  }, [post]);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (scrolled / max) * 100) : 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const shareUrl = typeof window !== 'undefined' && post ? `${window.location.origin}/blog/${post.slug}` : '';
  const sanitizedContent = useMemo(() => (post ? sanitize(post.content) : ''), [post]);

  if (post === undefined) {
    return (
      <div className="section blog-post">
        <div className="container blog-post__inner">
          <Skeleton width="120px" height="14px" />
          <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton width="60%" height="34px" />
            <Skeleton width="30%" height="14px" />
          </div>
          <Skeleton height="320px" radius="12px" className="blog-post__cover-skel" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 26 }}>
            <Skeleton height="14px" />
            <Skeleton height="14px" />
            <Skeleton width="80%" height="14px" />
          </div>
        </div>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="section container blog-post__notfound">
        <i className="bi bi-journal-x" />
        <h2 className="section-title">Post not found</h2>
        <p className="section-desc">This article may have been moved, unpublished, or never existed.</p>
        <Link to="/blog" className="btn btn-ghost" style={{ marginTop: 20 }}>
          <i className="bi bi-arrow-left" /> Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="section blog-post">
      <div className="blog-post__progress" style={{ width: `${progress}%` }} />
      <div className="container blog-post__inner">
        <Link to="/blog" className="blog-post__back"><i className="bi bi-arrow-left" /> Back to blog</Link>

        <div className="blog-post__meta-row">
          <span className="tag">{new Date(post.created_at).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="blog-card__meta-dot" />
          <span className="tag">{readingTime(post.content)} min read</span>
        </div>

        <h1 className="blog-post__title">{post.title}</h1>

        {post.tags?.length > 0 && (
          <div className="blog-post__tags">
            {post.tags.map((t) => (
              <Link key={t} to={`/blog?category=${encodeURIComponent(t)}`} className="blog-card__tag">
                #{t}
              </Link>
            ))}
          </div>
        )}

        {post.cover_image && <img src={post.cover_image} alt={post.title} className="blog-post__cover" loading="eager" />}

        <div
          className="blog-post__content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        <ShareButtons url={shareUrl} title={post.title} summary={post.excerpt || undefined} />

        {related.length > 0 && (
          <div className="blog-related">
            <h3 className="blog-related__title">More like this</h3>
            <div className="blog-related__grid">
              {related.map((r) => (
                <Link key={r.id} to={`/blog/${r.slug}`} className="blog-related__card card">
                  {r.cover_image ? (
                    <img src={r.cover_image} alt={r.title} loading="lazy" />
                  ) : (
                    <div className="blog-related__placeholder"><i className="bi bi-journal-text" /></div>
                  )}
                  <div>
                    <h4>{r.title}</h4>
                    <span>{readingTime(r.content)} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}