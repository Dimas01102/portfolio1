import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { goToSection } from '../lib/nav';
import './MobileTabBar.css';

const TABS = [
  { key: 'about', label: 'About', icon: 'bi-person-lines-fill', hash: '#about' },
  { key: 'skills', label: 'Skills', icon: 'bi-star', hash: '#skills' },
  { key: 'projects', label: 'Projects', icon: 'bi-building', hash: '/projects' },
  { key: 'home', label: 'Home', icon: 'bi-house-door-fill', hash: '/' }, // Berada di urutan ke-4, digeser ke tengah via CSS
  { key: 'games', label: 'Games', icon: 'bi-joystick', hash: '/games' },
  { key: 'certificates', label: 'Certificates', icon: 'bi-mortarboard', hash: '#certificates' },
  { key: 'blog', label: 'Blog', icon: 'bi-journal-text', hash: '/blog' },
  { key: 'contact', label: 'Contact', icon: 'bi-envelope', hash: '#contact' },
];

export default function MobileTabBar() {
  const [active, setActive] = useState('home');
  const [pop, setPop] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const hash = location.hash;

    if (path === '/projects') {
      setActive('projects');
    } else if (path === '/blog') {
      setActive('blog');
    } else if (path.startsWith('/games')) {
      setActive('games');
    } else if (path === '/') {
      if (hash === '#about') setActive('about');
      else if (hash === '#skills') setActive('skills');
      else if (hash === '#certificates') setActive('certificates');
      else if (hash === '#contact') setActive('contact');
      else setActive('home');
    }
  }, [location.pathname, location.hash]);

  function handleTap(tab: (typeof TABS)[number]) {
    setActive(tab.key);
    setPop(tab.key);
    setTimeout(() => setPop(null), 350); 
    goToSection(navigate, location.pathname, tab.hash);
  }

  return (
    <nav className="mtab" aria-label="Mobile navigation">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`mtab__btn ${active === tab.key ? 'is-active' : ''} ${pop === tab.key ? 'is-pop' : ''}`}
          onClick={() => handleTap(tab)}
          aria-label={tab.label}
        >
          <i className={`bi ${tab.icon}`} />
        </button>
      ))}
    </nav>
  );
}