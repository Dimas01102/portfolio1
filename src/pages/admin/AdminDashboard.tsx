import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ skills: 0, certificates: 0, posts: 0, projects: 0 });

  useEffect(() => {
    (async () => {
      const [{ count: skills }, { count: certificates }, { count: posts }, { count: projects }] = await Promise.all([
        supabase.from('skills').select('*', { count: 'exact', head: true }),
        supabase.from('certificates').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
      ]);
      setCounts({ skills: skills || 0, certificates: certificates || 0, posts: posts || 0, projects: projects || 0 });
    })();
  }, []);

  return (
    <div>
      <h1 className="admin-h1">Overview</h1>
      <p className="admin-sub">Manage every piece of content shown on your public portfolio.</p>

      <div className="admin-grid-cards">
        <Link to="/admin/skills" className="card card-glow admin-count-card">
          <span className="admin-count-num">{counts.skills}</span>
          <span>Skills</span>
        </Link>
        <Link to="/admin/certificates" className="card card-glow admin-count-card">
          <span className="admin-count-num">{counts.certificates}</span>
          <span>Certificates</span>
        </Link>
        <Link to="/admin/projects" className="card card-glow admin-count-card">
          <span className="admin-count-num">{counts.projects}</span>
          <span>Projects</span>
        </Link>
        <Link to="/admin/blog" className="card card-glow admin-count-card">
          <span className="admin-count-num">{counts.posts}</span>
          <span>Blog posts</span>
        </Link>
      </div>
    </div>
  );
}
