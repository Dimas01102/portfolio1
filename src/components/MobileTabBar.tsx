import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { goToSection } from '../lib/nav';
import './MobileTabBar.css';

const TABS = [
  { key: 'about', label: 'About', icon: 'bi-person-lines-fill', hash: '#about' },
  { key: 'skills', label: 'Skills', icon: 'bi-star', hash: '#skills' },
  { key: 'projects', label: 'Projects', icon: 'bi-building', hash: '/projects' },
  { key: 'home', label: 'Home', icon: 'bi-house-door-fill', hash: '/' },
  { key: 'games', label: 'Games', icon: 'bi-joystick', hash: '/games' },
  { key: 'certificates', label: 'Certificates', icon: 'bi-mortarboard', hash: '#certificates' },
  { key: 'blog', label: 'Blog', icon: 'bi-journal-text', hash: '/blog' },
  { key: 'contact', label: 'Contact', icon: 'bi-envelope', hash: '#contact' },
];

const SCROLL_SECTION_IDS = ['home', 'about', 'skills', 'certificates', 'contact'];

export default function MobileTabBar() {
  const [active, setActive] = useState('home');
  const [pop, setPop] = useState<string | null>(null);
  const [notchX, setNotchX] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navRef = useRef<HTMLElement | null>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const suppressScrollSpy = useRef(false);

  const updateNotch = useCallback(() => {
    const nav = navRef.current;
    const btn = btnRefs.current[active];
    if (!nav || !btn) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setNotchX(btnRect.left - navRect.left + btnRect.width / 2);
  }, [active]);

  useLayoutEffect(() => {
    updateNotch();
  }, [updateNotch]);

  useEffect(() => {
    window.addEventListener('resize', updateNotch);
    window.addEventListener('orientationchange', updateNotch);
    return () => {
      window.removeEventListener('resize', updateNotch);
      window.removeEventListener('orientationchange', updateNotch);
    };
  }, [updateNotch]);

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
      else if (!hash) setActive('home');
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== '/') return;

    const els = SCROLL_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el
    );
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressScrollSpy.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  function handleTap(tab: (typeof TABS)[number]) {
    setActive(tab.key);
    setPop(tab.key);
    suppressScrollSpy.current = true;
    setTimeout(() => setPop(null), 350);
    setTimeout(() => {
      suppressScrollSpy.current = false;
    }, 700);
    goToSection(navigate, location.pathname, tab.hash);
  }

  const navStyle: CSSProperties | undefined =
    notchX !== null ? ({ '--notch-x': `${notchX}px` } as CSSProperties) : undefined;

  return (
    <nav className="mtab" aria-label="Mobile navigation" ref={navRef} style={navStyle}>
      <span className="mtab__notch" aria-hidden="true" />
      {TABS.map((tab) => (
        <button
          key={tab.key}
          ref={(el) => {
            btnRefs.current[tab.key] = el;
          }}
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