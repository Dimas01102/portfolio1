import { useEffect, useState } from 'react';
import { supabase, uploadToPortfolioBucket } from '../../lib/supabaseClient';
import type { Project } from '../../types';

const EMPTY: Omit<Project, 'id' | 'created_at'> = {
  title: '', description: '', image_url: null, tech_stack: [], live_url: null, repo_url: null,
  is_featured: false, sort_order: 0,
};

export default function AdminProjects() {
  const [list, setList] = useState<Project[]>([]);
  const [form, setForm] = useState<any>(EMPTY);
  const [stackInput, setStackInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from('projects').select('*').order('sort_order');
    setList((data as Project[]) || []);
  }
  useEffect(() => { load(); }, []);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
    setStackInput('');
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToPortfolioBucket(file, 'projects');
      setForm({ ...form, image_url: url });
    } catch (err: any) {
      setMessage('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const payload = {
      ...form,
      tech_stack: stackInput.split(',').map((t: string) => t.trim()).filter(Boolean),
      sort_order: Number(form.sort_order),
    };
    const { error } = editingId
      ? await supabase.from('projects').update(payload).eq('id', editingId)
      : await supabase.from('projects').insert(payload);
    if (error) setMessage('Error: ' + error.message);
    else {
      resetForm();
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    load();
  }

  function edit(p: Project) {
    setEditingId(p.id);
    setForm(p);
    setStackInput(p.tech_stack?.join(', ') || '');
  }

  return (
    <div>
      <h1 className="admin-h1">Projects</h1>
      <p className="admin-sub">Shown on the public /projects page.</p>
      {message && <div className="admin-alert admin-alert--error">{message}</div>}

      <form className="admin-form card" onSubmit={handleSubmit}>
        <label>
          Title
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label>
          Description
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <div className="admin-form-row">
          <label>
            Tech stack (comma separated)
            <input value={stackInput} onChange={(e) => setStackInput(e.target.value)} placeholder="Laravel, React, Supabase" />
          </label>
          <label>
            Sort order
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          </label>
        </div>
        <div className="admin-form-row">
          <label>
            Live URL
            <input value={form.live_url || ''} onChange={(e) => setForm({ ...form, live_url: e.target.value })} />
          </label>
          <label>
            Repo URL
            <input value={form.repo_url || ''} onChange={(e) => setForm({ ...form, repo_url: e.target.value })} />
          </label>
        </div>

        <div className="admin-photo-row">
          <div className="admin-photo-preview admin-photo-preview--wide">
            {form.image_url ? <img src={form.image_url} alt="" /> : <i className="bi bi-image" />}
          </div>
          <label className="btn btn-ghost btn-sm">
            {uploading ? 'Uploading…' : 'Upload screenshot'}
            <input type="file" accept="image/*" onChange={handleImage} hidden />
          </label>
        </div>

        <label className="admin-checkbox">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
          Featured project
        </label>

        <div className="admin-form-actions">
          <button className="btn btn-primary" type="submit">{editingId ? 'Update project' : 'Add project'}</button>
          {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="admin-table card">
        {list.map((p) => (
          <div className="admin-table-row" key={p.id}>
            {p.image_url ? <img src={p.image_url} className="admin-table-thumb" alt="" /> : <i className="bi bi-kanban" />}
            <span className="admin-table-name">{p.title}</span>
            {p.is_featured && <span className="tag admin-tag-accent">Featured</span>}
            <div className="admin-table-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => edit(p)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="admin-sub" style={{ padding: 20 }}>No projects yet.</p>}
      </div>
    </div>
  );
}
