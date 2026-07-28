import { useEffect, useState, lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileTabBar from './components/MobileTabBar';
import SocialDock from './components/SocialDock';
import ScrollToTop from './components/ScrollToTop';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPostPage from './pages/BlogPost';
import ProjectsPage from './pages/Projects';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import AdminSkills from './pages/admin/AdminSkills';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminBlog from './pages/admin/AdminBlog';
import AdminProjects from './pages/admin/AdminProjects';
import AdminGames from './pages/admin/AdminGames';
import ProtectedRoute from './components/ProtectedRoute';

const Games = lazy(() => import('./pages/Games'));

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <SocialDock />
      {children}
      <Footer />
      <MobileTabBar />
      <ScrollToTop />
      <ChatBot />
    </>
  );
}

function useCardGlow() {
  useEffect(() => {
    let raf = 0;
    function handle(e: PointerEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = (e.target as HTMLElement)?.closest?.('.card-glow') as HTMLElement | null;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        el.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    }
    document.addEventListener('pointermove', handle, { passive: true });
    return () => {
      document.removeEventListener('pointermove', handle);
      cancelAnimationFrame(raf);
    };
  }, []);
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  useCardGlow();

  useEffect(() => {
    if (sessionStorage.getItem('booted')) setBooted(true);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  function finishBoot() {
    sessionStorage.setItem('booted', '1');
    setBooted(true);
  }

  return (
    <AuthProvider>
      {!booted && !isAdminRoute && <Loader onDone={finishBoot} />}
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogPostPage /></PublicLayout>} />
        <Route path="/projects" element={<PublicLayout><ProjectsPage /></PublicLayout>} />
        <Route
          path="/games/*"
          element={
            <PublicLayout>
              <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
                <Games />
              </Suspense>
            </PublicLayout>
          }
        />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="games" element={<AdminGames />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}