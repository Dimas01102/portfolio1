import { useEffect, useState } from 'react';
import { supabase, uploadToPortfolioBucket } from '../../lib/supabaseClient';
import type { Profile } from '../../types';

export default function AdminProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roleInput, setRoleInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('profile').select('*').limit(1).maybeSingle().then(({ data }) => {
      setProfile(data as Profile);
      setRoleInput((data as Profile)?.role_titles?.join(', ') || '');
    });
  }, []);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    try {
      const url = await uploadToPortfolioBucket(file, 'profile');
      setProfile({ ...profile, photo_url: url });
    } catch (err: any) {
      setMessage('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from('profile')
      .update({
        ...profile,
        role_titles: roleInput.split(',').map((r) => r.trim()).filter(Boolean),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);
    setSaving(false);
    setMessage(error ? 'Error: ' + error.message : 'Saved.');
  }

  if (!profile) return <p className="admin-sub">Loading…</p>;

  return (
    <div>
      <h1 className="admin-h1">Profile & photo</h1>
      <p className="admin-sub">This powers the hero section and about text on the home page.</p>
      {message && <div className="admin-alert">{message}</div>}

      <form className="admin-form card" onSubmit={handleSave}>
        <div className="admin-photo-row">
          <div className="admin-photo-preview">
            {profile.photo_url ? <img src={profile.photo_url} alt="" /> : <i className="bi bi-person" />}
          </div>
          <label className="btn btn-ghost btn-sm">
            {uploading ? 'Uploading…' : 'Change photo'}
            <input type="file" accept="image/*" onChange={handlePhoto} hidden />
          </label>
        </div>

        <label>
          Full name
          <input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
        </label>

        <label>
          Role titles (comma separated, rotates in the hero typing effect)
          <input value={roleInput} onChange={(e) => setRoleInput(e.target.value)} placeholder="Fullstack Developer, React Engineer" />
        </label>

        <label>
          About
          <textarea rows={6} value={profile.about} onChange={(e) => setProfile({ ...profile, about: e.target.value })} />
        </label>

        <div className="admin-form-row">
          <label>
            Email
            <input value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </label>
          <label>
            Location
            <input value={profile.location || ''} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
          </label>
        </div>

        <div className="admin-form-row">
          <label>
            GitHub username (powers the contribution graph)
            <input
              value={profile.github_username}
              onChange={(e) => setProfile({ ...profile, github_username: e.target.value })}
            />
          </label>
          <label>
            Resume URL
            <input value={profile.resume_url || ''} onChange={(e) => setProfile({ ...profile, resume_url: e.target.value })} />
          </label>
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
