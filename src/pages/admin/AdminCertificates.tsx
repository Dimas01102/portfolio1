import { useEffect, useState } from 'react';
import { supabase, uploadToPortfolioBucket } from '../../lib/supabaseClient';
import type { Certificate } from '../../types';

const EMPTY: Omit<Certificate, 'id' | 'created_at'> = {
  title: '', issuer: '', issue_date: null, image_url: null, credential_url: null, sort_order: 0,
};

export default function AdminCertificates() {
  const [list, setList] = useState<Certificate[]>([]);
  const [form, setForm] = useState<any>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from('certificates').select('*').order('sort_order');
    setList((data as Certificate[]) || []);
  }
  useEffect(() => { load(); }, []);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToPortfolioBucket(file, 'certificates');
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
    const payload = { ...form, sort_order: Number(form.sort_order) };
    const { error } = editingId
      ? await supabase.from('certificates').update(payload).eq('id', editingId)
      : await supabase.from('certificates').insert(payload);
    if (error) setMessage('Error: ' + error.message);
    else {
      resetForm();
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this certificate?')) return;
    await supabase.from('certificates').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h1 className="admin-h1">Certificates</h1>
      <p className="admin-sub">Shown as cards in the Certificates section of the home page.</p>
      {message && <div className="admin-alert admin-alert--error">{message}</div>}

      <form className="admin-form card" onSubmit={handleSubmit}>
        <div className="admin-form-row">
          <label>
            Title
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label>
            Issuer
            <input required value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
          </label>
        </div>
        <div className="admin-form-row">
          <label>
            Issue date
            <input type="date" value={form.issue_date || ''} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
          </label>
          <label>
            Credential URL
            <input value={form.credential_url || ''} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} />
          </label>
          <label>
            Sort order
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          </label>
        </div>
        <div className="admin-photo-row">
          <div className="admin-photo-preview admin-photo-preview--wide">
            {form.image_url ? <img src={form.image_url} alt="" /> : <i className="bi bi-image" />}
          </div>
          <label className="btn btn-ghost btn-sm">
            {uploading ? 'Uploading…' : 'Upload image'}
            <input type="file" accept="image/*" onChange={handleImage} hidden />
          </label>
        </div>
        <div className="admin-form-actions">
          <button className="btn btn-primary" type="submit">{editingId ? 'Update' : 'Add certificate'}</button>
          {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="admin-table card">
        {list.map((c) => (
          <div className="admin-table-row" key={c.id}>
            {c.image_url ? <img src={c.image_url} className="admin-table-thumb" alt="" /> : <i className="bi bi-patch-check" />}
            <span className="admin-table-name">{c.title}</span>
            <span className="tag">{c.issuer}</span>
            <div className="admin-table-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(c.id); setForm(c); }}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="admin-sub" style={{ padding: 20 }}>No certificates yet.</p>}
      </div>
    </div>
  );
}
