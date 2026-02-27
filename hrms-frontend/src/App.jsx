import { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarCheck, Building2,
  Sun, Moon, ChevronRight
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';

export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Building2 size={20} strokeWidth={2} color="white" />
        </div>
        <div>
          <div className="logo-text">HRMS Lite</div>
          <div className="logo-sub">Admin Console</div>
        </div>
      </div>

      <div className="nav-group">
        <div className="nav-label">Main Menu</div>
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} strokeWidth={1.8} className="nav-icon" />
            <span>{label}</span>
            <ChevronRight size={14} className="nav-arrow" strokeWidth={2} />
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-version">v1.0.0 · {new Date().getFullYear()}</div>
      </div>
    </aside>
  );
}

function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="topbar">
      <span className="topbar-date">{today}</span>
      <div className="topbar-right">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark'
            ? <Sun size={17} strokeWidth={2} />
            : <Moon size={17} strokeWidth={2} />}
        </button>
        <div className="topbar-user">
          <span>Admin</span>
          <div className="avatar">A</div>
        </div>
      </div>
    </div>
  );
}

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('hrms-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hrms-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}