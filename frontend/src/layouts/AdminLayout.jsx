
import { Outlet } from "react-router-dom";
import "../styles/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell editor-only-shell">
      <main className="admin-content editor-only-content">
        <Outlet />
      </main>
    </div>
  );
}
