import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { readingTime } from '../lib/text';
import type { BlogPost } from '../types';
import Reveal from '../components/Reveal';
import Skeleton from '../components/Skeleton';
import './Blog.css';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPosts((data as BlogPost[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <section className="section blog-page">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Writing</p>
          <h2 className="section-title">Blog</h2>
          <p className="section-desc" style={{ marginBottom: 48 }}>
            Notes on things I build, break, and learn along the way.
          </p>
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

        <div className="blog-grid">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 60}>
              <Link to={`/blog/${post.slug}`} className="blog-card card card-glow">
                <div className="blog-card__img-wrap">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="blog-card__img" />
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
          ))}
        </div>
      </div>
    </section>
  );
}