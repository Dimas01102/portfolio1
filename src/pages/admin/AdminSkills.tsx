import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { autoIconFor } from '../../lib/icons';
import SkillIcon from '../../components/SkillIcon';
import type { Skill } from '../../types';

const EMPTY: Omit<Skill, 'id' | 'created_at'> = {
  name: '', icon: '', category: 'Frontend', level: 80, is_featured: false, sort_order: 0,
};

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [form, setForm] = useState<any>(EMPTY);
  const [iconTouched, setIconTouched] = useState(false); 
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from('skills').select('*').order('sort_order');
    setSkills((data as Skill[]) || []);
  }
  useEffect(() => { load(); }, []);

  function startEdit(s: Skill) {
    setEditingId(s.id);
    setForm(s);
    setIconTouched(true); 
  }
  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
    setIconTouched(false);
  }

  function handleNameChange(name: string) {
    setForm((f: any) => ({
      ...f,
      name,
      icon: iconTouched ? f.icon : (name.trim() ? autoIconFor(name) : ''),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const payload = {
      ...form,
      icon: form.icon || 'bi-code-slash',
      level: Number(form.level) || 80,
      sort_order: Number(form.sort_order),
    };
    const { error } = editingId
      ? await supabase.from('skills').update(payload).eq('id', editingId)
      : await supabase.from('skills').insert(payload);
    if (error) setMessage('Error: ' + error.message);
    else {
      resetForm();
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this skill?')) return;
    await supabase.from('skills').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h1 className="admin-h1">Skills &amp; tools</h1>
      <p className="admin-sub">
        Same form for both — set Category to anything you like (e.g. "Frontend", "Backend", "Tools").
        Toggle "Featured" to surface an item in the highlighted row at the top of the Skills section.
      </p>
      {message && <div className="admin-alert admin-alert--error">{message}</div>}

      <form className="admin-form card" onSubmit={handleSubmit}>
        <div className="admin-form-row">
          <label>
            Name
            <input required value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. HTML, Laravel, Figma" />
          </label>
          <label>
            Icon
            <div className="admin-icon-field">
              <span className="admin-icon-preview"><SkillIcon icon={form.icon || 'bi-question-lg'} /></span>
              <input
                value={form.icon}
                onChange={(e) => { setIconTouched(true); setForm({ ...form, icon: e.target.value }); }}
                placeholder="si:react or bi-code-slash"
              />
            </div>
          </label>
        </div>
        <p className="admin-hint">
          Typing a name auto-fills <code>si:&lt;name&gt;</code> and shows the real brand logo above — this isn't
          limited to a fixed list, it works for any of the <a href="https://simpleicons.org" target="_blank" rel="noreferrer">3000+ logos on Simple Icons</a> (just
          browse there and copy the exact slug into the field if auto-detect guesses wrong). A few trademarked
          tools (VS Code, AWS) aren't on Simple Icons at all, so those are bundled locally and just work. For
          anything else, you're free to type any <a href="https://icons.getbootstrap.com" target="_blank" rel="noreferrer">Bootstrap Icons</a> class instead, e.g. <code>bi-cloud-fill</code>.
        </p>

        <div className="admin-form-row">
          <label>
            Category
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </label>
          <label>
            Sort order
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          </label>
        </div>
        <label className="admin-checkbox">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
          Featured
        </label>
        <div className="admin-form-actions">
          <button className="btn btn-primary" type="submit">{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="admin-table card">
        {skills.map((s) => (
          <div className="admin-table-row" key={s.id}>
            <SkillIcon icon={s.icon} />
            <span className="admin-table-name">{s.name}</span>
            <span className="tag">{s.category}</span>
            {s.is_featured && <span className="tag admin-tag-accent">Featured</span>}
            <div className="admin-table-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(s)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
            </div>
          </div>
        ))}
        {skills.length === 0 && <p className="admin-sub" style={{ padding: 20 }}>No skills yet.</p>}
      </div>
    </div>
  );
}