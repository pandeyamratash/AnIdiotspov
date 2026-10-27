
import { Outlet } from "react-router-dom";
import "../styles/admin.css";
import AdminNavbar from "../components/AdminNavbar";export default function AdminLayout() {
  return (
    <div className="admin-shell editor-only-shell">
      <AdminNavbar />
      <main className="admin-content editor-only-content">
        <Outlet />
      </main>
    </div>
  );
}
