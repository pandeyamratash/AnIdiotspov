import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, PenLine } from "lucide-react";
import "../styles/AdminNavbar.css";

const navItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Write",
    path: "/admin/editor",
    icon: PenLine,
  },
  {
    label: "Public site",
    path: "/",
    icon: FileText,
  },
];

export default function AdminNavbar() {
  return (
    <header className="admin-navbar">
      <NavLink to="/admin" className="admin-brand">
        <span className="admin-brand-mark">a.</span>
        <span className="admin-brand-name">
          An idiots pov
        </span>
      </NavLink>

      <nav className="admin-nav-links" aria-label="Admin navigation">
        {navItems.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}