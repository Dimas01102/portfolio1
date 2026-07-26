import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const LINKS = [
  { label: 'Home', hash: '/' },
  { label: 'About', hash: '#about' },
  { label: 'Skills', hash: '#skills' },
  { label: 'Projects', hash: '/projects' },
  { label: 'Certificates', hash: '#certificates' },
  { label: 'Blog', hash: '/blog' },
  { label: 'Contact', hash: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleNav(hash: string) {
    if (hash.startsWith('/')) {
      navigate(hash);
      return;
    }
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <header className={`nav-wrap ${scrolled ? 'nav-wrap--scrolled' : ''}`}>
      <div className="nav">
        <Link to="/" className="nav__logo">
          <span className="nav__logo-mark">{'</>'}</span>
          <span className="nav__logo-text">Dimas<span>.dev</span></span>
        </Link>

        <nav className="nav__links">
          {LINKS.map((l) => (
            <button key={l.label} className="nav__link" onClick={() => handleNav(l.hash)}>
              {l.label}
            </button>
          ))}
        </nav>

        <button
          className="nav__theme-btn"
          aria-label="Toggle theme"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        >
          <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`} />
        </button>
      </div>
    </header>
  );
}
