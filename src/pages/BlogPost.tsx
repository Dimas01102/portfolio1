import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { readingTime } from '../lib/text';
import type { BlogPost } from '../types';
import './Blog.css';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => setPost((data as BlogPost) || null));
  }, [slug]);

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

  if (post === undefined) return <div className="section container">Loading…</div>;
  if (post === null) {
    return (
      <div className="section container">
        <h2 className="section-title">Post not found</h2>
        <Link to="/blog" className="btn btn-ghost" style={{ marginTop: 20 }}>
          ← Back to blog
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
              <span key={t} className="blog-card__tag">#{t}</span>
            ))}
          </div>
        )}

        {post.cover_image && <img src={post.cover_image} alt={post.title} className="blog-post__cover" />}

        <div className="blog-post__content">
          {post.content.split('\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </article>
  );
}