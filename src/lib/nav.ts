import type { NavigateFunction } from 'react-router-dom';

export function goToSection(navigate: NavigateFunction, pathname: string, hash: string) {
  if (hash === '/') {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
    return;
  }

  if (hash.startsWith('/')) {
    navigate(hash);
    return;
  }

  if (pathname !== '/') {
    navigate('/' + hash);
  } else {
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
  }
}