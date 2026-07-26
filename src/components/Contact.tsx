import { useState } from 'react';
import type { Profile } from '../types';
import Reveal from './Reveal';
import './Contact.css';

export default function Contact({ profile }: { profile: Profile | null }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const to = profile?.email || '';
    const subject = encodeURIComponent(`Portfolio inquiry from ${name || 'a visitor'}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }

  return (
    <section id="contact" className="section contact">
      <div className="contact__blob" aria-hidden="true" />
      <div className="container contact__grid">
        <Reveal className="contact__intro">
          <p className="eyebrow">05 — Contact</p>
          <h2 className="section-title">Let's build something together</h2>
          <p className="section-desc" style={{ marginBottom: 30 }}>
            Open to freelance work, internships, and collaborations. Drop a message and I'll get back to you soon.
          </p>

          <div className="contact__info">
            {profile?.email && (
              <div className="contact__info-row">
                <span className="contact__info-icon"><i className="bi bi-envelope" /></span>
                <div>
                  <p>Email</p>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </div>
              </div>
            )}
            {profile?.location && (
              <div className="contact__info-row">
                <span className="contact__info-icon"><i className="bi bi-geo-alt" /></span>
                <div>
                  <p>Based in</p>
                  <span>{profile.location}</span>
                </div>
              </div>
            )}
            <div className="contact__info-row">
              <span className="contact__info-icon"><i className="bi bi-clock-history" /></span>
              <div>
                <p>Availability</p>
                <span className="contact__badge"><span className="contact__dot" /> Open to new projects</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100} className="contact__form-wrap">
          <form className="contact__form card card-glow" onSubmit={handleSubmit}>
            <div className="contact__form-row">
              <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <input required type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <textarea required rows={5} placeholder="Tell me about your project…" value={msg} onChange={(e) => setMsg(e.target.value)} />
            <button className="btn btn-primary" type="submit">
              <i className="bi bi-send" /> Send message
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
