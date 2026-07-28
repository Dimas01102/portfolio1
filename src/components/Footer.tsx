import { Link } from 'react-router-dom';
import './Footer.css';

const SOCIALS = [
  { icon: 'bi-github', href: 'https://github.com/' },
  { icon: 'bi-linkedin', href: 'https://linkedin.com/' },
  { icon: 'bi-instagram', href: 'https://instagram.com/' },
  { icon: 'bi-envelope-fill', href: 'mailto:hello@example.com' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__glow" />
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__mark">{'</>'}</span>
          <div>
            <p className="site-footer__name">Dimas Dwi Prasetiyo</p>
            <p className="site-footer__tag">Fullstack Developer, building things one commit at a time.</p>
          </div>
        </div>

        <nav className="site-footer__links">
          <Link to="/">Home</Link>
          <Link to="/#about">About</Link>
          <Link to="/#skills">Skills</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/games">Games</Link>
          <Link to="/#certificates">Certificates</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/#contact">Contact</Link>
        </nav>

        <div className="site-footer__socials">
          {SOCIALS.map((s) => (
            <a key={s.icon} href={s.href} target="_blank" rel="noreferrer" aria-label={s.icon}>
              <i className={`bi ${s.icon}`} />
            </a>
          ))}
        </div>
      </div>
      <div className="container">
        <p className="site-footer__bottom">© {new Date().getFullYear()} Dimas Dwi Prasetiyo. All rights reserved.</p>
      </div>
    </footer>
  );
}
