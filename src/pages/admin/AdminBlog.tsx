import { useEffect, useMemo, useState } from 'react';
import { supabase, uploadToPortfolioBucket } from '../../lib/supabaseClient';
import type { BlogPost } from '../../types';
import RichTextEditor from './RichTextEditor';

const EMPTY: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> = {
  slug: '', title: '', excerpt: '', content: '', cover_image: null, tags: [], is_published: false,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<any>(EMPTY);
  const [tagsInput, setTagsInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts((data as BlogPost[]) || []);
  }
  useEffect(() => { load(); }, []);

  // Existing tags across all posts, used as category suggestions so the
  // admin can stay consistent instead of typing near-duplicate categories.
  const tagSuggestions = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
    setTagsInput('');
  }

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToPortfolioBucket(file, 'blog');
      setForm({ ...form, cover_image: url });
    } catch (err: any) {
      setMessage('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const plainContent = (form.content || '').replace(/<[^>]*>/g, '').trim();
    if (!plainContent) {
      setMessage('Content cannot be empty.');
      return;
    }
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      tags: tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };
    const { error } = editingId
      ? await supabase.from('blog_posts').update(payload).eq('id', editingId)
      : await supabase.from('blog_posts').insert(payload);
    if (error) setMessage('Error: ' + error.message);
    else {
      resetForm();
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    load();
  }

  function edit(p: BlogPost) {
    setEditingId(p.id);
    setForm(p);
    setTagsInput(p.tags?.join(', ') || '');
  }

  return (
    <div>
      <h1 className="admin-h1">Blog posts</h1>
      <p className="admin-sub">Only posts with "Published" checked show up on the public /blog page.</p>
      {message && <div className="admin-alert admin-alert--error">{message}</div>}

      <form className="admin-form card" onSubmit={handleSubmit}>
        <label>
          Title
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <div className="admin-form-row">
          <label>
            Slug (auto-generated if left blank)
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="my-first-post" />
          </label>
          <label>
            Categories / tags (comma separated — first one is the featured category)
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="laravel, react"
              list="tag-suggestions"
            />
            <datalist id="tag-suggestions">
              {tagSuggestions.map((t) => <option key={t} value={t} />)}
            </datalist>
          </label>
        </div>
        <label>
          Excerpt
          <textarea rows={2} value={form.excerpt || ''} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short teaser shown on the blog list and in search results" />
        </label>
        <label>
          Content
          <RichTextEditor
            key={editingId || 'new'}
            value={form.content}
            onChange={(html) => setForm((f: any) => ({ ...f, content: html }))}
          />
        </label>

        <div className="admin-photo-row">
          <div className="admin-photo-preview admin-photo-preview--wide">
            {form.cover_image ? <img src={form.cover_image} alt="" /> : <i className="bi bi-image" />}
          </div>
          <label className="btn btn-ghost btn-sm">
            {uploading ? 'Uploading…' : 'Upload cover'}
            <input type="file" accept="image/*" onChange={handleCover} hidden />
          </label>
        </div>

        <label className="admin-checkbox">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
          Published
        </label>

        <div className="admin-form-actions">
          <button className="btn btn-primary" type="submit">{editingId ? 'Update post' : 'Create post'}</button>
          {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="admin-table card">
        {posts.map((p) => (
          <div className="admin-table-row" key={p.id}>
            <span className="admin-table-name">{p.title}</span>
            <span className="tag">{p.is_published ? 'Published' : 'Draft'}</span>
            <div className="admin-table-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => edit(p)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="admin-sub" style={{ padding: 20 }}>No posts yet.</p>}
      </div>
    </div>
  );
}