import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './admin.css';

const NAV = [
  { to: '/admin', label: 'Overview', end: true, icon: 'bi-speedometer2' },
  { to: '/admin/profile', label: 'Profile & photo', icon: 'bi-person-circle' },
  { to: '/admin/skills', label: 'Skills', icon: 'bi-stars' },
  { to: '/admin/certificates', label: 'Certificates', icon: 'bi-patch-check' },
  { to: '/admin/projects', label: 'Projects', icon: 'bi-kanban' },
  { to: '/admin/blog', label: 'Blog posts', icon: 'bi-journal-text' },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span>{'</>'}</span> Admin
        </div>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}>
              <i className={`bi ${n.icon}`} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <NavLink to="/" className="admin-nav-link">
            <i className="bi bi-box-arrow-up-right" /> View site
          </NavLink>
          <button
            className="admin-nav-link admin-nav-link--btn"
            onClick={async () => {
              await signOut();
              navigate('/admin/login');
            }}
          >
            <i className="bi bi-box-arrow-right" /> Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
