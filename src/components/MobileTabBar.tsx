import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MobileTabBar.css';

const TABS = [
  { key: 'skills', icon: 'bi-star', hash: '#skills' },
  { key: 'about', icon: 'bi-people', hash: '#about' },
  { key: 'home', icon: 'bi-house-door-fill', hash: '/' },
  { key: 'projects', icon: 'bi-building', hash: '/projects' },
  { key: 'certificates', icon: 'bi-mortarboard', hash: '#certificates' },
];

export default function MobileTabBar() {
  const [active, setActive] = useState('home');
  const [pop, setPop] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/projects') setActive('projects');
    else if (location.pathname === '/') setActive('home');
  }, [location.pathname]);

  function handleTap(tab: (typeof TABS)[number]) {
    setActive(tab.key);
    setPop(tab.key);
    setTimeout(() => setPop(null), 320);

    if (tab.hash.startsWith('/')) {
      navigate(tab.hash);
      return;
    }
    if (location.pathname !== '/') {
      navigate('/' + tab.hash);
    } else {
      document.querySelector(tab.hash)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <nav className="mtab" aria-label="Mobile navigation">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`mtab__btn ${active === tab.key ? 'is-active' : ''} ${pop === tab.key ? 'is-pop' : ''} ${
            tab.key === 'home' ? 'mtab__btn--home' : ''
          }`}
          onClick={() => handleTap(tab)}
          aria-label={tab.key}
        >
          <i className={`bi ${tab.icon}`} />
        </button>
      ))}
    </nav>
  );
}
